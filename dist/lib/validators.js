'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.testUsername = testUsername;
exports.testPassword = testPassword;
exports.testEmail = testEmail;
var userRegExp = /^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*$/;
var passRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%_-]{2,}$/;
var emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function testUsername(username) {
	if (userRegExp.test(username) === true) {
		console.log('valid username');
		return true;
	}
}

function testPassword(password) {
	if (passRegExp.test(password) === true) {
		console.log('valid password');
		return true;
	}
}

function testEmail(email) {
	if (emailRegExp.test(email) === true) {
		console.log('valid email');
		return true;
	}
}