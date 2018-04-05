const fs = require('fs')
const five = require("johnny-five")
const board = new five.Board()

let y0 = 0
let out
let dir
let i = 0

board.on("ready", function() {
  let imu = new five.IMU({
    controller: "MPU6050"
    //freq: 100000      // optional
  });

  imu.on("change", function() {
  //  console.log("=========================")
    y0 = 0.0549*this.gyro.yaw.angle + y0*0.945
    output = Math.round(100 * (y0 % 180)) / 100
  //  console.log("=========================")
  })

  /*
     Motor A: PWM 9, dir 8
     Motor B: PWM 6, dir 5
   */
  const motors = new five.Motors([
    { pins: { dir: 8, pwm: 9 }, invertPWM: true },
    { pins: { dir: 7, pwm: 6}, invertPWM: true }
  ])

  board.repl.inject({
    motors: motors,
    both: both,
    delay: delay,
    finalH: finalH,
    finalA: finalA
  })

  async function both (motorNum, pwmNum) {
    let entry = Math.round(Math.random()) * pwmNum

    motors[motorNum].fwd(entry)
    motors[1 - motorNum].rev(entry)

    if (dir == true) { // guardando datos según el sentido de giro
      await fs.appendFile('outN.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
      await fs.appendFile('inpN.txt', `\n${entry}`, () => console.log(`PWM: ${entry}`) )
    } else {
      await fs.appendFile('outP.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
      await fs.appendFile('inpP.txt', `\n${entry}`, () => console.log(`PWM: ${entry}`) )
    }
    i++

    board.wait(100, function () {
      motors.stop()
    })
  }

  function delay () {
    return new Promise(resolve => {
      setTimeout(resolve, 200)
    })
  }

  async function finalH () {
    //await fs.unlink('outputPos.txt', function (err) {})
    //await fs.unlink('entryPos.txt', function (err) {})

    while (i < 1500) {
      console.log(i)
      dir = true
      await both(0, 255)
      await delay()
    }
  }

  async function finalA () {
    //await fs.unlink('outputNeg.txt', function (err) {})
    //await fs.unlink('entryNeg.txt', function (err) {})

    while (i < 1500) {
      console.log(i)
      dir = false
      await both(1, 255)
      await delay()
    }
  }

})
