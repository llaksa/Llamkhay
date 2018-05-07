var five = require("johnny-five")
var board = new five.Board()

board.on("ready", function() {

  var relay = new five.Relay({
    pin: 8,
    type: "NO"
  })

  let pwm
  let y1 = 0

  //this.pinMode(9, five.Pin.PWM)
  var potPin = new five.Sensor("A5")
  potPin.on("change", async function () {
    pwm = Math.floor(this.value / 4)
    await controllIt(pwm)
    console.log("pot: " + pwm)
  })

  var temp = new five.Thermometer({
    controller: "LM35",
    pin: "A0",
    freq: 25
  })

  temp.on("data", function() {
    let y0 = this.celsius * 0.0609 + y1 * 0.9391
    let out = Math.round(y0)
    //console.log("temp: " + Math.round(out))
    //console.log(this.celsius)
    y1 = y0
  })

  this.repl.inject({
    temp : temp,
    relay : relay,
    controllIt : controllIt
  })

  async function controllIt (x) {
    if (x < 100) {
      relay.open()
    } else {
      relay.close()
      board.analogWrite(9, x)
    }
  }

  async function pidController () {}

})
