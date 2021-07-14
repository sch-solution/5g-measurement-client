const shell = require('./shell-man.js');

function runTest(){
	let command = "termux-location";
	return shell.exec(command);
}

module.exports.runTest = runTest;