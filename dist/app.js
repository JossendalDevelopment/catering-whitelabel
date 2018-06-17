'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _conn = require('./lib/conn');

var _conn2 = _interopRequireDefault(_conn);

var _public = require('./routes/public');

var _public2 = _interopRequireDefault(_public);

var _private = require('./routes/private');

var _private2 = _interopRequireDefault(_private);

var _client = require('./routes/client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 'process.env.PORT';
// Set up Express middlewares
// After placing favicon, uncomment favicon import and usage
app.use((0, _serveFavicon2.default)(_path2.default.join(__dirname, 'public', 'favicon.ico')));
app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use((0, _cookieParser2.default)());
app.use(_express2.default.static(_path2.default.join(__dirname, 'public')));

server.listen(port || 3001, function () {
  console.log('listening on port ' + port);
});

//socket section

// let namespace = io.of('/orders')
var idList = [];
var emitAuth = false;

// io.on('connection', (socket) => {


//   socket.on('order', order => {
//     console.log('idList',idList)
//     console.log('received order of',order.cart)
//     // const truckId = order[0].itemTruckId
//     // idList.filter(listItem => listItem.id == order.cart[0].itemTruckId)
//     idList.map((id, i) => {
//       if (id.id == order.cart[0].itemTruckId) {

//         console.log("Socket Connected, sent through socket : " +id.socketId)
//         // io.sockets.connected[id.socketId].emit('order', {order, emitAuth})
//         // socket.broadcast.to(id.socketId).emit('order', {order, emitAuth})
//         // io.to(id.socketId).emit('order', {order, emitAuth})
//         socket.to(id.socketId).emit('order', order)
//         // socket.emit('order', order)
//         // io.sockets.sockets(id.socketId).emit('order', {order, emitAuth})

//         const sql=`
//           INSERT INTO  orders (userId, itemName, itemPrice, itemType, itemDescription, truckId)
//           VALUES (?, ?, ?, ?, ?, ?)
//         `
//         conn.query(sql, [order.cart[i].id, order.cart[i].itemName, order.cart[i].itemPrice, order.cart[i].ItemType, order.cart[i].itemDescription, order.cart[i].itemTruckId, order.cart[i].truckUserName], (err, results, fields) => {

//         })
//       } else {
//         emitAuth = false
//         console.log('failed to emit')
//       }
//     })
//   })
//   socket.on('create truck', id => {
//     id.socketId = socket.id //name has truck id and socket.id
//     console.log('creating truck: ',id)
//     idList.push(id)
//   })

//   socket.on('disconnect', () => {
//     console.log('user disconnected')
//     // socket.removeAllListeners('order');
//     // socket.removeAllListeners('disconnect');
//     // io.removeAllListeners('connection');
//   })
// })


//constinually checks for newly active trucks
setInterval(function () {
  var sql = '\n    SELECT id, timeopen, timeclose FROM trucks\n  ';
  _conn2.default.query(sql, function (err, results, fields) {

    results.map(function (truck, i) {

      var rightNow = new Date();
      if (truck.timeopen !== null) {
        var timeopen = new Date(truck.timeopen);
        var timeclose = new Date(truck.timeclose);
        if (timeopen < rightNow && timeclose > rightNow) {
          var sqlUpdate = '\n            UPDATE trucks SET isActive = ? WHERE id = ?\n          ';
          _conn2.default.query(sqlUpdate, [true, results[i].id], function (err2, results2, fields2) {});
        } else {
          var _sqlUpdate = '\n            UPDATE trucks SET isActive = ? WHERE id = ?\n          ';
          _conn2.default.query(_sqlUpdate, [false, results[i].id], function (err3, results3, fields3) {});
        }
      }
    });
  });
}, 5000);

app.use('/api', _public2.default);
app.use('/api', (0, _expressJwt2.default)({ secret: _config2.default.get('jwt-secret') }), _private2.default);

// Client needs to be the last route handled
// ALL OTHER EXPRESS ROUTES GO ABOVE THIS LINE
app.use('/', _client2.default);

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      error: err
    });
  });
}

if (app.get('env') === 'production') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: 'Oops. Our bad.'
    });
  });
}

exports.default = app;