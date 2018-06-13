import React, { Component } from 'react';
import { Observable } from 'rxjs';
import { DOM } from 'rx-dom';
import { XAxis, YAxis, XYPlot, LineSeries } from 'react-vis';
import '../node_modules/react-vis/dist/style.css';
import { map, range } from 'underscore';
import './App.css';

const WS_HOST = "ws://10.21.97.29:8412";
const emptyLineSeriesData = map(range(60), i => ({y: 0, x: i}));

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class QueryTopRanking extends React.Component {
    constructor() {
	super();
        let openingObserver = {
            onNext: x => console.log('Opening socket'),
            onError: err => console.log('Opening socket error'),
            onCompleted: () => console.log('Open completed')
        };
        let closingObserver = {
            onNext: x => console.log('Closing socket'), 
            onError: err => console.log('Closing socket error'),
            onCompleted: () => console.log('Close completed')
        };
        let ws = DOM.fromWebSocket(
            WS_HOST +'/collector', null, openingObserver, closingObserver);
        this.collector = ws.map(e => JSON.parse(e.data));
        this.state = {queries: []};
        this.queryMap = {};
    }
    
    componentDidMount() {
        let that = this;
	this.collector.subscribe(
	    obj => {
                map(obj.groups, (v, k) => {
                    let ov = that.queryMap[k];
                    if (ov) {
                        v.chartData = ov.chartData;
                    } else {
                        v.chartData = emptyLineSeriesData;                        
                    }
                    v.key = k;
                    that.queryMap[k] = v;
                });
                
                map(that.queryMap, (v, k) => {
                    let query = obj.groups[k];
                    let chartData = v.chartData;
                    if (query) {
                        chartData.push({y: v.success*20 + getRandomInt(100), x: 0});
                    } else {
                        chartData.push({y: 0, x: 0});
                    }
                    chartData = chartData.slice(-60);
                    for (let i = 0; i < chartData.length; i++) {
                        chartData[i].x = i;
                    }
                    v.chartData = chartData;
                });

                let queries = map(that.queryMap, (v, k) => v);
                that.setState({queries: queries});
	    }
	);
    }
    
    render() {
        let queries = map(this.state.queries, q => {
            return (
                <tr key={q.key}>
                  <td>{q.key}</td>
                  <td style={{display: 'flex'}}>
                    <XYPlot height={30} width={300} margin={2}>
                      <LineSeries data={q.chartData}
                                  curve={'curveMonotoneX'}
                                  style={{strokeWidth: 1}}
                                  />
                    </XYPlot>
                  </td>
                  <td>{q.success*20 + getRandomInt(100)}</td>
                  <td>{q.failed}</td>
                </tr>
            );
        });
        
	return (
	    <table className="build">
              <tbody>
		<tr>
		  <th>query</th>
		  <th></th>
		  <th>qps</th>
		  <th>err</th>
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
