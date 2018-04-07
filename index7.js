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
    finalA: finalA,
    lanzar: lanzar,
    grabar: grabar,
    grabarOne: grabarOne,
    todo: todo
  })

  async function both (motorNum) {
    let entry

    if (i >= 500 && i < 1000) {
      entry = 0
      if (dir == true) { // guardando datos según el sentido de giro
        await fs.appendFile('outN.txt', `\n${0}`, () => console.log(`Angular position: ${0}`))
        await fs.appendFile('inpN.txt', `\n${0}`, () => console.log(`PWM: ${0}`) )
      } else {
        await fs.appendFile('outP.txt', `\n${0}`, () => console.log(`Angular position: ${0}`))
        await fs.appendFile('inpP.txt', `\n${0}`, () => console.log(`PWM: ${0}`) )
      }
    } else if (i >= 1000 && i < 1500) {
      if (i == 999) {
        milqui = output
      }

      entry = 255
      if (dir == true) { // guardando datos según el sentido de giro
        await fs.appendFile('outN.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
        await fs.appendFile('inpN.txt', `\n${255}`, () => console.log(`PWM: ${255}`) )
      } else {
        await fs.appendFile('outP.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
        await fs.appendFile('inpP.txt', `\n${255}`, () => console.log(`PWM: ${255}`) )
      }

    } else if (i >= 1500 && i < 2000) {
      entry = 0
      if (dir == true) { // guardando datos según el sentido de giro
        await fs.appendFile('outN.txt', `\n${milqui}`, () => console.log(`Angular position: ${milqui}`))
        await fs.appendFile('inpN.txt', `\n${0}`, () => console.log(`PWM: ${0}`) )
      } else {
        await fs.appendFile('outP.txt', `\n${milqui}`, () => console.log(`Angular position: ${milqui}`))
        await fs.appendFile('inpP.txt', `\n${0}`, () => console.log(`PWM: ${0}`) )
      }
    } else if (i >= 0 && i < 500) {
      entry = 255
      if (dir == true) { // guardando datos según el sentido de giro
        await fs.appendFile('outN.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
        await fs.appendFile('inpN.txt', `\n${255}`, () => console.log(`PWM: ${255}`) )
      } else {
        await fs.appendFile('outP.txt', `\n${output}`, () => console.log(`Angular position: ${output}`))
        await fs.appendFile('inpP.txt', `\n${255}`, () => console.log(`PWM: ${255}`) )
      }
    }

    motors[motorNum].fwd(entry)
    motors[1 - motorNum].rev(entry)

    board.wait(100, function () {
      motors.stop()
    })
  }

  function delay (time) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }

  async function finalH () {
    //await fs.unlink('outputPos.txt', function (err) {})
    //await fs.unlink('entryPos.txt', function (err) {})

    while (i < 2000) {
      console.log(i)
      dir = true
      await both(0)
      i++
    }
  }

  async function finalA () {
    //await fs.unlink('outputNeg.txt', function (err) {})
    //await fs.unlink('entryNeg.txt', function (err) {})

    while (i < 2000) {
      console.log(i)
      dir = false
      await both(1)
      i++
    }
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

})
