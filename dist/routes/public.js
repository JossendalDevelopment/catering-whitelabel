'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _conn = require('../lib/conn');

var _conn2 = _interopRequireDefault(_conn);

var _jsSha = require('js-sha512');

var _jsSha2 = _interopRequireDefault(_jsSha);

var _validators = require('../lib/validators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/api', function (req, res, next) {
  console.log('working');
  res.send('working');
});

router.post('/updatelocation/:user/:lat/:lng', function (req, res, next) {
  var username = req.params.user;
  var lat = req.params.lat;
  var lng = req.params.lng;
  var sql = '\n    UPDATE trucks \n    SET lat = ?,lng = ? \n    WHERE username = ?\n  ';
  _conn2.default.query(sql, [lat, lng, username], function (err, results, fields) {});
});

//allows truck users to set their active hours
router.post('/updatehours/:user/:opentime/:closetime', function (req, res, next) {
  var username = req.params.user;
  var open = req.params.opentime;
  var close = req.params.closetime;
  var sql = '\n    UPDATE trucks \n    SET timeopen = ?,timeclose = ?\n    WHERE username = ?\n  ';
  _conn2.default.query(sql, [open, close, username], function (err, results, fields) {});
});

router.post('/updatespecial/:user/:specialinfo', function (req, res, next) {
  var username = req.params.user;
  var special = req.params.specialinfo;
  var sql = '\n    UPDATE trucks\n    SET specialinfo = ?\n    WHERE username = ?\n  ';
  _conn2.default.query(sql, [special, username], function (err, results, fields) {});
});

//gets truck data for home page by sort param
router.get('/truckdata/:sort', function (req, res, next) {
  var type = req.params.sort;
  var sql = '';
  if (type === 'active') {
    sql = '\n      SELECT * FROM trucks WHERE isActive = 1 \n    ';
  } else if (type === 'new') {
    sql = '\n      SELECT * FROM trucks ORDER BY datecreated ASC\n    ';
  } else if (type === 'alpha') {
    sql = '\n      SELECT * FROM trucks ORDER BY companyname ASC\n    ';
  } else if (type === 'all') {
    sql = '\n      SELECT * FROM trucks \n    ';
  } else if (type === 'alphaDesc') {
    sql = '\n      SELECT * FROM trucks ORDER BY companyname DESC\n    ';
  } else {
    sql = '\n      SELECT * FROM trucks WHERE isActive = 1\n    ';
  }
  _conn2.default.query(sql, function (err, results, fields) {
    res.json({
      results: results
    });
  });
});

router.post('/registration', function (req, res, next) {
  var username = req.body.username;
  var password = (0, _jsSha2.default)(req.body.password);
  var email = req.body.email;
  var sql = '\n            SELECT count(1) as count FROM users WHERE username=? \n            UNION SELECT count(1) as count FROM trucks WHERE username=?\n        ';

  _conn2.default.query(sql, [username, username], function (err, results, fields) {

    if (results.map(function (res) {
      return res.count;
    }).indexOf(1) !== -1) {
      // console.log('username taken')
      res.json({
        message: "Username already taken"
      });
    } else {

      if (req.body.type === "user") {
        var avatar = req.body.avatar;

        if ((0, _validators.testUsername)(username) && (0, _validators.testPassword)(req.body.password) && (0, _validators.testEmail)(email)) {
          var insertSql = '\n                        INSERT INTO users (username, password, email, avatar) VALUES (?,?,?,?)\n                    ';
          _conn2.default.query(insertSql, [username, password, email, avatar], function (err2, results2, fields2) {
            console.log('results2: ', results2.insertId);

            var token = _jsonwebtoken2.default.sign({ user: username, source: req.body.type, avatar: avatar, logo: null, id: results2.insertId }, _config2.default.get('jwt-secret'));

            res.json({
              message: "User Created",
              token: token,
              user: username,
              source: 'user',
              avatar: avatar,
              logo: '',
              id: results2.insertId
            });
          });
        } else {
          res.status(400).json({
            message: "Bad Request"
          });
        }
      }

      if (req.body.type === "truck") {

        if ((0, _validators.testUsername)(username) && (0, _validators.testPassword)(req.body.password) && (0, _validators.testEmail)(email)) {
          var companyname = req.body.companyName;
          var companyLogo = req.body.companyLogo;
          var menuurl = req.body.menu;
          var aboutus = req.body.aboutus;

          var _insertSql = '\n                        INSERT INTO trucks (username, password, email, companyname, companylogo, menuurl, aboutus) VALUES (?,?,?,?,?,?,?)\n                    ';

          _conn2.default.query(_insertSql, [username, password, email, companyname, companyLogo, menuurl, aboutus], function (err2, results2, fields2) {
            console.log('results2: ', results2);

            var token = _jsonwebtoken2.default.sign({ user: username, source: req.body.type, avatar: null, logo: companyLogo, id: results2.insertId }, _config2.default.get('jwt-secret'));

            res.json({
              message: "Truck Created",
              token: token,
              user: username,
              source: 'truck',
              avatar: '',
              logo: companyLogo,
              id: results2.insertId
            });
          });
        } else {
          res.status(400).json({
            message: "Bad Request"
          });
        }
      }
    }
  });
});

