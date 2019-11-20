/*
*   webhookRoute.js
*
*   Configuring Webhooks that comes from stripe
 */
const config = require('../../config');
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const stripe = require('stripe')(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);


/*
*  Webhook /stripe-webhook endpoint
*
*  Note : For development purposes webhook comes from stripe cli.
*  However in production you should set your endpoint in stripe dashboard.
*  You can see cli command in package.json -> scripts -> setup-webhook
*/
router.post('/', async (req, res) => {
    let data;
    let eventType;

    // Check if webhook signing is configured.
    if (config.stripe.webhookSecret) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                config.stripe.webhookSecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        // Extract the object from the event.
        data = event.data;
        eventType = event.type;
    }

    const object = data.object;

    if (object.object === 'payment_intent') {

        const paymentIntent = object;
        if (eventType === 'payment_intent.succeeded') {
            console.log("💰 Payment captured!");

            // Update database with charge id(charge id starts with ch_) and payment id(payment intent starts with pi_)
            let charge = paymentIntent.charges.data[0];
            let db = new sqlite3.Database('./demo.db');
            db.run('UPDATE ItemShipment SET isPaid = 1 , chargeId = ? WHERE paymentId = ?', [charge.id, paymentIntent.id], function (err) {
                if (err) {
                    console.log(err.message);
                } else {
                    //You can ship or do some post-transaction things here
                    /* code here */

                }
            });
            db.close();

        } else if (eventType === 'payment_intent.payment_failed') {
            console.log("❌ Payment failed.");
        }
    }

    res.sendStatus(200);

});

module.exports = router;

