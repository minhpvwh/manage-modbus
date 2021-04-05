const redis = require("redis");
const config = require("../configs");
const {getValueQuery} = require('./mySQL');
let redisClient;

async function connect() {
    redisClient = redis.createClient({host: config.redisConfig.REDIS_HOST, port: config.redisConfig.REDIS_PORT, db: 1});
    console.log("Connected Redis");
    const queryGetMeters = `select id, alarm_group_id from meters`;
    const getMeters = await getValueQuery(queryGetMeters);
    for (const meter of getMeters) {
        if (meter.alarm_group_id) {
            const queryGetRules = `
                select value_single, value_to, value_from, operator, message, meter_params.code
                from alarm_settings
                inner join meter_params on meter_params.id = alarm_settings.meter_param_id
                where alarm_settings.group_id = ${meter.alarm_group_id}`;
            const rules = await getValueQuery(queryGetRules);
            redisClient.set(meter.id, JSON.stringify(rules));
        } else {
            redisClient.set(meter.id, JSON.stringify([]))
        }
    }
}

async function updateMeterRules(meterId) {
    const queryGetMeter = `select id, alarm_group_id from meters where id = ${meterId}`;
    const getMeter = await getValueQuery(queryGetMeter);
    if (getMeter) {
        if (getMeter[0].alarm_group_id) {
            const queryGetRules = `
            select value_single, value_to, value_from, operator, message, meter_params.code
            from alarm_settings
            inner join meter_params on meter_params.id = alarm_settings.meter_param_id
            where alarm_settings.group_id = ${getMeter[0].alarm_group_id}`;
            const data = await getValueQuery(queryGetRules);
            redisClient.set(meterId, JSON.stringify(data));
        } else {
            redisClient.set(meterId, JSON.stringify([]));
        }
    }
}

async function updateRuleGroups(groupId) {
    const queryGetMeter = `select id from meters where alarm_group_id = ${groupId}`;
    const getMeters = await getValueQuery(queryGetMeter);
    if (getMeters) {
        for(const i of getMeters) {
            await updateMeterRules(i.id);
        }
    }
}

async function deleteMeterRules(meterId) {
    redisClient.set(meterId, JSON.stringify([]));
}

module.exports = {
    connect,
    updateMeterRules,
    deleteMeterRules,
    updateRuleGroups,
};