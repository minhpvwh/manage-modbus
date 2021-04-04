const BaseService = require('./baseService');
const EmailSMTP = require("../models/emailSMTPModel");
const {getValueQuery} = require('../modules/mySQL');

class EmailSMTPService extends BaseService {
    constructor() {
        super(EmailSMTP);
    }

    async createRulerMeters(data) {
        console.log(data);
        const queryCreateRuleMeter = `INSERT INTO alarm_settings (operator, value_single, value_from, value_to, meter_param_id, message, group_id) VALUES ("${data.operator}",${data.value_single || null},${data.value_from || null},${data.value_to || null},${data.meter_param_id}, "${data.message}", ${data.group_id})`;
        const parameterMeters = await getValueQuery(queryCreateRuleMeter);
        return parameterMeters || {}
    }

    async createRulerGroup(data) {
        const queryCreateRuleGroup = `INSERT INTO alarm_setting_groups (name, description) VALUES ("${data.name || null}", "${data.description || null}")`;
        const ruleGroup = await getValueQuery(queryCreateRuleGroup);
        return ruleGroup || {}
    }

    async showMeter({query = {}, fields = "", page = 0, size = 5, sorts = undefined, populate = []} = {}) {
        try {
            const queryParameterMeters = "select name, id from meter_params";
            const queryMeters = `select name, id, area, alarm_group_id from meters limit ${size} offset ${size * page}`;
            const queryCountMeters = "select count(id) as count from meters";
            const queryRuleGroups = "select id, name from alarm_setting_groups";
            const parameterMeters = await getValueQuery(queryParameterMeters);
            const countMeter = await getValueQuery(queryCountMeters);
            const meters = await getValueQuery(queryMeters);
            const ruleGroups = await getValueQuery(queryRuleGroups);
            const numberPage = size > 0 ? Math.ceil((countMeter[0].count / size)) : 0;
            return {ruleGroups: ruleGroups || [], parameterMeters: parameterMeters || [], meters: meters || [], meta: {count: countMeter[0].count, size: size, totalPage: numberPage, page: page}}
        } catch (e) {
            return false
        }
    }

    async showRuleGroups({query = {}, fields = "", page = 0, size = 5, sorts = undefined, populate = []} = {}){
        try {
            const queryParameterMeters = "select name, id from meter_params";
            const queryRuleGroups = `select name, id, description from alarm_setting_groups limit ${size} offset ${size * page}`;
            const queryCountRuleGroups = "select count(id) as count from alarm_setting_groups";
            const parameterMeters = await getValueQuery(queryParameterMeters);
            const countRuleGroups = await getValueQuery(queryCountRuleGroups);
            const ruleGroups = await getValueQuery(queryRuleGroups);
            const numberPage = size > 0 ? Math.ceil((countRuleGroups[0].count / size)) : 0;
            return {parameterMeters: parameterMeters || [], ruleGroups: ruleGroups || [], meta: {count: countRuleGroups[0].count, size: size, totalPage: numberPage, page: page}}
        } catch (e) {
            return false
        }
    }

    async showRulesMeter(id) {
        const queryRulesMeter = `
                select meter_params.name, alarm_settings.id, operator, value_single, value_from, value_to, message
                from alarm_settings
                inner join meter_params on alarm_settings.meter_param_id = meter_params.id 
                where group_id = ${id}`;
        const rulesMeter = await getValueQuery(queryRulesMeter);
        return {rulesMeter: rulesMeter || []}
    }

    async deleteRulesMeter(ids) {
        if (ids) {
            ids = ids.toString() || '';
            const queryDeleteRulesMeter = `delete from alarm_settings where id in (${ids})`;
            await getValueQuery(queryDeleteRulesMeter);
        }
        return {}
    }

    async editMeter(data) {
        if (data.id && data.alarm_group_id) {
            const queryUpdateMeter = `update meters set alarm_group_id = ${data.alarm_group_id} where id = ${data.id}`;
            await getValueQuery(queryUpdateMeter);
        }
        return {}
    }

    async deleteMeter(id) {
        const queryDeleteMeter = `delete from meters where id = ${id}`;
        await getValueQuery(queryDeleteMeter);
        return {}
    }

    async deleteRuleGroup(id) {
        const queryDeleteRuleGroup = `delete from alarm_setting_groups where id = ${id}`;
        await getValueQuery(queryDeleteRuleGroup);
        return {}
    }

}

module.exports = new EmailSMTPService();