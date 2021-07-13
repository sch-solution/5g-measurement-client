 const shell = require('./shell-man.js');

 function runTest(){
	 let command = "termux-telephony-cellinfo";
	 return shell.exec(command);
 }
 
 module.exports.runTest = runTest;
