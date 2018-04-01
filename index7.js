const five = require("johnny-five")
const board = new five.Board()

board.on("ready", function() {
  const LED      = 13 // pin 13
  const PULSE    = 2  // pin 2

  this.pinMode(LED, five.Pin.OUTPUT) // so we can update the LED
  this.digitalWrite (PULSE, 1);  // internal pull-up resistor

  let newTime
  let oldTime    = 0
  let encoderPos = 0
  let newPos     = 0
  let oldPos     = 0

  let velocity1

  let out0       = 0
  let out1

  // MOTOR
  let analogPin  = 3  // potentiometer connected to analog pin A3
  let val        = 0  // variable to store the read value
  let PinIN1     = 10 // pin 9
  let PinIN2     = 9  // pin10

  var sensor = new five.Sensor.Digital(2)

  sensor.on("change", function() {
    console.log(this.value)
    if (this.digitalRead(PULSE, value => {return value}) == 1) {
      this.digitalWrite(LED, 1)
    } else {
      this.digitalWrite (LED, 0)
    }

    encoderPos++
  })

  out1      = out0;

  newPos    = encoderPos
  newTime   = new Date()
  velocity1 = (newPos - oldPos) * 1000 / (newTime - oldTime)
  oldPos    = newPos
  oldTime   = newTime

  val = this.analogRead(analogPin, value => { return value / 4 }) // read the input pin
  this.analogWrite(PinIN1, val)  // analogRead values go from 0 to 1023, analogWrite values from 0 to 255
  this.analogWrite(PinIN2, 0)  // analogRead values go from 0 to 1023, analogWrite values from 0 to 255

  out0 = 0.00626*velocity1
  out0 = out0 + 0.99373*out1

})
