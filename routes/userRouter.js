const router = require('express').Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/auth');
/* login */
router.post('/login', (req, res) => {
    return controller.login(req, res)
});
/* logout */
router.post('/logout', auth, (req, res) => {
    return controller.logout(req, res)
});
/* login all */
router.post('/logout-all', auth, (req, res) => {
    return controller.logoutAll(req, res)
});
/* change password */
router.post('/change-password', auth, (req, res) => {
    return controller.changePassword(req, res)
});
// forgot password
router.post('/forgot-password', (req, res) => {
    return controller.forgotPassword(req, res)
});
// reset password
router.post('/reset-password', (req, res) => {
    return controller.resetPassword(req, res)
});
/* get all user */
router.get('/', auth, (req, res) => {
    return controller.getAll(req, res)
});
/* get a user */
router.get('/:id', auth, (req, res) => {
    return controller.get(req, res)
});
/* create a new user */
router.post('/', auth, (req, res) => {
    return controller.create(req, res)
});
/* update a user */
router.put('/:id', auth, (req, res) => {
    return controller.update(req, res)
});
/* delete a user */
router.delete('/:id', auth, (req, res) => {
    return controller.remove(req, res)
});
module.exports = router;
