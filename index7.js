const fs = require('fs')
const five = require("johnny-five")
const board = new five.Board()

let y0 = 0
let dir
let output
let i = 0
let milqui

board.on("ready", function() {
  let imu = new five.IMU({
    controller: "MPU6050"
    //freq: 100000      // optional
  });

  imu.on("change", function() {
  //  console.log("=========================")
    //y0 = 0.0549*this.gyro.yaw.angle + y0*0.945
    //output = Math.round(100 * y0) / 100
    output = Math.round(100 * (this.gyro.yaw.angle)) / 100
    // console.log(output)
    control(50)
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
    delay: delay,
    lanzar: lanzar,
    grabar: grabar,
    grabarOne: grabarOne,
    todo: todo,
    control: control
  })

  function delay (time) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }

  async function grabarOne () {
    if (dir == true) { // guardando datos según el sentido de giro
      await fs.appendFile('outN.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
      await fs.appendFile('inpN.txt', `\n${entry}`, () => console.log(`PWM: ${entry}`) )
    } else {
      await fs.appendFile('outP.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
      await fs.appendFile('inpP.txt', `\n${entry}`, () => console.log(`PWM: ${entry}`) )
    }
  }

  async function grabar () {
    for (let k = 0; k < 5000; k++) {
      await grabarOne()
      await delay(1)
    }
  }

  async function lanzar () {
    // dir tru con motorNum 0 || dir false con motorNum 1
    motorNum = 0

    motors[motorNum].fwd(entry)
    motors[1 - motorNum].rev(entry)

    board.wait(15000, function () {
      motors.stop()
    })
  }

  async function todo () {
    entry = 0
    dir = true
    grabar()
    await delay(500)
    entry = 200
    dir = false
    await lanzar()
  }

  let error0
  let error1 = 0
  let error2 = 0
  async function control (setPoint) {
    error0 = setPoint - output
    console.log(error0)

    if (error0 < 0.1 || error0 > -0.1) {
      motors.stop()
    }

    if (setPoint < 0) {
      // PID para negatives setpoints
      let pid0 = -14290.1 * error2 + 28576 * error1 - 14290.1 * error0
      motorNum = 0
    } else {
      // PID para positives setpoints
      let pid0 = 30537.4 * error2 - 61082 * error1 + 30537.4 * error0
      motorNum = 1
    }

    error2 = error1
    error1 = error0

    if (pid0 > 255) {
      pid0 = 255
    } else if (pid0 < 0) {
      pid0 = 0
    }

    motors[motorNum].fwd(pid0)
    motors[1 - motorNum].rev(pid0)
  }

})
