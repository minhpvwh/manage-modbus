var express = require('express');
var router = express.Router();
const emailController = require('../controllers/emailSMTPController');

/* GET SMTP email config page. */
router.get('/', (req, res) => {
    return emailController.showHomePage(req, res);
});

/* GET SMTP email config page. */
router.get('/email', (req, res) => {
    return emailController.showEmail(req, res);
});

/* GET SMTP email config page. */
router.get('/meters', (req, res) => {
    return emailController.showMeter(req, res);
});

// show modal rules of meter
router.get('/meters/rules/:id', (req, res) => {
    return emailController.showRulesMeter(req, res);
});

// delete rules choosed in modal
router.delete('/meters/rules', (req, res) => {
    return emailController.deleteRulesMeter(req, res);
});

// delete meter
router.get('/meters/delete/:id', (req, res) => {
    return emailController.deleteMeter(req, res);
});

/* POST SMTP email config page. */
router.post('/email', (req, res) => {
    return emailController.createEmail(req, res);
});

/* POST meter config page. */
router.post('/meters', (req, res) => {
    return emailController.createRulerMeters(req, res);
});

/* GET delete SMTP email config page. */
router.get('/email/remove/:id', (req, res) => {
    return emailController.removeEmail(req, res);
});

module.exports = router;