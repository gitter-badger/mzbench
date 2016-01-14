import React from 'react';
import MZBenchRouter from '../utils/MZBenchRouter';
import MZBenchActions from '../actions/MZBenchActions';
import moment from 'moment';
import 'moment-duration-format';

class BenchSummary extends React.Component {
    _labelCssClass(status) {
        switch (status) {
            case "complete":
                return "label-success";
            case "failed":
                return "label-danger";
            case "stopped":
                return "label-default";
        }
        return "label-info";
    }

    render() {
        let bench = this.props.bench;

        let labelClass = this._labelCssClass(bench.status);

        return (
            <div className="fluid-container">
                <div className="row bench-details">
                    <div className="col-xs-6">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <th scope="row" className="col-xs-2">Scenario</th>
                                    <td>#{bench.id} {bench.scenario}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Duration</th>
                                    <td>{moment.duration(this.props.duration).format("h [hrs], m [min], s [sec]")}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Date</th>
                                    <td>{bench.start_time_client.format("lll")}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Status</th>
                                    <td><span className={`label ${labelClass}`}>{bench.status}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bench-actions col-xs-offset-2 col-xs-4">
                        <div className="text-right">
                            <a type="button" ref="stop" className="btn btn-sm btn-danger" href={MZBenchRouter.buildLink("/stop", {id: this.props.bench.id})}
                                    disabled={!this.props.bench.isRunning()} onClick={this._onClick}>
                                <span className="glyphicon glyphicon-minus-sign"></span> Stop
                            </a>
                        </div>
                        <div className="text-right">
                            <div className="btn-group">
                                <a ref="restart" className="btn btn-sm btn-primary pre-dropdown" href={MZBenchRouter.buildLink("/restart", {id: this.props.bench.id})}
                                        disabled={this.props.bench.isRunning()} onClick={this._onClick}>
                                    <span className="glyphicon glyphicon-refresh"></span> Restart
                                </a>
                                <button className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <span className="caret"></span>
                                </button>
                                <ul className="dropdown-menu">
                                    <li><a href="#" onClick={this._onCloneBench} data-id={this.props.bench.id}>Clone</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    _onCloneBench(event) {
        event.preventDefault();
        MZBenchActions.cloneBench(parseInt($(event.target).data("id")));
        MZBenchRouter.navigate("#/new", {});
    }

    _onClick(event) {
        event.preventDefault();

        let anchor = $(event.target).closest('a');
        if (!anchor.attr('disabled')) {
            $.ajax({url: anchor.attr('href')});
        }
    }
};

BenchSummary.propTypes = {
    bench: React.PropTypes.object.isRequired
};

export default BenchSummary;
