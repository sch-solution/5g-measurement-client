const http = require('https');
const websocket = require('ws');
const axios = require('axios');
const setCookieParser = require('set-cookie-parser');
const { exit } = require('process');

let ws, relogInterval;

let cookieStorage = {}, myInfo;
cookieStorage.stringify = function(){
	let returnString = '';
	if(this.hasOwnProperty('cookies')){
		this.cookies.forEach(cookie=>{
			returnString += cookie.name+'='+cookie.value+'; ';
		});
	}
	return returnString;
}


async function login(host, port, path, username, password){
	const postData = {
		username: username,
		password: password
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
		cookieStorage.cookies = setCookieParser.parse(response, {decodeValues: true});
		
	} else {

	}
}

async function connectToWebsocket(){
	try {
		await login('ws.5g.schsolution.cz', 443, '/login', '1000', '1000');
		try {
			ws = new websocket('wss://ws.5g.schsolution.cz', {headers: {Cookie: cookieStorage.stringify()}});
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
			console.log('Websocket error');
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
	
}




run();