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
    output = Math.round(y0)
    console.log("temp: " + output)
    //console.log(this.celsius)
    y1 = y0
  })

  this.repl.inject({
    temp : temp,
    relay : relay,
    pwmFan : pwmFan,
    savingData : savingData
  })

  async function pwmFan (x) {
    if (x < 90) {
      relay.close()
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

  let pi1   = 0
  let pi2   = pi1
  let err31 = 0
  let err32 = err31
  let k     = 0
  async function pidController (sp) {
    let pi0   = 1.961 * pi1 - 0.9609 * pi2 + 5.539e-10 * err31 + 5.466e-10 * err32
    pi2       = pi1
    pi1       = pi0
    k++
    if (k > 30 == 0) {
      err32 = err31
      err31 = sp - output
    }
  }
  await pwmFan(0)

})
