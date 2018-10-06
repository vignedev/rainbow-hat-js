const EventEmitter = require('events')
const rpio = require('rpio')
const PINS = [21, 20, 16],
	[PIN_A, PIN_B, PIN_C] = PINS

rpio.init({gpiomem: false, mapping: 'gpio'})

class Button extends EventEmitter{
	constructor(gpio_pin){
		super()
		this.gpio_pin = gpio_pin
	}
	open(){
		rpio.open(this.gpio_pin, rpio.INPUT, rpio.PULL_UP)
		this.pressed = rpio.read(this.gpio_pin) == 1
		rpio.poll(this.gpio_pin, pin => {
			let status = rpio.read(pin)
			this.pressed = status == 1
			this.emit(this.pressed == 1 ? 'up' : 'down')
		})
		return this
	}
	close(){
		rpio.close(this.gpio_pin, rpio.PIN_RESET)
	}
}

module.exports = {
	A: new Button(PIN_A),
	B: new Button(PIN_B),
	C: new Button(PIN_C)
}

/*
warning: for some reason:

Message from syslogd@raspberrypi at Mar 15 10:57:59 ...
 kernel:[ 6048.566747] Disabling IRQ #79

apparently a node-rpio's .poll() function does this
*/