import React, { Component } from 'react';
import { Observable } from 'rxjs';
import { DOM } from 'rx-dom';
import { XYPlot, LineSeries } from 'react-vis';
import '../node_modules/react-vis/dist/style.css';
import { map, range } from 'underscore';
import './App.css';

var openingObserver = {
    onNext: function (x) {
        console.log('Opening socket');
    },
    onError: function (err) {
        console.log('Opening socket error');        
    },
    onCompleted: function () {
        console.log('Completed');
    }
};
var closingObserver = {
    onNext: function (x) {
        console.log('Closing socket');        
    },
    onError: function (err) {
        console.log('Closing socket error');
    },
    onCompleted: function () {
        console.log('Completed');
    }
};

const WS_HOST = "ws://10.21.97.29:8412";


class QueryTopRanking extends React.Component {
    constructor() {
	super();

        console.log("cons");

        this.stateSocket = DOM.fromWebSocket(WS_HOST +'/collector', null, openingObserver, closingObserver);

        this.collector = this.stateSocket.map(function(e){
            let obj = JSON.parse(e.data);
            return obj;
        });
        
        this.state = {
            queries: []
        };
        this.queryMap = {};
    }
    
    componentDidMount() {
        let that = this;
	this.collector.subscribe(
	    function(obj) {
                let lastQueries = that.state.queries;
                map(obj.groups, (v, k) => {
                    v.key = k;
                    
                    let lastQuery = that.queryMap[k];
                    var chartData; 
                    if (lastQuery) {
                        chartData = lastQuery.chartData;
                    } else {
                        chartData = map(range(20), i => { return {y: 0, x: i}; });
                    }
                    chartData.push({y: v.success, x: 0});
                    chartData = chartData.slice(-20);
                    for (var i = 0; i < chartData.length; i++) {
                        chartData[i].x = i;
                    }
                    v.chartData = chartData;
                    
                    that.queryMap[k] = v;
                });

                let queries = map(that.queryMap, (v, k) => {
                    return v;
                });

                that.setState({
                    queries: queries
                });
	    }
	);
    }
    
    render() {
        let queries = map(this.state.queries, q => {
            return (
                <tr key={q.key}>
                  <td>{q.key}</td>
                  <td>
                    <XYPlot height={100} width={300}>
                      <LineSeries data={q.chartData} />
                    </XYPlot>
                  </td>
                  <td>{q.success}</td>
                  <td>{q.failed}</td>                  
                </tr>
            );
        });
        
	return (
	    <table className="build">
              <tbody>
		<tr>
		  <th>query</th>
		  <th>qps_chart</th>
		  <th>succ</th>
		  <th>fail</th>
		</tr>
                {queries}
              </tbody>
	    </table>
	);
    }
}

class App extends Component {
    render() {
	return (
	    <div className="App">
	      <br/>
	      <br/>
	      <br/>
              <center>
		<QueryTopRanking />
              </center>
	    </div>
	);
    }
}

export default App;
