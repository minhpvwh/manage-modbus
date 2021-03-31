const emailSMTPService = require('../services/emailSMTPService');
const BaseController = require('./baseController');
const { messageResponse } = require('../utils/constants');

class EmailSMTPController extends BaseController {
    constructor() {
        super(emailSMTPService);
    }

    async showHomePage(req, res){
        return res.redirect('/configs/email');
    }

    async createEmail(req, res, message = messageResponse.CREATE_SUCCESS){
        try {
            const rs = await emailSMTPService.createEmail(req.body.content);
            return res.redirect("/configs/email");
        } catch (error) {
            console.log("Error create Email SMTP:", error);
            return res.render("../views/error", {message: "Error", error: error});
        }
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

    async showEmail(req, res, message = messageResponse.GET_SUCCESS) {
        try {
            const rs = await emailSMTPService.showEmail();
            return res.render("../views/emailConfig/show", {emails: rs.to || []});
        } catch (error) {
            console.log("Error show Email SMTP:", error);
            return res.render("../views/error", {message: "Error", error: error});
        }
    }

    async showMeter(req,res, message = messageResponse.GET_SUCCESS) {
        try{
            const rs = await emailSMTPService.showMeter();
            return res.render("../views/meterConfig/show", rs);
        } catch(error) {
            console.log("Error show Meter:", error);
            return res.render("../views/error", {message: "Error", error: error});
        }
    }

    async removeEmail(req, res, message = messageResponse.DELETE_SUCCESS) {
        const query = { _id: req.params['id'] };
        console.log("remove");
        try {
            const rs = await emailSMTPService.removeEmail(query);
            return res.redirect("/configs/email");
        } catch (err) {
            return res.redirect("/configs/email");
        }
    }
}

module.exports = new EmailSMTPController();