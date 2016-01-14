import React from 'react';

import BenchStore from '../stores/BenchStore';
import BenchNav from './BenchNav.react';
import BenchOverview from './BenchOverview.react';
import BenchGraphs from './BenchGraphs.react';
import BenchReports from './BenchReports.react';
import BenchScenario from './BenchScenario.react';
import NewBench from './NewBench.react';
import BenchLog from './BenchLog.react';
import LoadingSpinner from './LoadingSpinner.react';
import Highlight from './Highlight.react';

class Bench extends React.Component {
    constructor(props) {
        super(props);
        this.state = this._resolveState();
        this._onChange = this._onChange.bind(this);
    }

    componentDidMount() {
        BenchStore.onChange(this._onChange);
    }

    componentWillUnmount() {
        BenchStore.off(this._onChange);
    }

    renderActiveTab() {
        let component;
        switch (this.state.tab) {
            case "graphs":
                component = <BenchGraphs bench = {this.state.bench} activeGraph = {this.state.activeGraph}/>;
                break;
            case "reports":
                component = <BenchReports bench = {this.state.bench } />;
                break;
            case "scenario":
                component = <BenchScenario bench = {this.state.bench} />;
                break;
            case "logs":
                component = <BenchLog bench = {this.state.bench} />;
                break;
            default:
                component = <BenchOverview bench = {this.state.bench} activeGraph = {this.state.activeGraph}/>;
                break;

        }
        return component;
    }

    renderLoadingSpinner() {
        return (<LoadingSpinner>Loading...</LoadingSpinner>);
    }

    renderUnknownBench() {
        return (
            <div className="alert alert-warning" role="alert">
                <strong>Oh snap!</strong>&nbsp;
                Cant find benchmark
            </div>
        );
    }

    render() {
        if (!this.state.isLoaded) {
            return this.renderLoadingSpinner();
        }

        if (this.state.isNewSelected) {
            return <NewBench bench={BenchStore.getNewBench()} clouds={BenchStore.getClouds()}/>;
        }

        if (!this.state.bench) {
            return this.renderUnknownBench();
        }

        return (
            <div key={this.state.bench.id}>
                <BenchNav bench={this.state.bench} selectedTab={this.state.tab} />
                { this.renderActiveTab() }
            </div>
        );
    }

    _resolveState() {
        if (!BenchStore.isLoaded()) {
            return { isLoaded: false };
        }

        if (BenchStore.isNewSelected()) {
            return { isLoaded: true, isNewSelected: true };
        }

        return {
            isLoaded: true,
            isNewSelected: false,
            bench: BenchStore.getSelectedBench(),
            tab: BenchStore.getActiveTab(),
            activeGraph: BenchStore.getSelectedGraph()
        };
    }

    _onChange() {
        this.setState(this._resolveState());
    }
}

export default Bench;
