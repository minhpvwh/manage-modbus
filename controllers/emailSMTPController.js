const emailSMTPService = require('../services/emailSMTPService');
const BaseController = require('./baseController');
const { messageResponse } = require('../utils/constants');
const Utils = require('../utils/utils');

class EmailSMTPController extends BaseController {
    constructor() {
        super(emailSMTPService);
    }

    async showHomePage(req, res){
        return res.redirect('/configs/meters');
    }

    async createRulerMeters(req, res, message = messageResponse.CREATE_SUCCESS) {
        try {
            const rs = await emailSMTPService.createRulerMeters(req.body);
            return res.redirect("/configs/rule-groups");
        } catch (error) {
            console.log("Error create rule:", error);
            return res.render("../views/error", {message: "Error", error: error});
        }
    }

    async createRulerGroup(req, res, message = messageResponse.CREATE_SUCCESS) {
        try {
            const rs = await emailSMTPService.createRulerGroup(req.body);
            return res.redirect("/configs/rule-groups");
        } catch (error) {
            console.log("Error create rule group:", error);
            return res.render("../views/error", {message: "Error", error: error});
        }
    }

    async showRulesMeter(req, res, message =  messageResponse.GET_ALL_SUCCESS) {
        try {
            const rs = await emailSMTPService.showRulesMeter(req.params['id']);
            // return res.render("../views/meterConfig/modals/showRulesMeter", rs);
            return res.send(rs);
        } catch(error) {
            console.log("Error show rules Meter:", error);
            return res.render("../views/error", {message: "Error", error: error});
        }
    }

    async deleteRulesMeter(req, res, message= messageResponse.DELETE_SUCCESS) {
        const rs = await emailSMTPService.deleteRulesMeter(req.body.ids);
        return res.send(rs);
    }

    async editMeter(req, res, message= messageResponse.UPDATE_SUCCESS) {
        try {
            const rs = await emailSMTPService.editMeter(req.body);
            return res.redirect("/configs/meters");
        } catch (error) {
            console.log("Error edit meter");
            return res.redirect("/configs/meters");
        }
    }

    async deleteMeter(req, res, message= messageResponse.DELETE_SUCCESS) {
        try {
            const rs = await emailSMTPService.deleteMeter(req.params['id']);
            return res.redirect("/configs/meters");
        } catch (err) {
            console.log("Error delete meter");
            return res.redirect("/configs/meters");
        }
    }

    async deleteRuleGroup(req, res, message= messageResponse.DELETE_SUCCESS) {
        try {
            const rs = await emailSMTPService.deleteRuleGroup(req.params['id']);
            return res.redirect("/configs/rule-groups");
        } catch (err) {
            console.log("Error delete rule group");
            return res.redirect("/configs/rule-groups");
        }
    }

    async showMeter(req,res, message = messageResponse.GET_SUCCESS) {
        try{
            const { query, fields, page, size, sorts } = await Utils.exportParams(req);
            const rs = await emailSMTPService.showMeter({ query, fields, page, size, sorts });
            return res.render("../views/meterConfig/show", {...rs, rulesMeter: [], activeModal: 'block'});
        } catch(error) {
            console.log("Error show Meter:", error);
            return res.render("../views/error", {message: "Error", error: error});
        }
    }

    async showRuleGroups(req, res, message = messageResponse.GET_ALL_SUCCESS) {
        try{
            const { query, fields, page, size, sorts } = await Utils.exportParams(req);
            const rs = await emailSMTPService.showRuleGroups({ query, fields, page, size, sorts });
            return res.render("../views/groupAlarmSettingConfig/show", rs);
        } catch(error) {
            console.log("Error show rule groups:", error);
            return res.render("../views/error", {message: "Error", error: error});
        }
    }
}

module.exports = new EmailSMTPController();