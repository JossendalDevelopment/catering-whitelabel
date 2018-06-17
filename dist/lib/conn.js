'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connection = _mysql2.default.createConnection({
    host: _config2.default.get('db.hostname'),
    user: _config2.default.get('db.user'),
    password: _config2.default.get('db.password'),
    database: _config2.default.get('db.database')
});

connection.connect();

exports.default = connection;