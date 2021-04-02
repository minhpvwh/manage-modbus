const redis = require("redis");
const config = require("../configs");
let redisClient;

async function connect() {
    redisClient = redis.createClient({host: config.redisConfig.REDIS_HOST, port:config.redisConfig.REDIS_PORT});
    console.log("Connected Redis");
}

module.exports = {
    connect,
};