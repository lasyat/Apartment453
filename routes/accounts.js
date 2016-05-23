var express = require('express');
var router = express.Router();
var Account = require('../models/account').Account;
var validator = require('validator');
var utils = require('../utils/utils');

router.use(function(req, res, next) {
	console.log(req.url);
	console.log("accounts route");
	next();
});


router.get('/login', function(req, res, next) {
	res.send("logged in!")
});

router.post('/create', function(req, res, next) {
	// sanitize inputs
	var un = validator.toString(req.body.username);
	var pw = validator.toString(req.body.password);

	var newAccount = new Account({username: un, password: pw});

	newAccount.save(function(err, result) {
		if (err) {
			console.log(err);
			utils.sendErrResponse(res, 500, 'Failed to create account');
		}
		else {
			utils.sendSuccessResponse(res);
		}
	})
});

module.exports = router;

