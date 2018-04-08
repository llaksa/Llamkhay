const fs = require('fs')
const five = require("johnny-five")
const board = new five.Board()

let y0 = 0
let dir
let output
let i = 0
let milqui
let motorNum

board.on("ready", function() {
  let imu = new five.IMU({
    controller: "MPU6050"
    //freq: 100000      // optional
  });

  imu.on("change", async function() {
  //  console.log("=========================")
    //y0 = 0.0549*this.gyro.yaw.angle + y0*0.945
    //output = Math.round(100 * y0) / 100
    output = Math.round(100 * (this.gyro.yaw.angle)) / 100

    await controll(50)

    if (setted) {
      await motors.stop()
    }

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
    controll: controll,
    moveIt: moveIt,
    stopIt: stopIt
  })

  async function delay (time) {
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

  let error1p = 0
  let error2p = 0
  let pid1p = 0

  let error1n = 0
  let error2n = 0
  let pid1n = 0

  let error0
  let pid0

  let setted

  async function controll (setPoint) {
    error0 = setPoint - output
    setted = error0 < 1 && error0 > -1

    if (error0 < 0) {

      // PI para negatives errors
      pid0 = pid1n + 0.002682 * error0 - 0.002682 * error1n

      // PID para negatives setpoints
      // pid0 = -14290.1 * error2 + 28576 * error1 - 14290.1 * error0
      motorNum = 0

      //error2 = error1
      error1n = error0
      pid1n = pid0

      let entry = pid0 * 255

      // cancelar los positives errors y pid
      error1p = 0
      error2p = 0
      pid1p = 0

    } else {
      // PI para positives errors
      pid0 = pid1p + 0.001883 * error0 - 0.001883 * error1p

      // PID para positives setpoints
      // pid0 = 30537.4 * error2 - 61082 * error1 + 30537.4 * error0
      motorNum = 1

      //error2 = error1
      error1p = error0
      pid1p = pid0

      let entry = pid0 * 255

      // cancelar los negatives errors y pid
      error1n = 0
      error2n = 0
      pid1n = 0
    }


    if (entry > 255) {
      entry = 255
    } else if (entry < 150 && entry >=0) {
      entry = 150
    } else if (entry < 0) {
      entry = 0
    }

    await delay(1)

    console.log("==================================================")
    console.log(`Output   : ${output}`)
    console.log(`Error    : ${error0}`)
    console.log(`PID      : ${pid0*255}`)
    console.log(`entry    : ${entry}`)
    console.log(`MotorNum : ${motorNum}`)
    console.log(`Setted   : ${setted}`)
    console.log("==================================================")
  }

  async function moveIt () {
    await motors[motorNum].fwd(pid0)
    await motors[1 - motorNum].rev(pid0)
  }

  async function stopIt () {
    let setted = error0 < 0.1 && error0 > -0.1

    console.log(setted)
    if (setted) {
    await motors.stop()
    }
  }

})
