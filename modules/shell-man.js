/*
const shell = require('./shell-man.js');
*/

const { exec } = require('child_process');

function execInShell(cmd){
	return new Promise((resolve, reject)=>{
		console.log('executing: '+cmd);
		exec(cmd, (error, stdout, stderr)=>{
			if(error){
				console.warn(error);
			}
			resolve(stdout? stdout: stderr);
		});
	});
}

module.exports.exec = execInShell;
