 const shell = require('./shell-man.js');

 function runTest(host, count){
	 let command = "ping ";
	 command += host + " "; 
	 command += count? ('-c ' + count + ' '):'';
	 return shell.exec(command);
 }
 
 module.exports.runTest = runTest;