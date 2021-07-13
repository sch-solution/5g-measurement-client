const shell = require('./shell-man.js');

function runUploadTest(host, filePath){
	let command = "curl -o /dev/null -s ";
	command += "-w '%{speed_upload}' "; //output is in bytes per second
	command += "-F 'file=@"+filePath+"' ";
	command += host;
	return shell.exec(command);
}
function runDownloadTest(host){
	let command = "curl -o /dev/null -s ";
	command += "-w '%{speed_download}' "; //output is in bytes per second
	command += host;
	return shell.exec(command);
}

module.exports.runUploadTest = runUploadTest;
module.exports.runDownloadTest = runDownloadTest;