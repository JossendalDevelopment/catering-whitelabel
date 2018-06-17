'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _conn = require('../lib/conn');

var _conn2 = _interopRequireDefault(_conn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.post('/editTruckProfile', function (req, res, next) {
    var name = req.body.companyname;
    var logo = req.body.logo;
    var aboutus = req.body.aboutus;
    var menuurl = req.body.menuurl;
    var username = req.body.username;

    var sql = '\n        UPDATE trucks \n        SET \n        companyname = ?,\n        companylogo = ?,\n        aboutus = ?,\n        menuurl = ? \n        WHERE username = ?\n    ';

    _conn2.default.query(sql, [name, logo, aboutus, menuurl, username], function (err, results, fields) {
        res.json({
            name: name,
            logo: logo,
            aboutus: aboutus,
            menuurl: menuurl,
            message: 'Saved your changes'
        });
    });
});

router.post('/addfavorite', function (req, res, next) {
    var username = req.body.username;
    var truckuser = req.body.truckuser;

    var sql = '\n        INSERT INTO favorites (username, truckusername) \n        VALUES (?, ?)\n    ';

    _conn2.default.query(sql, [username, truckuser], function (err, results, fields) {
        res.json({
            message: 'Truck added to favorites'
        });
    });
});

router.post('/removefavorite', function (req, res, next) {
    var user = req.body.username;
    var truck = req.body.truckuser;
    var id = req.body.id;
    var sql = '\n        DELETE FROM favorites \n        WHERE truckusername = ? AND username = ? AND id = ? OR (truckusername = ? AND username = ?)\n    ';

    _conn2.default.query(sql, [truck, user, id, truck, user], function (err, results, fields) {
        res.json({
            message: "Truck removed from your favorites"
        });
    });
});

router.post('/addmenuitem', function (req, res, next) {
    var getID = '\n        SELECT id AS truckid FROM trucks WHERE username = ?\n    ';
    _conn2.default.query(getID, req.body.username, function (err, results, fields) {

        var sql = '\n            INSERT INTO menu (itemName, itemPrice, itemDescription, itemType, itemTruckId) VALUES (?,?,?,?,?)\n        ';

        _conn2.default.query(sql, [req.body.itemName, req.body.itemPrice, req.body.itemDescription, req.body.itemType, results[0].truckid], function (err2, results2, fields2) {
            res.json({
                message: 'Item added'
            });
        });
    });
});

router.post('/removeitem', function (req, res, next) {
    var sql = '\n        DELETE FROM menu WHERE id = ?\n    ';
    _conn2.default.query(sql, req.body.itemID, function (err, results, fields) {
        res.json({
            message: 'Item deleted'
        });
    });
});

router.post('/addreview', function (req, res, next) {
    var username = req.body.username;
    var truckuser = req.body.truckuser;
    var reviewtext = req.body.reviewtext;
    var rating = req.body.rating;

    var sql = '\n        INSERT INTO reviews (username, truckusername, review, rating) \n        VALUES (?, ?, ?, ?)\n    ';
    _conn2.default.query(sql, [username, truckuser, reviewtext, rating], function (err, results, fields) {
        res.json({
            message: 'Thanks for your Feedback!'
        });
    });
});

router.post('/deleteReview/:id', function (req, res, next) {
    var id = req.params.id;

    var sql = '\n        DELETE FROM reviews WHERE id = ?\n    ';

    _conn2.default.query(sql, id, function (err, results, fields) {
        res.json({
            message: "Review Deleted"
        });
    });
});

router.post('/editReview', function (req, res, next) {
    var id = req.body.id;
    var text = req.body.text;

    var sql = '\n        UPDATE reviews \n        SET review = ? WHERE id = ?\n    ';

    _conn2.default.query(sql, [text, id], function (err, results, fields) {
        res.json({
            message: "Review changed"
        });
    });
});

router.post('/addOrderToUserHistory', function (req, res, next) {

    var sql = '\n        INSERT INTO orders (itemName, itemPrice, itemType, itemDescription, itemid) \n        VALUES (?, ?, ?, ?, ?)\n    ';
    req.body.cart.forEach(function (item) {
        console.log('item', item);
        _conn2.default.query(sql, [item.itemName, item.itemPrice, item.itemType, item.itemDescription, item.id], function (err, results, fields) {
            res.json({
                results: results
            });
        });
    });
});

router.get('/getOrders', function (req, res, next) {
    var sql = '\n        SELECT * FROM orders\n    ';
    _conn2.default.query(sql, function (err, results, fields) {
        res.json({
            results: results
        });
    });
});

// router.post('/uplocale', (req, res, next) => {
//     const lat = req.body.lat
//     const long = req.body.long
//     const username = req.body.username

//     const sqlGetActiveStatus = `SELECT isActive FROM trucks WHERE username = ? `
//     const sqlUpdateLocOnly = `UPDATE trucks SET lat = ?, lng = ? WHERE username = ? `
//     const sqlUpdateLocAndActive = `UPDATE trucks SET lat = ?, lng = ?, isActive = ? WHERE username = ?`

//     //check if currently active
//     conn.query(sqlGetActiveStatus, username, (err, results, fields) => {
//         //if active, update location only
//         if (results[0].isActive === 1) {
//           console.log('private 156 working')
//             conn.query(sqlUpdateLocOnly, [lat, long, username], (err2, results2, fields2) => {
//                 res.json({
//                     message: 'Location Updated'
//                 })
//             })
//         } else {
//             //update location and activate
//             conn.query(sqlUpdateLocAndActive, [lat, long, 1, username], (err3, results3, fields3) => {
//                 res.json({
//                     message: 'Location updated. You can set a time in your profile'
//                 })
//             })
//         }
//     })                             
// })

// // remove trucks current location and make inactive
// router.post('/removelocale', (req, res, next) => {
//     const username = req.body.username
//     const sqlRemoveLoc = `UPDATE trucks SET lat = DEFAULT, lng = DEFAULT, timeopen = DEFAULT, timeclose = DEFAULT, isActive = DEFAULT WHERE username = ?`
//     conn.query(sqlRemoveLoc, [username], (err, results, fields) => {
//       console.log('query')
//         res.json({
//             message: 'Closing up shop'
//          })
//     })
// })

// //payments with stripe
// const stripe = require('stripe')('sk_test_zGrjspkLXtCEX59BW1kQjVE6')

// router.post('/payments', (req, res, next) => {
//     const charge = stripe.charges.create({
//         amount: req.body.amount,
//         currency: req.body.currency,
//         description: req.body.description,
//         source: req.body.token,
//     })
//     const cart = req.body.cart
//     res.json({
//         data: charge,
//         cart: cart
//     })
// })


exports.default = router;