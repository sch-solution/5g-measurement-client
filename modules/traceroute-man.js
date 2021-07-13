const shell = require('./shell-man.js');

 function runTest(host){
	 let command = "traceroute ";
	 command += host;
	 return shell.exec(command);
 }
 
 module.exports.runTest = runTest;