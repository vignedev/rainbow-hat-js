const rpio = require('rpio')
const DEFAULT_ADDRESS = 0x70,
	HT16K33_BLINK_CMD = 0x80,
	HT16K33_BLINK_DISPLAYON = 0x01,
	HT16K33_BLINK_OFF = 0x00,
	HT16K33_BLINK_2HZ = 0x02,
	HT16K33_BLINK_1HZ = 0x04,
	HT16K33_BLINK_HALFHZ = 0x06,
	HT16K33_SYSTEM_SETUP = 0x20,
	HT16K33_OSCILLATOR = 0x01,
	HT16K33_CMD_BRIGHTNESS = 0xE0

module.exports = class HT16K33{
	constructor(address = DEFAULT_ADDRESS){
		this._i2c_addr = address
		this.buffer = Buffer.alloc(16)
		this._is_setup = false
	}

	begin(){
		if(this._is_setup) return
		rpio.i2cBegin()
		rpio.i2cSetSlaveAddress(this._i2c_addr)
		rpio.i2cWrite(Buffer.from([HT16K33_SYSTEM_SETUP | HT16K33_OSCILLATOR]))
		this.set_blink(HT16K33_BLINK_OFF)
		this.set_brightness(15)
	}
	set_blink(frequency){
		if(![HT16K33_BLINK_OFF, HT16K33_BLINK_2HZ, HT16K33_BLINK_1HZ, HT16K33_BLINK_HALFHZ].includes(frequency))
			throw ValueError('Frequency must be one of HT16K33_BLINK_OFF, HT16K33_BLINK_2HZ, HT16K33_BLINK_1HZ, or HT16K33_BLINK_HALFHZ.')
		rpio.i2cWrite(Buffer.from([HT16K33_BLINK_CMD | HT16K33_BLINK_DISPLAYON | frequency]))
	}
	set_brightness(brightness){
		if(brightness < 0 || brightness > 15) throw RangeError('Brightness must be a value of 0 to 15.')
		rpio.i2cWrite(Buffer.from([HT16K33_CMD_BRIGHTNESS | brightness]))
	}
	set_led(led, value){
		if(led < 0 || led > 127) throw RangeError('LED must be value of 0 to 127.')
		let pos = (Math.floor(led / 8)), offset = led % 8
		if(!value) this.buffer[pos] &= ~(1 << offset)
		else this.buffer[pos] |= (1 << offset)
	}
	write_display(){
		if(!this._is_setup){
			this.begin()
			//this._is_setup = true
		}
		this.buffer.forEach((value, idx) => rpio.i2cWrite(Buffer.from([idx, value])))
		rpio.i2cEnd()	//release just to be sure
	}
	clear(){
		this.buffer = Buffer.alloc(16)
	}
	/*
	the original library doesnt clear for some reason

	end(){
		this.clear()
		this.write_display()
		rpio.i2cEnd()
	}*/
}