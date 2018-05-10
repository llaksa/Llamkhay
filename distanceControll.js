var five = require("johnny-five")
var board = new five.Board()

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "HCSR04",
    pin: 7
  })

  proximity.on("data", function() {
    let y0 = this.cm * 0.0609 + y1 * 0.9391
    output = y0
    y1 = y0
  })

  var motor

  motor = new five.Motor({
    pins: {
      pwm: 8,
      dir: 9
    }
  })

  board.repl.inject({
    motor: motor,
    savingData : savingData
  })

  // UTILS
  async function delay (time) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }

  async function pwmPump (x) {
    if (x < 90) {
      motor.stop()
    } else if (x > 255) {
      motor.fwd(255)
    } else {
      motor.fwd(x)
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

    await delay(15000)

    input = 255
    await pwmPump(input)

    await delay(112000)
    input = 0
    await pwmPump(input)
  }

  // CONTROLLING
  let pi0  = pi1  = 0
  let err0 = err1 = 0
  async function pidController (sp) {
    err1     = err0
    err0 = output - sp
    let pi0  = pi1 + 52.1 * err0 - 52.09 * err1
    pi1      = pi0
    console.log("pi0  :  " + pi0)
    console.log("err0 :  " + err0)
    await pwmPump(pi0)
  }


})
