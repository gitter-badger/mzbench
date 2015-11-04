#!/usr/bin/env escript
-mode(compile).

add_libs() ->
    BinDir = filename:dirname(escript:script_name()),
    CodePaths = filelib:wildcard(filename:join(BinDir, "../server/_build/default/deps/*/ebin/")),
    code:add_pathsz(CodePaths).

check_configs({App, List}) ->
    Original = application:get_all_env(App),
    lists:map(fun({X, Y}) -> case Y == proplists:get_value(X, Original) of
                                true -> ok;
                                _ -> io:format("~p should be equal to ~p for ~p", 
                                    [Y, proplists:get_value(X, Original), X]),
                                    erlang:error(default_config_mismatch) end end, List).

main(_) ->
    add_libs(),
    {ok, _} = application:ensure_all_started(mzbench_api),
    {ok, [Terms]} = file:consult("../server/server.config.example"),
    lists:map(fun check_configs/1, Terms),ok.
