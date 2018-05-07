var five = require("johnny-five")
var board = new five.Board()

board.on("ready", function() {

  var relay = new five.Relay({
    pin: 8,
    type: "NC"
  })

  let pwm

  this.pinMode(9, five.Pin.PWM)

  var sensor = new five.Sensor("A1")
  sensor.on("change", function() {
    board.analogWrite(9, this.value / 4)
 })

  var temp = new five.Thermometer({
    controller: "LM35",
    pin: "A0",
    freq: 100
  })

  this.repl.inject({
    temp : temp,
    relay : relay,
    controll : controll
  })

  let y1 = 0
  temp.on("data", async function() {
    let y0 = this.celsius * 0.0609 + y1 * 0.9391
    let out = Math.round(y0)
    console.log(Math.round(out))
    y1 = y0
    //await controll(pwm)
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

