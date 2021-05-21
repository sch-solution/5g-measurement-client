import asyncio
import pathlib
import ssl
import websockets

async def listen(url):
	async with websockets.connect(url, ssl=True) as ws:
		msg = await ws.recv()
		print(msg)
		ws.close()

async def consumer_handler(websocket, path):
	async for message in websocket:
		await consumer(message)

async def consumer(msgg):
	print(msgg)
	
asyncio.get_event_loop().run_until_complete(listen("wss://ws.5g.schsolution.cz/"))