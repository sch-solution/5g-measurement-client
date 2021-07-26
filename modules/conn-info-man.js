const shell = require('./shell-man.js');

function runTest(){
	let command = "termux-telephony-deviceinfo";
	return shell.exec(command);
}

module.exports.runTest = runTest;