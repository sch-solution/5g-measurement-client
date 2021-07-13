const http = require('https');
const websocket = require('ws');
const axios = require('axios');
const { exit } = require('process');
const jwt = require('jsonwebtoken');
const uuid = require('uuidjs');
const fs = require('fs');
const curlManager = require('./modules/curl-man');
const pingManager = require('./modules/ping-man');
const tracerouteManager = require('./modules/traceroute-man');
const shell = require('./modules/shell-man');
const gpsManager = require('./modules/gps-man');
const cellManager = require('./modules/cell-man');

let ws, relogInterval, accessToken, testOptions;


async function login(host, port, path, token){
	const postData = {
		token
	};
	const postUrl = 'https://'+host+':'+port+path;
	const response = await axios({
		method: 'POST',
		url: postUrl,
		headers: {
			'Content-Type':'application/json'
		},
		data: postData
	});
	if(response.data.status === 'logged'){

		myInfo = response.data.device;
		accessToken = response.data.accessToken;
		
	} else {

	}
}

async function connectToWebsocket(){
	try {
		await login('ws.5g.schsolution.cz', 443, '/auth/login', process.argv[2] || 'abcdef');
		try {
			ws = new websocket('wss://ws.5g.schsolution.cz', {headers: {authentication: accessToken}});
			ws.on('open', () => {
				clearInterval(relogInterval);
				console.log('Connection established');
			})
			.on('close', () => {
				console.log('Connection closed');
				//-----------------------------------------------------------------------------------------------------------------
				relogInterval = setInterval(() => {
					console.log('trying to connect..');
					connectToWebsocket();
				}, 1000*3);
			})
			.on('message', (data) => {
				console.log(`Received message: ${data}`);
				handleMessage(data);
			})
			.on('error', (data) => {
				console.log('websocket error:');
				console.log(data);
			});
		} catch (message){
			console.log('Websocket error: '+message);
		}
		
	} catch (error) {
		console.log('Axios error');
	}
}

async function run(){
	relogInterval = setInterval(() => {
		console.log('trying to connect..');
		connectToWebsocket();
	}, 1000*3);
	//setTimeout(()=>{setInterval(()=>{/*console.log(ws)*/}, 1000*2)}, 1000*2);
}


async function handleMessage(message){
	try {
		const messageData = JSON.parse(message);

		switch(messageData.type){
			case 'gpsLocation':
				gpsManager.runTest()
				.then(result=>{
					ws.send(JSON.stringify({type: 'gpsLocation', data: {testType: messageData.data.forTestType,result: JSON.parse(result)}}));
				});
				break;
			
			// case 'connectionType':
			// 	ws.send(JSON.stringify({type: 'connectionType', data: {testType: messageData.data.forTestType,connectionType:'5G'}}));
			// 	break;
			
			case 'connectionType': // cellinfo 
				cellManager.runTest()
				.then(result=>{
					// console.log(JSON.stringify({type: 'connectionType', data: {testType: messageData.data.forTestType,connectionType: JSON.parse(result)}}));
					ws.send(JSON.stringify({type: 'connectionType', data: {testType: messageData.data.forTestType,connectionType: JSON.parse(result)}}));
				});
				break;
			
			case 'ping':
				pingManager.runTest(messageData.data.host, 10)
				.then(result=>{
					ws.send(JSON.stringify({type: 'ping', data: {testType: messageData.data.forTestType,ping: result}}));
				});
				break;
			
			case 'traceroute':
				tracerouteManager.runTest(messageData.data.host)
				.then(result=>{
					ws.send(JSON.stringify({type: 'traceroute', data: {testType: messageData.data.forTestType,traceroute: result}}));
				});
				break;

			case 'wget':

				break;

			case 'curl-upload':
				if(messageData.data.command == 'prepare'){
					testOptions = {};
					testOptions.host = messageData.data.url;
					testOptions.fileSize = sizeIsAllowed(messageData.data.fileSize)? messageData.data.fileSize : '500M';
					testOptions.fileDirName = __dirname+'/tmp/';
					testOptions.fileName = uuid.generate();


					fs.readdir(testOptions.fileDirName, (err, files)=>{
							files.forEach(file=>{
								if(file != '.gitignore'){
									fs.unlinkSync(testOptions.fileDirName + '/' + file);
								}
							});
						}
					);

					shell.exec('truncate -s '+testOptions.fileSize+' '+testOptions.fileDirName+testOptions.fileName)
					.then(()=>{
						ws.send(createMesssage('curl-upload', {status: 'ready'}));
					});
					
				} else if (messageData.data.command == 'run'){
					const beginTime = new Date();

					curlManager.runUploadTest(testOptions.host, testOptions.fileDirName+testOptions.fileName)
					.then(speed=>{
						ws.send(createMesssage('curl-upload', {status: 'result', result: speed, fileSize: testOptions.fileSize, beginTime, endTime: new Date()}));
					});
					
					
				}
				break;

			case 'curl-download':
				if(messageData.data.command == 'prepare'){
					testOptions = {};
					testOptions.host = messageData.data.url;
					testOptions.fileSize = messageData.data.fileSize;

					ws.send(createMesssage('curl-download', {status: 'ready'}));
					
				} else if (messageData.data.command == 'run'){
					const beginTime = new Date();

					curlManager.runDownloadTest(testOptions.host, testOptions.fileDirName+testOptions.fileName)
					.then(speed=>{
						ws.send(createMesssage('curl-download', {status: 'result', result: speed, fileSize: testOptions.fileSize, beginTime, endTime: new Date()}));
					});
					
					
				}
				break;

			case 'iperf':

				break;

			case 'error':
				console.log('received error message: ^^^^^^');
				break;

			case 'info':
				//console.log('received info message: ' + messageData.data.message);
				break;

			default:
				console.log('unknown message type');
				break;
		}
	} catch(error) {
		console.log(error);
	}
	
}


function createMesssage(type, payload){
	message = {
		authToken: accessToken,
		type: type,
		data: payload
	};
	return JSON.stringify(message);
}

function randomLocation(){
	return getRandomInRange(180,180,3);
}
function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

function sizeIsAllowed(size){
	const sizes = [
		'10M', '20M', '50M',
		'100M', '200M', '500M',
		'1G', '2G', '5G',
		'10G', '20G', '50G'
	];

	return sizes.includes(size);
}

run();
