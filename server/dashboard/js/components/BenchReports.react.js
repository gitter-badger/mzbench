import React from 'react';
import Modal from './Modal.react';

class BenchReports extends React.Component {
    constructor(props) {
        super(props);

        this._openEmailReport = this._openEmailReport.bind(this);
        this._onSendEmailReport = this._onSendEmailReport.bind(this);
        this._onEmailChange = this._onEmailChange.bind(this);

        this.state = {email: ""};
    }

    componentDidMount() {
        $(React.findDOMNode(this.refs.emailReportModal)).on('shown.bs.modal', () => {
            React.findDOMNode(this.refs.email).focus();
        });
    }

    renderDownloadReportPanel() {
        return (
            <div className="panel panel-default panel-report">
                <div className="panel-heading">
                    <h3 className="panel-title">Download report&nbsp;
                    {this.props.bench.isRunning() ? <small>(email report is enabled for finished benches only)</small> : null}
                    </h3>
                </div>
                <div className="panel-body">
                    <button className="btn btn-primary" type="submit" disabled={this.props.bench.isRunning()} onClick={this._openEmailReport}>Email</button>
                    <a href={`/data?id=${this.props.bench.id}`} target="_blank" className="btn btn-primary" type="submit">Text</a>
                </div>

                <Modal ref="emailReportModal" onOk={this._onSendEmailReport} title="Send Email Report">
                    <form onSubmit={this._onSendEmailReport}>
                        <div className="form-group">
                            <label className="control-label">Email:</label>
                            <input ref="email" type="text" className="form-control" value={this.state.email} onChange={this._onEmailChange}/>
                        </div>
                    </form>
                </Modal>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderDownloadReportPanel()}
            </div>
        );
    }

    _onSendEmailReport(event) {
        let notify = $.notify({message: `Sending report to ${this.state.email}... `}, {type: 'info', delay: 0});
        $.ajax({
            url: `/email_report?id=${this.props.bench.id}&addr=${this.state.email}`,
            success: () => {
                notify.update({message: `Report has been sent to ${this.state.email}`, type: 'success'});
                setTimeout(() => notify.close(), 5000);
            },
            error: () => {
                notify.update({message: `Sending report failed`, type: 'danger'});
                setTimeout(() => notify.close(), 5000);
            }
        });
        event.preventDefault();
        this.refs.emailReportModal.close();
    }

    _openEmailReport() {
        this.refs.emailReportModal.open();
    }

    _onEmailChange(event) {
        this.setState({email: event.target.value});
    }
};

BenchReports.propTypes = {
    bench: React.PropTypes.object.isRequired
};

export default BenchReports;
