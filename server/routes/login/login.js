/*
*   Written by Kaan Baris Bayrak
*   checkoutRoute.js
*
*   Login view routing
 */
const config = require('../../config');
const express = require('express');
const router = express.Router();
var passport = require('passport');


router.get('/',
    function (req, res) {
        res.render('login');
    });


/*
* Using passport.js 's autenticate middleware for authentication handling
* prepared in server.js file
 */
router.post('/', passport.authenticate('local', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/');
    });


module.exports = router;