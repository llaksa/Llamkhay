var five = require("johnny-five")
var board = new five.Board()

board.on("ready", function() {

  var relay = new five.Relay({
    pin: 8,
    type: "NC"
  })

  let pwm
  let y1 = 0

  this.pinMode(9, five.Pin.PWM)
  var potPin = new five.Sensor("A1")
  potPin.on("change", function() {
    board.analogWrite(9, this.value / 4)
  })

  var temp = new five.Thermometer({
    controller: "LM35",
    pin: "A0",
    freq: 100
  })

  temp.on("data", async function() {
    let y0 = this.celsius * 0.0609 + y1 * 0.9391
    let out = Math.round(y0)
    console.log(Math.round(out))
    y1 = y0
    //await controll(pwm)
  })

  this.repl.inject({
    temp : temp,
    relay : relay,
    controll : controll
  })

  async function controll (x) {
    if (x < 100) {
      relay.open()
    } else {
      relay.close()
      this.analogWrite(9, x)
    }
  }

})

