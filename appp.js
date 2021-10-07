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
const connectionInfoManager = require('./modules/conn-info-man');

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
				clearInterval(relogInterval);
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
	clearInterval(relogInterval);
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
			
			case 'error':
				console.log('received error message: ^^^^^^');
			break;

			case 'info':
				//console.log('received info message: ' + messageData.data.message);
			break;

			case 'request':
				const { payload } = messageData;
				new Promise((resolve, reject)=>{
					switch(payload.handler){
						case 'gpsLocation':
							gpsManager.runTest().then(result=>{
								responseMessage = {
									handler: 'gpsLocation',
									testType: payload.forTestType,
									options: payload.options,
									data: {
										result: JSONParse(result)
										
										/*{
											latitude: getRandomInRange(-90,90,8),
											longitude: getRandomInRange(-180,180,8),
											altitude: getRandomInRange(0,100,12),
											accuracy: getRandomInRange(10,20,14),
											vertical_accuracy: getRandomInRange(10,20,14),
											bearing: 0.0,
											speed: getRandomInRange(0,5,1),
											elapsedMs: getRandomInRange(10,100,0),
											provider: "gps"
										}*/
									}
								};
								resolve(responseMessage);
							});
						break;
	
						case 'connectionType':
							cellManager.runTest().then(result=>{
								responseMessage = {
									handler: 'connectionType',
									testType: payload.forTestType,
									options: payload.options,
									data: {
										result: JSONParse(result)
									}
								};
								resolve(responseMessage);
							});
						break;
	
						case 'connectionInfo':
							connectionInfoManager.runTest().then(result=>{
								responseMessage = {
									handler: 'connectionInfo',
									testType: payload.forTestType,
									options: payload.options,
									data: {
										result: JSONParse(result)
									}
								};
								resolve(responseMessage);
							});
						break;
	
						case 'ping':
							pingManager.runTest(payload.options.host, 10)
							.then(result=>{
								responseMessage = {
									handler: 'ping',
									testType: payload.forTestType,
									options: payload.options,
									data: {
										result
									}
								};
								resolve(responseMessage);
							});
						break;

						case 'traceroute':
							tracerouteManager.runTest(payload.options.host)
							.then(result=>{
								responseMessage = {
									handler: 'traceroute',
									testType: payload.forTestType,
									options: payload.options,
									data: {
										result
									}
								};
								resolve(responseMessage);
							});
						break;

						case 'curl-upload':
							if(payload.command == 'prepare'){
								testOptions = {};
								testOptions.host = payload.options.url;
								testOptions.fileSize = sizeIsAllowed(payload.options.fileSize)? payload.options.fileSize : '500M';
								payload.options.fileSize = testOptions.fileSize;
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
									responseMessage = {
										handler: 'curl-upload',
										testType: payload.forTestType,
										options: payload.options,
										status: 'ready'
									};
									resolve(responseMessage);
								});
								
							} else if (payload.command == 'run'){
								const beginTime = new Date();

								curlManager.runUploadTest(testOptions.host, testOptions.fileDirName+testOptions.fileName)
								.then(speed=>{
									responseMessage = {
										handler: 'curl-upload',
										testType: payload.forTestType,
										options: payload.options,
										status: 'done',
										data: {
											result: speed,
											fileSize: testOptions.fileSize,
											beginTime,
											endTime: new Date()
										}
									};
									resolve(responseMessage);
								});
							}
						break;
						
						case 'curl-download':
							if(payload.command == 'prepare'){
								testOptions = {};
								testOptions.host = payload.options.url;
								testOptions.fileSize = payload.options.fileSize;
								responseMessage = {
									handler: 'curl-download',
									testType: payload.forTestType,
									options: payload.options,
									status: 'ready'
								}
								resolve(responseMessage);
								
							} else if (payload.command == 'run'){
								const beginTime = new Date();

								curlManager.runDownloadTest(testOptions.host, testOptions.fileDirName+testOptions.fileName)
								.then(speed=>{
									responseMessage = {
										handler: 'curl-download',
										testType: payload.forTestType,
										options: payload.options,
										status: 'done',
										data: {
											result: speed,
											fileSize: testOptions.fileSize,
											beginTime,
											endTime: new Date()
										}
									}
									resolve(responseMessage);
								});
							}
						break;
						
						case 'iperf':

						break;
					}
				}).then(responseMessage=>{
					ws.send(createResponse(messageData.requestId, responseMessage));
				});
			break;

			case 'echo':
				console.log("ECHO MESSAGE-------------------\n\n"+ messageData.message+"\n\n");
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

function createResponse(requestId, payload){
	message = {
		authToken: accessToken,
		type: 'response',
		requestId,
		payload
	}
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

function JSONParse(jsonString){
	let rtn;
	try {
		rtn = JSON.parse(jsonString);
	} catch (err){
		rtn = {
			error: 'json parse error',
			jsonString
		};
	}

	return rtn;
}

run();
