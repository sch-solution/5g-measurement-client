const shell = require('./shell-man.js');

 function runTest(host){
	 let command = "tracepath ";
	 command += host;
	 return shell.exec(command);
 }
 
 module.exports.runTest = runTest;
