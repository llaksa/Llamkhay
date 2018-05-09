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
    //pidController(18)
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

  let pi1 = pi2 = 0
  let err0 = err1 = err2 = err3 = err4 = err5 = err6 = err7 = err8 = err9 = err10 = err11 = err12 = err13 = err14 =
    err15 = err16 = err17 = err18 = err19 = err20 = err21 = err22 = err23 = err24 = err25 = err26 = err27 = err28 =
    err29 = err30 = err31 = err32 = 0
  let k = 0
  async function pidController (sp) {
    k++
      let pi0 = 1.961 * pi1 - 0.9609 * pi2 + 5.539e-10 * err31 + 5.466e-10 * err32
    console.log("pi0:  " + pi0)
    console.log("err0: " + err0)
    pi2  = pi1
    pi1  = pi0
    err0 = output - sp
    if (err0 > 0) {
      await pwmFan(pi0)
    } else {
      await pwmFan(0)
    }
    err1 = err0
    err2 = err1
    err3 = err2
    err4 = err3
    err5 = err4
    err6 = err5
    err7 = err6
    err8 = err7
    err9 = err8
    err10 = err9
    err11 = err10
    err12 = err11
    err13 = err12
    err14 = err13
    err15 = err14
    err16 = err15
    err17 = err16
    err18 = err17
    err19 = err18
    err20 = err19
    err21 = err20
    err22 = err21
    err23 = err22
    err24 = err23
    err25 = err24
    err26 = err25
    err27 = err26
    err28 = err27
    err29 = err28
    err30 = err29
    err31 = err30
    err32 = err31
  }

  await pwmFan(0)

})
