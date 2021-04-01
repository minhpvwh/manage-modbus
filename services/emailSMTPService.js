const BaseService = require('./baseService');
const EmailSMTP = require("../models/emailSMTPModel");
const {getValueQuery} = require('../modules/mySQL');

class EmailSMTPService extends BaseService {
    constructor() {
        super(EmailSMTP);
    }

    async createRulerMeters(data) {
        const queryCreateRuleMeter = `INSERT INTO alarm_settings (operator, value_single, value_from, value_to, meter_param_id) VALUES ("${data.operator}",${data.value_single || null},${data.value_from || null},${data.value_to || null},${data.meter_param_id})`;
        const parameterMeters = await getValueQuery(queryCreateRuleMeter);
        const queryCreateToAlarmSettingMeter = `INSERT INTO alarm_setting_meter (alarm_setting_id, meter_id) VALUES (${parameterMeters.insertId}, ${data.meter_id})`;
        await getValueQuery(queryCreateToAlarmSettingMeter);
        return parameterMeters || {}
    }

    async showMeter({query = {}, fields = "", page = 0, size = 5, sorts = undefined, populate = []} = {}) {
        try {
            const queryParameterMeters = "select name, id from meter_params";
            const queryMeters = `select name, id, area from meters limit ${size} offset ${size * page}`;
            const queryCountMeters = "select count(id) as count from meters";
            const parameterMeters = await getValueQuery(queryParameterMeters);
            const countMeter = await getValueQuery(queryCountMeters);
            const meters = await getValueQuery(queryMeters);
            const numberPage = size > 0 ? Math.ceil((countMeter[0].count / size)) : 0;
            console.log(numberPage)
            return {parameterMeters: parameterMeters || [], meters: meters || [], meta: {count: countMeter[0].count, size: size, totalPage: numberPage, page: page}}
        } catch (e) {
            return false
        }
    }

    async showRulesMeter(id) {
        const queryRulesMeter = `select alarm_settings.id, meters.name, meter_params.name as parameter, alarm_settings.operator, alarm_settings.value_single, alarm_settings.value_from, alarm_settings.value_to
            from alarm_setting_meter
            inner join alarm_settings on alarm_setting_meter.alarm_setting_id = alarm_settings.id
            inner join meters on alarm_setting_meter.meter_id = meters.id
            inner join meter_params on alarm_settings.meter_param_id = meter_params.id
            WHERE alarm_setting_meter.meter_id = ${id}`;
        const rulesMeter = await getValueQuery(queryRulesMeter);
        return {rulesMeter: rulesMeter || []}
    }

    async deleteRulesMeter(ids) {
        if (ids) {
            ids = ids.toString() || '';
            const queryDeleteRulesMeter = `delete from alarm_settings where id in (${ids})`;
            const queryDeleteRulesMeterSettings = `delete from alarm_setting_meter WHERE alarm_setting_id in (${ids.toString()})`;
            await getValueQuery(queryDeleteRulesMeter);
            await getValueQuery(queryDeleteRulesMeterSettings);
        }
        return {}
    }

    async deleteMeter(id) {
        const queryDeleteMeter = `delete from meters where id = ${id}`;
        const queryDeleteMeterSettings = `delete from alarm_setting_meter where meter_id = ${id}`;
        await getValueQuery(queryDeleteMeter);
        await getValueQuery(queryDeleteMeterSettings);
        return {}
    }

}

module.exports = new EmailSMTPService();