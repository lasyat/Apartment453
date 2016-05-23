var utils = {};

utils.sendSuccessResponse = function(res, content) {
	res.status(200).json({
		success: true,
		content: content
	}).end();
};

utils.sendErrResponse = function(res, errcode, err) {
	res.status(errcode).json({
		success: false,
		err: err
	}).end();
};
module.exports = utils;