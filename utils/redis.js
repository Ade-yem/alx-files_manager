import { createClient } from 'redis';
import { promisify } from 'util'

class RedisClient {
	constructor() {
		this.client = createClient().on('error', (err) => {
			console.log('Redis client not connected to the server:', err);
		});
	}
	isAlive() {
		return this.client.connected;
	}
	async get(key) {
		const get = promisify(this.client.get).bind(this.client);
		return await get(key);
	}
	async set(key, value, duration) {
		const set = promisify(this.client.set).bind(this.client);
		return await set(key, value, 'EX', duration)
	}
	async del(key) {
		const del = promisify(this.client.del).bind(this.client)
		return await del(key)
	}
}

const redisClient = new RedisClient();
module.exports = redisClient;