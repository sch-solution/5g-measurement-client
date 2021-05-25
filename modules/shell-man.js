/*
const shell = require('./shell-man.js');
*/

const { exec } = require('child_process');
const { resolve } = require('path');

function execInShell(cmd){
	return new Promise((resolve, reject)=>{
		exec(cmd, (error, stdout, stderr)=>{
			if(error){
				console.warn(error);
			}
			resolve(stdout? stdout: stderr);
		});
	});
}

/*
execInShell(iperfCommand)
.then(response=>console.log(response));
*/

module.exports.exec = execInShell;
