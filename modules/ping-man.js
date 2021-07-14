 const shell = require('./shell-man.js');

 function runTest(host, count){
	 let command = "ping ";
	 command += count? ('-c ' + count + ' '):'';
	 command += host + " "; 
	 return shell.exec(command);
 }
 
 module.exports.runTest = runTest;