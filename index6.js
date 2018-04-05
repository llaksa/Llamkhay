const five = require("johnny-five")
const board = new five.Board()

board.on("ready", function() {
  const LED      = 13 // pin 13
  const PULSE    = 2  // pin 2

  // MOTOR
  let analogPin  = 3  // potentiometer connected to analog pin A3
  let PinIN1     = 10 // pin 9
  let PinIN2     = 9  // pin10

  this.pinMode(LED, five.Pin.OUTPUT) // so we can update the LED
  this.digitalWrite (PULSE, 1);  // internal pull-up resistor

  let newTime    = 0
  let oldTime    = 0
  let encoderPos = 0
  let newPos     = 0
  let oldPos     = 0

  let velocity1

  let x0       = 0
  let x1
  let y0
  let y1       = 0

  var sensor = new five.Sensor.Digital(2)

  this.pinMode(PinIN1, five.Pin.PWM)
  this.pinMode(PinIN2, five.Pin.PWM)
  this.pinMode(analogPin, five.Pin.ANALOG)

  this.analogRead(analogPin, value => {
    this.analogWrite(PinIN1, value / 4)  // analogRead values go from 0 to 1023, analogWrite values from 0 to 255
    this.analogWrite(PinIN2, 0)  // analogRead values go from 0 to 1023, analogWrite values from 0 to 255
    //console.log("==============================================")
    newPos    = encoderPos
    //console.log(newPos)
    newTime   = new Date()
    //console.log(newTime)
    velocity1 = (newPos - oldPos) * 10000 / (newTime - oldTime)
    oldPos    = newPos
    oldTime   = newTime
    //console.log(oldPos)
    //console.log(oldTime)
    //console.log(newTime - oldTime)
    //console.log(velocity1)
    //console.log("==============================================")

    //console.log((oldPos - newPos)*10000000)
    x1 = x0
    x0 = velocity1
    y0 = 0.0549 * x1 + 0.945 * y1
    //y0 = 0.0006281 * x1 + 0.9994 * y1
    y1 = y0

    console.log(Math.floor(y0))
  }) // read the input pin

  //setInterval(() => {

  //}, 1)

  sensor.on("change", function() {
    /*
    if (this.digitalRead(PULSE, val => {return value}) == 1) {
      this.digitalWrite(LED, 1)
    } else {
      this.digitalWrite (LED, 0)
    }
    */
    //console.log(newTime)
    encoderPos++
  })

})
