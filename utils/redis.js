import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
})

class RedisClient {
    async getData(key) {
        return await redis.get(key);
    }

    async setData(key, value, ttl = 3600) {
        return await redis.set(key, value, 'EX', ttl); // TTL = Time to live
    }

    async deleteData(key) {
        return await redis.del(key);
    }

    async hasKey(key) {
        return (await redis.exists(key)) === 1;
    }
}

export default new RedisClient();