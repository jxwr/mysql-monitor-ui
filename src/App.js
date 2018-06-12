import React, { Component } from 'react';
import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
import { DOM } from 'rx-dom';
import { map, filter, switchMap } from 'rxjs/operators';
import { LineChart, Line } from 'recharts';
import './App.css';

const data = [
    {uv: 4000},
    {uv: 3000},
    {uv: 2000},
    {uv: 2780},
    {uv: 1890},
    {uv: 2390},
    {uv: 3490},
];

var openingObserver = Observable.create(function() { console.log('Opening socket'); });
var closingObserver = Observable.create(function() { console.log('Closing socket'); });

console.log(DOM.fromWebSocket);

const WS_HOST = "";

var stateSocket = DOM.fromWebSocket(WS_HOST +'/collector', null, openingObserver, closingObserver);
var collector = stateSocket.map(function(e){
    return e;
});

class QueryTopRanking extends React.Component {
    constructor() {
	
    }
    
    componentDidMount() {
	collector.subscribe(
	    function(obj) {
		console.log(obj);
	    }
	);
    }
    
    render() {
	return (
	    <table className="build">
              <tbody>
		<tr>
		  <th>query</th>
		  <th>qps_chart</th>
		  <th>qps</th>
		  <th>avg</th>
		</tr>
		<tr>
		  <td>select</td>
		  <td>
		    <LineChart width={200} height={50} data={data}>
		      <Line type="monotone" dataKey="uv" stroke="#8884d8" />
		    </LineChart>
		  </td>
		  <td>120</td>
		  <td>20 ms</td>
		</tr>
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
