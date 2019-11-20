/*
*   Written by Kaan Baris Bayrak
*   server.js
*
*   Start file for server
 */

const express = require('express');
const expressSession = require('express-session');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();


/*
*   Passport js local authentication strategy
*   integrating with SQLite implementation
 */
passport.use(new Strategy(
    function (username, password, callback) {
        let db = new sqlite3.Database('./demo.db');

        let sql = 'SELECT id,username,email,address,city,postalcode,country,stripeId FROM Users WHERE username = ? AND password = ?';

        db.get(sql, [username, password], (err, row) => {
            if (err) {
                return callback(err);
            }
            if (!row) {
                return callback(null, false);
            }

            callback(null, row);
        });

        db.close();
    }));


/*
*  Serializing user for using with session
*/
passport.serializeUser(function (user, callback) {
    callback(null, user.id);
});


/*
*  Deserializing user for using session in here
*/
passport.deserializeUser(function (id, callback) {
    let db = new sqlite3.Database('./demo.db');

    let sql = 'SELECT id,username,email,address,city,postalcode,country,stripeId FROM Users Where id = ?';

    db.get(sql, [id], (err, row) => {
        if (err) {
            return cb(err);
        }
        callback(null, row);
    });

    db.close();
});


/*
*  For stripe webhooks we need to get raw body from body-parser for signatures matching
*/
app.use(
    bodyParser.json({
        verify: function (req, res, buf) {
            if (req.originalUrl.startsWith('/stripe-webhook')) {
                req.rawBody = buf.toString();
            }
        },
    })
);


/*
*  Configuring useful middlewares
*/
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '../public')));
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

/*
*  Integration for local authentication and session
*/
app.use(expressSession({secret: 'sessionSecret123!'}));
app.use(passport.initialize());
app.use(passport.session());

/*
*  Routing endpoints into proper routers
*/
app.use('/', require('./routes/product/productListRoute'));
app.use('/login', require('./routes/login/login'));
app.use('/logout', require('./routes/logout/logout'));
app.use('/register', require('./routes/register/register'));
app.use('/cart', require('./routes/cart/cartRoute'));
app.use('/checkout', require('./routes/checkout/checkoutRoute'));
app.use('/stripe-webhook', require('./routes/webhook/webhookRoute'));

/*
*  Start server on port
*/
const server = app.listen(process.env.PORT || 8000, () => {
    console.log(`🚀  Server listening on port ${server.address().port}`);
});
