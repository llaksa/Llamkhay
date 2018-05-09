var five  = require("johnny-five")
var fs    = require("fs")
var board = new five.Board()

board.on("ready", async function() {
  this.pinMode(9, five.Pin.PWM)

  let pwm
  let y1 = 0
  let input
  let output

  var relay = new five.Relay({
    pin: 8,
    type: "NO"
  })

  /*
  var potPin = new five.Sensor("A5")
  potPin.on("change", async function () {
    pwm = Math.floor(this.value / 4)
    await pwmFan(pwm)
    //console.log("pot: " + pwm)
  })
  */

  var temp = new five.Thermometer({
    controller: "LM35",
    pin: "A0",
    freq: 25
  })

  temp.on("data", function() {
    let y0 = this.celsius * 0.0609 + y1 * 0.9391
    output = y0
    //output = Math.round(y0)
    //console.log("temp: " + output)
    //console.log(this.celsius)
    y1 = y0
    pidController(17)
  })

  this.repl.inject({
    temp : temp,
    relay : relay,
    pwmFan : pwmFan,
    savingData : savingData,
    pidController : pidController
  })

  async function pwmFan (x) {
    if (x < 90) {
      relay.close()
    } else if (x > 255) {
      relay.open()
      board.analogWrite(9, 255)
    } else {
      relay.open()
      board.analogWrite(9, x)
    }
  }

  // SAVING DATA ============================================================================================
  async function grabarOne () {
      await fs.appendFile('temperature.txt', `\n${output}`, () => console.log(`Temperature: ${output}`))
      await fs.appendFile('pwm.txt', `\n${input}`, () => console.log(`PWM: ${input}`) )
  }

  async function grabar () {
    await fs.unlink('temperature.txt', () => console.log(`Temperature: ${output}`))
    await fs.unlink('pwm.txt', () => console.log(`PWM: ${input}`))
    for (let k = 0; k < 5000; k++) {
      await grabarOne()
      await delay(25)
    }
  }

  async function delay (time) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }

  async function savingData () {
    input = 0
    await pwmFan(input)

    grabar()

    await delay(15000)

    input = 255
    await pwmFan(input)

    await delay(112000)
    //await delay(18000)
    input = 0
    await pwmFan(input)
  }

  let pi0  = pi1  = 0
  let err0 = err1 = 0
  async function pidController (sp) {
    err1     = err0
    err0 = output - sp
    let pi0  = pi1 + 52.1 * err0 - 52.09 * err1
    pi1      = pi0
    console.log("pi0  :  " + pi0)
    console.log("err0 :  " + err0)
    await pwmFan(pi0)
    /*
    if (err0 > 0) {
      await pwmFan(pi0)
    } else {
      await pwmFan(0)
    }
    */
  }

  await pwmFan(0)

})
