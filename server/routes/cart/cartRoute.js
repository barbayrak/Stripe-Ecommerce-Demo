/*
*   Written by Kaan Baris Bayrak
*   cartRoute.js
*
*   Cart Views Routing
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
var Cart = require('../../models/Cart');


/*
*   Renders cart view with proper cart items
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
    res.render('cart', {
        user: req.user,
        cartItemCount: itemCount,
        products: cart.getItems(),
        totalPrice: cart.totalPrice
    });
});


/*
*  Adds item to cart
 */
router.get('/add/:id', function (req, res, next) {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    let db = new sqlite3.Database('./demo.db');

    let sql = 'SELECT * FROM Products Where id = ?';

    db.get(sql, [productId], (err, row) => {
        cart.add(row, productId);
        req.session.cart = cart;
        res.redirect('/');
    });

    db.close();
});


/*
*   Increase quantity of selected item in cart
 */
router.get('/increaseQuantity/:id', function (req, res, next) {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    let db = new sqlite3.Database('./demo.db');

    let sql = 'SELECT * FROM Products Where id = ?';

    db.get(sql, [productId], (err, row) => {
        cart.add(row, productId);
        req.session.cart = cart;
        res.redirect('/cart');
    });

    db.close();
});


/*
*   Decrease quantity of selected item , if
*   quantity is 1 deletes the item from cart
 */
router.get('/decreaseQuantity/:id', function (req, res, next) {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.remove(productId);
    req.session.cart = cart;
    res.redirect('/cart');
});

module.exports = router;