/*
*   Written by Kaan Baris Bayrak
*   productListRoute.js
*
*   Routing homepage which is listing of products
 */
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
var Cart = require('../../models/Cart');


router.get('/', async (req, res) => {

    //Creating a db instance from local demo.db file
    let db = new sqlite3.Database('./demo.db');
    let sql = 'SELECT * FROM Products ';

    //Query products and retrive all from .all function
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log(err);
            res.error(err);
        } else {
            let cart = new Cart(req.session.cart ? req.session.cart : {});
            let itemCount = cart.getItems().length;
            res.render('index',
                {
                    user: req.user,
                    products: rows,
                    cartItemCount: itemCount
                });
        }
    });

    //Closing db session otherwise you cannot open a new db session
    db.close();

});

module.exports = router;