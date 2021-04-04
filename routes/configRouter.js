var express = require('express');
var router = express.Router();
const emailController = require('../controllers/emailSMTPController');

/* GET SMTP email config page. */
router.get('/', (req, res) => {
    return emailController.showHomePage(req, res);
});

/* GET SMTP email config page. */
router.get('/meters', (req, res) => {
    return emailController.showMeter(req, res);
});

/* POST edit meter. */
router.post('/meters/edit', (req, res) => {
    return emailController.editMeter(req, res);
});

/* GET rule groups config page. */
router.get('/rule-groups', (req, res) => {
    return emailController.showRuleGroups(req, res);
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

// delete rule group
router.get('/rule-groups/delete/:id', (req, res) => {
    return emailController.deleteRuleGroup(req, res);
});

/* POST meter config page. */
router.post('/meters', (req, res) => {
    return emailController.createRulerMeters(req, res);
});

/* POST rule group config page. */
router.post('/rule-groups', (req, res) => {
    return emailController.createRulerGroup(req, res);
});

module.exports = router;