var mongoose = require('mongoose');

var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var accountSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	group: {
		type: String,
		required: false,
		select: true
	}
}, {
	collection: 'accounts'
});

accountSchema.pre('save', function(next){
	var account = this;

	if (!account.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		bcrypt.hash(account.password, salt, function(err, hash) {
			if (err) return next(err);

			account.password = hash;
			next();
		});
	});
});

accountSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
}

var Account = mongoose.model('Account', accountSchema);

module.exports.Account = Account