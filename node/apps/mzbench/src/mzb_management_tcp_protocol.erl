-module(mzb_management_tcp_protocol).

-behaviour(ranch_protocol).
-behaviour(gen_server).

%% API
-export([start_link/4]).

%% gen_server
-export([init/1,
         init/4,
         handle_call/3,
         handle_cast/2,
         handle_info/2,
         terminate/2,
         code_change/3,
         get_port/0]).

-define(TIMEOUT, 60000).

-record(state, {
    socket :: any(),
    transport :: module()
    }).

%% API.

start_link(Ref, Socket, Transport, Opts) ->
    proc_lib:start_link(?MODULE, init, [Ref, Socket, Transport, Opts]).

dispatch({request, Ref, Msg}, State) ->
    system_log:info("Received request: ~p", [Msg]),
    case handle_message(Msg) of
        {ok, Res} -> send_message({response, Ref, Res}, State);
        {error, Reason} -> system_log:error("Api server message handling error: ~p, Reason: ~p", [Msg, Reason])
    end,
    {noreply, State};

dispatch(close_req, #state{socket = Socket, transport = Transport} = State) ->
    Transport:close(Socket),
    {stop, normal, State};

dispatch(Unhandled, State) ->
    system_log:error("Unhandled tcp message: ~p", [Unhandled]),
    {noreply, State}.

get_port() ->
    ranch:get_port(management_tcp_server).

handle_message({change_env, Env}) ->
    {ok, mzb_director:change_env(Env)};

handle_message({get_log_port, Node}) ->
    case rpc:call(Node, mzb_lager_tcp_protocol, get_port, []) of
        {badrpc, Reason} -> {error, {badrpc, Node, Reason}};
        Port -> {ok, Port}
    end;

handle_message(Msg) ->
    {error, {unhandled, Msg}}.

init([State]) -> {ok, State}.

init(Ref, Socket, Transport, _Opts = []) ->
    ok = proc_lib:init_ack({ok, self()}),
    ok = ranch:accept_ack(Ref),
    ok = Transport:setopts(Socket, [{active, true}, {packet, 4}, binary]),

    gen_event:add_handler(metrics_event_manager, {mzb_exometer_report_apiserver, self()}, [self()]),
    gen_server:enter_loop(?MODULE, [], #state{socket=Socket, transport=Transport}, ?TIMEOUT).

handle_info({tcp_closed, _Socket}, State) ->
    {stop, normal, State};

handle_info(timeout, State) ->
    {stop, normal, State};

handle_info({tcp, Socket, Msg}, State = #state{socket = Socket}) ->
    dispatch(erlang:binary_to_term(Msg), State);

handle_info({tcp_error, _, Reason}, State) ->
    system_log:warning("~p was closed with error: ~p", [?MODULE, Reason]),
    {stop, Reason, State};

handle_info(Info, State) ->
    system_log:error("~p has received unexpected info: ~p", [?MODULE, Info]),
    {stop, normal, State}.

handle_cast(Msg, State) ->
    system_log:error("~p has received unexpected cast: ~p", [?MODULE, Msg]),
    {noreply, State}.

handle_call({report, [Probe, _DataPoint, Value]}, _From, State = #state{}) ->
    Name = string:join(Probe, "."),
    Metric = io_lib:format("~B\t~p~n", [unix_time(), Value]),
    send_message({metric_value, Name, Metric}, State),
    {reply, ok, State};

handle_call(Request, _From, State) ->
    system_log:error("~p has received unexpected call: ~p", [?MODULE, Request]),
    {reply, ignore, State}.

terminate(_Reason, _State) ->
    gen_event:delete_handler(metrics_event_manager, {mzb_exometer_report_apiserver, self()}, []),
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

unix_time() ->
    {Mega, Secs, _} = os:timestamp(),
    Mega * 1000000 + Secs.

send_message(Msg, #state{socket = Socket, transport = Transport}) ->
    Transport:send(Socket, erlang:term_to_binary(Msg)).
