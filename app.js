//const express = require("express");
const http = require('https');
const websocket = require('ws');


async function login(){
	data = JSON.stringify({
		username: '1000',
		password: this.username
	});

	const options = 
	{
		hostname: 'ws.5g.schsolution.cz',
		port: 443,
		path: '/login',
		method: 'POST',
		headers: {
			'Content-Type':'application/json',
			'Content-Length':data.length
		}
	}

	const req = http.request(options, res => {
		let str='';
		res.on('data', data => {
			str+=data;
		});

		res.on('end', ()=>{
			console.log(str);
		});
	})
	.on('error', err => {
		console.log('error:' + err);
	});

	req.write(data);
	req.end();
}

login().then(
	setTimeout(()=>{
		const ws = new websocket('wss://ws.5g.schsolution.cz');

		ws.on('open', () => {
			console.log('Connection established');
		})
		.on('close', () => {
			console.log('Connection closed');
		})
		.on('message', (data) => {
			console.log(`Received message: ${data}`);
		})
		.on('error', (data) => {
			console.log('websocket error:');
			console.log(data);
		});
	}, (1000*2))//0 sec
);