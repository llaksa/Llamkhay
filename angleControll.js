const fs    = require('fs')
const five  = require("johnny-five")
const board = new five.Board()

board.on("ready", function() {

  const velocity = new five.Sensor({
    pin: 4,
    type: "digital"
  })

  let t1 = new Date() * 1
  let n = 0
  let vel0 = 0
  let vel1 = 0
  let tDif
  velocity.on("change", function() {
    //console.log("==============================")
    //console.log("vel0: " + vel0)
    n = n +1
    if (n > 20) {
      let t0 = new Date() * 1
      tDif = t0 - t1
      vel0 = 2100000 / (tDif)
      //console.log("vel0: " + vel0)
      t1 = t0
      n = 0
    }
  })

  setInterval(() => {
    if (vel0 == vel1) {
      vel0 = 0
    }
    //console.log("==============================")
    //console.log("tDif: " + tDif)
    //console.log("vel0: " + vel0)
    console.log("n: " + n)
    vel1 = vel0
    /*
    console.log("========================")
    console.log("var de t: " + tDif)
    console.log("t1: " + t1)
    */
  }, 50)

  /*
  setInterval(() => {
    console.log("==============================")
    console.log("vel0: " + vel0)
  }, 10000)
  */

  /*
  let imu = new five.IMU({
    controller: "MPU6050"
    // freq: 100000 // optional
  })
  */

  /* Motor A: PWM 9, dir 8
     Motor B: PWM 6, dir 5 */
  const motors = new five.Motors([
    { pins: { dir: 8, pwm: 9 }, invertPWM: true },
    { pins: { dir: 7, pwm: 6}, invertPWM: true }
  ])

  let output
  let motorOpt

  /*
  imu.on("change", async function() {
    output = Math.round(100 * (this.gyro.yaw.angle)) / 100

    let setPoint = 50
    await controll(setPoint)
  })
  */

  board.repl.inject({
    motors: motors,
    delay: delay,
    lanzar: lanzar,
    grabar: grabar,
    grabarOne: grabarOne,
    todo: todo,
    controll: controll,
    moveIt: moveIt,
  })

  async function delay (time) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }

  async function grabarOne () {
    if (motorOpt == 0) { // guardando datos según el sentido de giro
      await fs.appendFile('horaOutput.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
      await fs.appendFile('horaInput.txt', `\n${input}`, () => console.log(`PWM: ${input}`) )
    } else if (motorOpt == 1) {
      await fs.appendFile('antiOutput.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
      await fs.appendFile('antiInput.txt', `\n${input}`, () => console.log(`PWM: ${input}`) )
    }
  }

  async function grabar () {
    for (let k = 0; k < 5000; k++) {
      await grabarOne()
      await delay(1)
    }
  }

  async function lanzar (motorOpt) {
    /* motorOpt : 0 (horario)
       motorOpt : 1 (antihorario) */

    motors[motorOpt].fwd(input)
    motors[1 - motorOpt].rev(input)

    board.wait(15000, function () {
      motors.stop()
    })
  }

  async function todo (motorOpt) {
    input = 0
    grabar()
    await delay(500)
    input = 200
    await lanzar(motorOpt)
  }

  let error1p = 0
  let error2p = 0
  let pid1p = 0

  let error1n = 0
  let error2n = 0
  let pid1n = 0

  let error0
  let pid0

  let getted
  let input

  async function controll (setPoint) {
    error0 = setPoint - output
    getted = error0 < 1 && error0 > -1

    if (error0 < 0) {

      // PI para negatives errors
      pid0 = pid1n + 0.002682 * error0 - 0.002682 * error1n

      motorOpt = 0

      error1n = error0
      pid1n = pid0

      // cancelar los positives errors y pid
      error1p = 0
      error2p = 0
      pid1p = 0

    } else {
      // PI para positives errors
      pid0 = pid1p + 0.001883 * error0 - 0.001883 * error1p

      motorOpt = 1

      error1p = error0
      pid1p = pid0

      // cancelar los negatives errors y pid
      error1n = 0
      error2n = 0
      pid1n = 0
    }

    input = Math.abs(pid0) * 255

    if (input > 255) {
      input = 255
    } else if (input < 150 && getted == false) {
      input = 200
    } else if (getted = true) {
      input = 0
    }

    await delay(1)

    if (getted) {
      await motors.stop()
      called = false
    } else if (getted == false && called == false) {
      called = true
      await motors[motorOpt].fwd(input)
      await motors[1 - motorOpt].rev(input)
    }

    console.log("==================================================")
    console.log(`Output   : ${output}`)
    console.log(`Error    : ${error0}`)
    console.log(`PID      : ${pid0}`)
    console.log(`Input    : ${input}`)
    console.log(`MotorOpt : ${motorOpt}`)
    console.log(`Getted   : ${getted}`)
    console.log(`Called   : ${called}`)
    console.log("==================================================")
  }

  let called = false
  async function moveIt () {
    called = true
    await motors[motorOpt].fwd(input)
    await motors[1 - motorOpt].rev(input)
  }

})
