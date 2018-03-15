module.exports = {
	display: new (require('./lib/alphanum4.js'))(),
	lights: require('./lib/apa102.js'),
	touch: require('./lib/touch.js')
}