router.post('/login', function (req, res, next) {
  var username = req.body.username;
  var password = (0, _jsSha2.default)(req.body.password);

  var sql = 'SELECT id, username, email, NULL as avatar, companyname, companylogo, menuurl, aboutus, lng, lat, datecreated, \'truck\' as Source FROM trucks as truckInfo WHERE username = ? AND password = ?\n                UNION\n                SELECT id, username, email, avatar, Null as companyname, Null as companylogo, Null as menuurl, Null as aboutus, Null as lng, Null as lat, Null as datecreated, \'user\' as Source FROM users as userInfo WHERE username = ? AND password = ?';

  _conn2.default.query(sql, [username, password, username, password], function (err, results, fields) {
    if (results.length > 0) {
      // console.log('username and password returned match')
      var token = _jsonwebtoken2.default.sign({ user: username, source: results[0].Source, avatar: results[0].avatar, logo: results[0].companylogo, id: results[0].id }, _config2.default.get('jwt-secret'));
      res.json({
        message: "Login Successful",
        token: token,
        user: username,
        source: results[0].Source,
        avatar: results[0].avatar,
        logo: results[0].companylogo,
        id: results[0].id
      });
    } else {
      res.status(401).json({
        message: "Invalid Username and/or Password"
      });
    }
  });
});

router.get('/truckprofile/:username', function (req, res, next) {
  var username = req.params.username;
  var sql = '\n      SELECT * \n      FROM trucks \n      WHERE username = ?\n    ';
  _conn2.default.query(sql, username, function (err, results, fields) {
    var companyname = results[0].companyname;
    var aboutus = results[0].aboutus;
    var menuurl = results[0].menuurl;
    var logo = results[0].companylogo;

    res.json({
      companyname: companyname,
      aboutus: aboutus,
      menuurl: menuurl,
      logo: logo
    });
  });
});

router.get('/truckreviews/:username', function (req, res, next) {
  var username = req.params.username;
  var sqlRatings = '\n      SELECT review, rating\n      FROM reviews \n      WHERE truckusername = ?\n    ';
  var sqlAvg = '\n      SELECT AVG(rating) AS average\n      FROM reviews\n      WHERE truckusername = ?\n    ';

  _conn2.default.query(sqlRatings, username, function (err, results, fields) {
    _conn2.default.query(sqlAvg, username, function (err2, results2, fields2) {
      var reviews = results;
      var avgReview = results2[0];
      res.json({
        reviews: reviews,
        avgReview: avgReview
      });
    });
  });
});

router.get('/isfavorite/:truck/:user', function (req, res, next) {
  var username = req.params.user;
  var truckUsername = req.params.truck;

  var sql = '\n    SELECT * \n    FROM favorites\n    WHERE username = ? \n    AND truckusername = ?\n  ';
  _conn2.default.query(sql, [username, truckUsername], function (err, results, fields) {
    if (results.length) {
      res.json({
        isFavorite: true
      });
    } else {
      res.json({
        isFavorite: false
      });
    }
  });
});

