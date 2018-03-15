const rpio = require('rpio')
const PINS = [10, 11, 8],
	[DAT, CLK, CS] = PINS,
	NUM_PIXELS = 7,
	BRIGHTNESS = 7

let pixels = Array(NUM_PIXELS).fill([0, 0, 0, BRIGHTNESS])
let _gpio_setup = false
let _clear_on_exit = true

function set_brightness(brightness){
	if(brightness < 0 || brightness > 1)
		throw RangeError('Brightness should be between 0.0 and 1.0')

	let n = NUM_PIXELS
	while(n--)
		pixels[n][3] = (31*brightness) & 0b11111
}
function clear(){
	pixels = Array(NUM_PIXELS).fill(
		[0, 0, 0, BRIGHTNESS]
	)
}
function show(){
	if(!_gpio_setup){
		rpio.init({gpiomem: false, mapping: 'gpio'})
		PINS.forEach(pin => rpio.open(pin, rpio.OUTPUT))
		_gpio_setup = true;
	}
	rpio.write(CS, rpio.LOW)
	_sof()

	pixels.forEach(pixel => {
		let [r, g, b, brightness] = pixel
		_write_byte(0b11100000 | brightness)
		_write_byte(b)
		_write_byte(g)
		_write_byte(r)
	})
	_eof()
	rpio.write(CS, rpio.HIGH)
}
function set_all(r, g, b, brightness){
	let n = NUM_PIXELS
	while(n--)
		set_pixel(n, r, g, b, brightness)
}
function set_pixel(x, r, g, b, brightness){
	if(x >= NUM_PIXELS || x < 0) throw RangeError(`Invalid pixel index ${x}, should be (0-${NUM_PIXELS-1})`)
	if(brightness) brightness = 31*brightness & 0b11111
	else brightness = pixels[x][3]
	pixels[x] = [r & 0xff, g & 0xff, b & 0xff, brightness]
}

function _exit(){
	if(_clear_on_exit){
		clear()
		show()
	}
	PINS.forEach(pin => 
		rpio.close(pin, rpio.PIN_RESET)
	)
}
function _eof(){
	rpio.write(DAT, rpio.LOW)
	let n = 36
	while(n--){
		rpio.write(CLK, rpio.HIGH)
		rpio.write(CLK, rpio.LOW)
	}
}
function _sof(){
	rpio.write(DAT, rpio.LOW)
	let n = 32
	while(n--){
		rpio.write(CLK, rpio.HIGH)
		rpio.write(CLK, rpio.LOW)
	}
}
function _write_byte(byte){
	let n = 8
	while(n--){
		rpio.write(DAT, byte & 0b10000000)
		rpio.write(CLK, rpio.HIGH)
		byte <<= 1
		rpio.write(CLK, rpio.LOW)
	}
}

module.exports = {
	set_brightness: set_brightness,
	clear: clear,
	show: show,
	set_all: set_all,
	set_pixel: set_pixel,
	_exit: _exit
}