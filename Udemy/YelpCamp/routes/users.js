const express = require('express');
const router = express.Router({ mergeParams : true});
const passport = require('passport');

const users = require('../controllers/users');

const catchAsync = require('../Utils/catchAsync');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash : true, failureRedirect : '/login'}), users.login );

router.get(users.logout);

module.exports = router;