router.get('/userprofile/:username', function (req, res, next) {
  var username = req.params.username;
  var sql = '\n      SELECT * \n      FROM users \n      WHERE username = ?\n    ';
  _conn2.default.query(sql, username, function (err, results, fields) {
    var username = results[0].username;
    var email = results[0].email;
    var avatar = results[0].avatar;
    res.json({
      username: username,
      email: email,
      avatar: avatar
    });
  });
});

router.get('/userfavorites/:username', function (req, res, next) {
  var username = req.params.username;
  var sql = '\n      SELECT t.username, t.companyname, t.companylogo, f.id\n      FROM users u \n      LEFT JOIN favorites f on u.username = f.username \n      LEFT JOIN trucks t on f.truckusername = t.username WHERE u.username = ?\n    ';

  _conn2.default.query(sql, username, function (err, results, fields) {
    var favorites = results;
    res.json({
      favorites: favorites
    });
  });
});

router.get('/getUsersReviews/:username', function (req, res, next) {
  var username = req.params.username;

  var sql = '\n    SELECT t.companyname, r.review, r.id\n    From trucks t \n    LEFT JOIN reviews r on  t.username = r.truckusername \n    WHERE r.username = ?\n  ';

  _conn2.default.query(sql, username, function (err, results, fields) {
    var reviews = results;
    res.json({
      reviews: reviews
    });
  });
});

router.get('/getmenu/:truckuser', function (req, res, next) {
  var getID = '\n    SELECT id AS truckid FROM trucks WHERE username = ?\n  ';

  _conn2.default.query(getID, req.params.truckuser, function (err, results, next) {
    var sql = '\n      SELECT * FROM menu WHERE itemTruckId = ?\n    ';
    _conn2.default.query(sql, results[0].truckid, function (err2, results2, fields2) {
      res.json({
        menu: results2
      });
    });
  });
});

router.post('/uplocale', function (req, res, next) {
  var lat = req.body.lat;
  var long = req.body.long;
  var username = req.body.username;

  var sqlGetActiveStatus = 'SELECT isActive FROM trucks WHERE username = ? ';
  var sqlUpdateLocOnly = 'UPDATE trucks SET lat = ?, lng = ? WHERE username = ? ';
  var sqlUpdateLocAndActive = 'UPDATE trucks SET lat = ?, lng = ?, isActive = ? WHERE username = ?';

  //check if currently active
  _conn2.default.query(sqlGetActiveStatus, username, function (err, results, fields) {
    //if active, update location only
    if (results[0].isActive === 1) {
      console.log('private 156 working');
      _conn2.default.query(sqlUpdateLocOnly, [lat, long, username], function (err2, results2, fields2) {
        res.json({
          message: 'Location Updated'
        });
      });
    } else {
      //update location and activate
      _conn2.default.query(sqlUpdateLocAndActive, [lat, long, 1, username], function (err3, results3, fields3) {
        res.json({
          message: 'Location updated. You can set a time in your profile'
        });
      });
    }
  });
});

//remove trucks current location and make inactive
router.post('/removelocale', function (req, res, next) {
  var username = req.body.username;
  var sqlRemoveLoc = 'UPDATE trucks SET lat = DEFAULT, lng = DEFAULT, timeopen = DEFAULT, timeclose = DEFAULT, isActive = DEFAULT WHERE username = ?';
  _conn2.default.query(sqlRemoveLoc, [username], function (err, results, fields) {
    res.json({
      message: 'Closing up shop'
    });
  });
});

//payments with stripe
var stripe = require('stripe')('sk_test_zGrjspkLXtCEX59BW1kQjVE6');

router.post('/payments', function (req, res, next) {
  var charge = stripe.charges.create({
    amount: req.body.amount,
    currency: req.body.currency,
    description: req.body.description,
    source: req.body.token
  });
  var cart = req.body.cart;
  res.json({
    data: charge,
    cart: cart
  });
});

exports.default = router;