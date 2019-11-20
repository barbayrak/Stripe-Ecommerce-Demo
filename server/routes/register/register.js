/*
*   Written by Kaan Baris Bayrak
*   register.js
*
*   Creating user
 */
const config = require('../../config');
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const stripe = require('stripe')(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);


/*
*  Creates user
 */
router.post('/',
    function (req, res) {

    /*
    * First it creates customer in stripe and pass it's id to database for
    * creating user in our db with stripe id .
    *
    * Note: We could use Promises here but for demo purposes i am keeping it
     * simple and using callbacks here
     */
    stripe.customers.create(
            {
                description: 'Customer for ' + req.body.email,
            },
            function (stripeError, customer) {

                if (stripeError) {
                    console.log(stripeError.message);
                    res.error(error.message);
                } else {

                    let db = new sqlite3.Database('./demo.db');
                    db.run(`INSERT INTO Users(username,password,email,address,city,postalcode,country,stripeId) VALUES(?,?,?,?,?,?,?,?)`, [req.body.username, req.body.password, req.body.email, req.body.address, req.body.city, req.body.postalCode, req.body.country, customer.id], function (err) {
                        if (err) {
                            console.log(err.message);
                            return;
                        }
                        res.redirect('/login');
                    });
                    db.close();

                }

            });
    });


module.exports = router;