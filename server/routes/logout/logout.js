/*
*   Written by Kaan Baris Bayrak
*   logout.js
*
*   Logout view routing
 */
const config = require('../../config');
const express = require('express');
const router = express.Router();
var passport = require('passport');



router.get('/',
    function (req, res) {
        req.logout();
        res.redirect('/');
    });


module.exports = router;