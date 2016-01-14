import React from 'react';
import moment from 'moment';

class Duration extends React.Component {
    constructor(props) {
        super(props);
        this.state = { duration: this._calculate(props.bench), timeout: undefined };
    }

    componentDidMount() {
        this._createTimer(this.props.bench);
    }

    componentWillUnmount() {
        this._clearTimer();
    }

    componentWillReceiveProps(props) {
        this._clearTimer();
        this._createTimer(props.bench);
    }

    _clearTimer() {
        if (undefined != this.state.timeout) {
            clearTimeout(this.state.timeout);
        }
    }

    _createTimer(bench) {
        let timeout = bench.isRunning() ? setTimeout(() => this._createTimer(bench), 1000) : undefined;
        this.setState({ duration: this._calculate(bench), timeout: timeout });
    }

    _calculate(bench) {
        const lastActiveTime = bench.isRunning() ? moment() : bench.finish_time_client;
        return lastActiveTime.diff(bench.start_time_client);
    }


    renderChildren() {
        return React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child, { duration: this.state.duration });
        });
    }

    render() {
        return (<div>{this.renderChildren()}</div>);
    }
};

Duration.propTypes = {
    bench: React.PropTypes.object.isRequired
};

export default Duration;
