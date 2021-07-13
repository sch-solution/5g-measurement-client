/**
 * const iperf = require('./modules/wget-man.js');
 * 
 * 
 */


 const shell = require('./shell-man.js');

 function runTest(host){
	 let command = "wget -O /dev/null ";
	 command += host? (host + ' '):'';
	 //command += '2>&1 | grep -o "[0-9.]\+ [KM]*B/s"';
	 return shell.exec(command);
 }
 
 module.exports.runTest = runTest;