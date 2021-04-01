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
            return res.redirect("/configs/meters");
        } catch (error) {
            console.log("Error create rule:", error);
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

    async deleteMeter(req, res, message= messageResponse.DELETE_SUCCESS) {
        try {
            const rs = await emailSMTPService.deleteMeter(req.params['id']);
            return res.redirect("/configs/meters");
        } catch (err) {
            console.log("Error delete meter");
            return res.redirect("/configs/meters");
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
}

module.exports = new EmailSMTPController();