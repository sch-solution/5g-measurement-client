/**
 * const iperf = require('./modules/wget-man.js');
 * 
 * 
 */


 const shell = require('./shell-man.js');

 function runTest(host){
	 let command = "wget -O /dev/null ";
	 command += host? ('-c ' + host + ' '):'';
	 return shell.exec(command);
 }
 
 module.exports.runTest = runTest;