const fs = require("fs")
const five = require("johnny-five")
const board = new five.Board()

board.on("ready", async function() {
  const proximity = new five.Proximity({
    controller: "HCSR04",
    pin: 7
  })

  let y1 = 0
  proximity.on("data", async function() {
    let y0 = this.cm * 0.0609 + y1 * 0.9391
    output = 22 - y0
    //console.log(output)
    y1 = y0
    await pidController(7)
  })

  const motor = new five.Motor(
    { pins: { dir: 8, pwm: 9 }, invertPWM: true }
  )

  board.repl.inject({
    motor: motor,
    pwmPump: pwmPump,
    savingData : savingData
  })

  // UTILS
  async function delay (time) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }

  async function pwmPump (x) {
    if (x < 200 || err0 < 0) {
      motor.fwd(0)
    } else if (x > 255) {
      motor.fwd(255)
    } else {
      motor.fwd(200)
    }
  }

  // SAVING DATA
  async function grabarOne () {
    await fs.appendFile('distance.txt', `\n${output}`, () => console.log(`Distance: ${output}`))
    await fs.appendFile('pwm.txt', `\n${input}`, () => console.log(`PWM: ${input}`) )
  }

  async function grabar () {
    await fs.unlink('distance.txt', () => console.log(`Distance: ${output}`))
    await fs.unlink('pwm.txt', () => console.log(`PWM: ${input}`))
    for (let k = 0; k < 5000; k++) {
      await grabarOne()
      await delay(25)
    }
  }

  async function savingData () {
    input = 0
    await pwmPump(input)

    grabar()

    await delay(5000)

    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
    await delay(5000)
    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
    await delay(5000)
    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
    await delay(5000)
    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
    await delay(5000)
    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
    await delay(5000)
    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
    await delay(5000)
    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
    await delay(5000)
    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
    await delay(5000)
    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
    await delay(5000)
    input = 255
    await pwmPump(input)
    await delay(10000)

    input = 0
    await pwmPump(input)
  }

  // CONTROLLING
  let pi0  = pi1  = 0
  let err0 = err1 = 0
  async function pidController (sp) {
    err1     = err0
    err0 = sp - output
    let pi0  = pi1 + 15.63 * err0 - 15.63 * err1
    pi1      = pi0
    console.log("pi0  :  " + pi0)
    console.log("err0 :  " + err0)
    await pwmPump(pi0 * 5)
  }

  await pwmPump(0)
})
