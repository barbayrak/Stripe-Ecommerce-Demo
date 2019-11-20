/*
*   Written by Kaan Baris Bayrak
*   checkoutRoute.js
*
*   Checkout view routing and handling stripe payment intents
 */
const config = require('../../config');
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
var Cart = require('../../models/Cart');
const stripe = require('stripe')(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);


/*
*   Renders checkout view with proper cart items
 */
router.get('/', async (req, res) => {

    // If there is no cart return nothing
    if (!req.session.cart) {
        return res.render('cart', {
            user: req.user,
            cartItemCount: 0,
            products: []
        });
    }

    let cart = new Cart(req.session.cart);
    let itemCount = cart.getItems().length;
    res.render('checkout', {
        user: req.user,
        cartItemCount: itemCount,
        products: cart.getItems(),
        totalPrice: cart.totalPrice
    });

});


/*
*   Creates payment intent when checkout loads for
*   payment intent API https://stripe.com/docs/payments/payment-intents
 */
router.post("/create-payment-intent", async (req, res) => {

    let cart = new Cart(req.session.cart);
    let currency = config.currency;

    // Create intent with customer id
    const paymentIntent = await stripe.paymentIntents.create({
        amount: cart.totalPrice,
        currency: currency,
        customer: req.user.stripeId
    });


    let db = new sqlite3.Database('./demo.db');

    //Preapare sql query for adding items to our database for keeping track of payment and shipment
    var sql = '';
    var parameters = [];
    var items = cart.getItems();

    sql = sql + 'INSERT INTO ItemShipment(productId,userId,paymentId,quantity,isPaid,isShipped) VALUES ';
    for (var i = 0; i < items.length; i++) {
        if (i === items.length - 1) {
            sql = sql + "(?,?,?,?,0,0)";
        } else {
            sql = sql + "(?,?,?,?,0,0),";
        }
        parameters.push(items[i].item.id);
        parameters.push(req.user.id);
        parameters.push(paymentIntent.id);
        parameters.push(items[i].quantity);
    }

    db.run(sql, parameters, function (err) {
        if (err) {
            return console.log(err.message);
        }

        // Send publishable key to clinet for complete payment
        res.send({
            publishableKey: config.stripe.publishableKey,
            intentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            customerId: req.user.customerId
        });
    });

    db.close();
});


/*
*   Updates payment intent in order to attach shipment information
*   written by client
 */
router.post("/update-payment-intent", async (req, res) => {

    let address = req.body.address;
    let name = req.body.name;

    stripe.paymentIntents.update(
        req.body.intentId,
        {
            shipping: {
                address: {
                    line1: address.address,
                    city: address.city,
                    postal_code: address.zip,
                },
                name: name
            }
        },
        function (err, paymentIntent) {
            if (err) {
                console.log(err)
            } else {
                res.json("Ok")
            }
        }
    );

});


/*
*   Updates payment intent in order to attach shipment information
*   written by client
 */
router.post("/payment-charge", async (req, res) => {

    stripe.paymentIntents.retrieve(
        req.body.intentId,
        function (err, paymentIntent) {
            if (err) {
                res.error(err)
            } else {
                var charge = paymentIntent.charges.data[0];
                res.send({
                    chargeId: charge.id,
                    amount: charge.amount,
                    currency: charge.currency
                });
            }
        }
    );

});


/*
*   Routes you to homepage with clearing cart information for
*   preventing user-side duplicates
 */
router.get("/complete-checkout", async (req, res) => {
    req.session.cart = null;
    res.redirect('/');
});


module.exports = router;