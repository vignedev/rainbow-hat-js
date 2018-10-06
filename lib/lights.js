const rpio = require('rpio')
const LEDS = [6, 19, 26],
    [RED, GREEN, BLUE] = LEDS
rpio.init({ gpiomem: false, mapping: 'gpio' })

class Light{
    constructor(gpio_pin){
        this.gpio_pin = gpio_pin
        this.state = rpio.LOW
    }
    open(){
        rpio.open(this.gpio_pin, rpio.OUTPUT)
        return this
    }
    close(){
        rpio.close(this.gpio_pin, rpio.PIN_RESET)
    }
    on(){this.write(true)}
    off(){this.write(false)}
    toggle(){this.write(!this.state)}
    write(value){
        this.state = value ? rpio.HIGH : rpio.LOW
        rpio.write(this.gpio_pin, this.gpio_pin)
    }
}

module.exports = {
    RED: new Light(RED),
    GREEN: new Light(GREEN),
    BLUE: new Light(BLUE)
}