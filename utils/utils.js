exports.generateId = function(length) {
	var possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_!&';
	var r = '';
	for (i=0; i < length; i++) {
		r += possible.charAt(Math.floor(Math.random()*(possible.length)));
	}
	return r;
}