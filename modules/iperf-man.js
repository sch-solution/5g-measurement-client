/**
 * const iperf = require('./modules/iperf-man.js');
 * iperf.runTest('ch.iperf.014.fr', 18815, true).then(res=>console.log(res));
 * 
 */


 const shell = require('./shell-man.js');

 function runTest(host, port, json){
	 let command = "iperf3 ";
	 command += host? ('-c ' + host + ' '):'';
	 command += port? ('-p ' + port + ' '):'';
	 command += json? ('-J' + ' '):'';
	 command += ('-f m' + ' ');
	 return shell.exec(command);
 }
 
 module.exports.runTest = runTest;