const BaseService = require('./baseService');
const EmailSMTP = require("../models/emailSMTPModel");
const constants = require('../utils/constants');
const {getValueQuery} = require('../modules/mySQL');

class EmailSMTPService extends BaseService {
    constructor() {
        super(EmailSMTP);
    }

    async createEmail(data) {
        const rs = await EmailSMTP.findOneAndUpdate({default: true}, {$push: {to: {email: data}}}, {new: true});
        if (!rs) {
            throw {...constants.errors.NOT_FIND_OBJECT, desc: 'Cannot find'};
        }
        return rs;
    }

    async createRulerMeters(data) {
        const queryCreateRuleMeter = `INSERT INTO alarm_settings (operator, value_single, value_from, value_to, meter_param_id) VALUES ("${data.operator}",${data.value_single || null},${data.value_from || null},${data.value_to || null},${data.meter_param_id})`;
        const parameterMeters = await getValueQuery(queryCreateRuleMeter);
        const queryCreateToAlarmSettingMeter = `INSERT INTO alarm_setting_meter (alarm_setting_id, meter_id) VALUES (${parameterMeters.insertId}, ${data.meter_id})`;
        await getValueQuery(queryCreateToAlarmSettingMeter);
        return parameterMeters || {}
    }

    async showEmail() {
        const rs = await EmailSMTP.findOne({default: true});
        if (!rs) {
            throw {...constants.errors.NOT_FIND_OBJECT, desc: 'Cannot find'};
        }
        return rs;
    }

    async showMeter() {
        try {
            const queryParameterMeters = "select name, id from meter_params";
            const queryMeters = "select name, id, area from meters";
            const parameterMeters = await getValueQuery(queryParameterMeters);
            const meters = await getValueQuery(queryMeters);
            return {parameterMeters: parameterMeters || [], meters: meters || []}
        } catch (e) {
            return false
        }
    }

    async removeEmail(query) {
        const rs = await EmailSMTP.findOneAndUpdate({default: true}, {$pull: {"to": query}}, {new: true});
        if (!rs) {
            throw {...constants.errors.NOT_FIND_OBJECT, desc: 'Cannot find'};
        }
        return rs;
    }

}

module.exports = new EmailSMTPService();