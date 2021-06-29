const http = require('https');
const websocket = require('ws');
const axios = require('axios');
const { exit } = require('process');

let ws, relogInterval, accessToken;


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
		await login('ws.5g.schsolution.cz', 443, '/auth/login', 'abcdef');
		try {
			ws = new websocket('wss://ws.5g.schsolution.cz', {headers: {authentication: accessToken}});
			ws.on('open', () => {
				clearInterval(relogInterval);
				console.log('Connection established');
				ws.send(JSON.stringify({type: 'measurement-result', data: { d: 'asd'}}));
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


function handleMessage(message){
	if(message == 'measure'){
		//run iperf
	} else {
		//do samsing els
	}
}




run();