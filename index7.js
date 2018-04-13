const fs    = require('fs')
const five  = require("johnny-five")
const board = new five.Board()

board.on("ready", function() {

  let imu = new five.IMU({
    controller: "MPU6050",
    address: 0x68, // optional
    freq: 10000      // optional
    // freq: 100000 // optional
  });

  /* Motor A: PWM 9, dir 8
     Motor B: PWM 6, dir 5 */
  const motors = new five.Motors([
    { pins: { dir: 8, pwm: 9 }, invertPWM: true },
    { pins: { dir: 7, pwm: 6}, invertPWM: true }
  ])

  let output
  let motorOpt

  let p0 = {x: 0, y: 0, z: 0}
  let p1 = {}

  let v0 = {x: 0, y: 0, z: 0}
  let v1 = {}

  let a0 = {x: 0, y: 0, z: 0}
  let a1 = {}

  let u0 = {x: 0, y: 0, z: 0}
  let y0 = {x: 0, y: 0, z: 0}
  let y1 = {}

  let varVolt = 1;  // среднее отклонение (ищем в excel)
  let varProcess = 1; // скорость реакции на изменение (подбирается вручную)
  let Pc = 0.0;
  let G = 0.0;
  let P = 1.0;
  let Xp = 0.0;
  let Zp = 0.0;
  let Xe = 0.0;

  imu.on("change", async function() {
    let t1 = new Date()

    y1 = y0

    p1 = p0
    v1 = v0
    a1 = a0

    output = Math.round(100 * (this.gyro.yaw.angle)) / 100

    let setPoint = 50
    await controll(setPoint)

    console.log("Thermometer");
    console.log("  celsius      : ", this.thermometer.celsius);
    console.log("  fahrenheit   : ", this.thermometer.fahrenheit);
    console.log("  kelvin       : ", this.thermometer.kelvin);
    console.log("--------------------------------------");

    console.log("Accelerometer");
    console.log("  x            : ", this.accelerometer.x);
    console.log("  y            : ", this.accelerometer.y);
    console.log("  z            : ", this.accelerometer.z);
    console.log("  pitch        : ", this.accelerometer.pitch);
    console.log("  roll         : ", this.accelerometer.roll);
    console.log("  acceleration : ", this.accelerometer.acceleration);
    console.log("  inclination  : ", this.accelerometer.inclination);
    console.log("  orientation  : ", this.accelerometer.orientation);
    console.log("--------------------------------------");

    console.log("Gyroscope");
    console.log("  x            : ", this.gyro.x);
    console.log("  y            : ", this.gyro.y);
    console.log("  z            : ", this.gyro.z);
    console.log("  pitch        : ", this.gyro.pitch);
    console.log("  roll         : ", this.gyro.roll);
    console.log("  yaw          : ", this.gyro.yaw);
    console.log("  rate         : ", this.gyro.rate);
    console.log("  isCalibrated : ", this.gyro.isCalibrated);
    console.log("--------------------------------------");

    console.log("===========================================")
    let t0 = new Date()
    let aux = 0.5 * (t0 - t1)

    u0 = this.gyro.rate

    y0 = {
      x: filter(u0.x),
      y: filter(u0.y),
      z: filter(u0.z),
    }

    a0 = y0

    v0.x = v1.x + aux * (a0.x - a1.x)
    v0.y = v1.y + aux * (a0.y - a1.y)
    v0.z = v1.z + aux * (a0.z - a1.z)

    p0.x = p1.x + aux * (v0.x + v1.x)
    p0.y = p1.y + aux * (v0.y + v1.y)
    p0.z = p1.z + aux * (v0.z + v1.z)

    console.log(p0)
    console.log(y0)
    console.log("===========================================")
  })

  board.repl.inject({
    motors: motors,
    delay: delay,
    lanzar: lanzar,
    grabar: grabar,
    grabarOne: grabarOne,
    todo: todo,
    controll: controll,
    moveIt: moveIt,
    filter: filter
  })

  function filter (val) {  //функция фильтрации
    Pc = P + varProcess;
    G = Pc/(Pc + varVolt);
    P = (1-G)*Pc;
    Xp = Xe;
    Zp = Xp;
    Xe = G*(val-Zp)+Xp; // "фильтрованное" значение
    return(Xe);
  }

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

    /*
    console.log("==================================================")
    console.log(`Output   : ${output}`)
    console.log(`Error    : ${error0}`)
    console.log(`PID      : ${pid0}`)
    console.log(`Input    : ${input}`)
    console.log(`MotorOpt : ${motorOpt}`)
    console.log(`Getted   : ${getted}`)
    console.log(`Called   : ${called}`)
    console.log("==================================================")
    */
  }

  let called = false
  async function moveIt () {
    called = true
    await motors[motorOpt].fwd(input)
    await motors[1 - motorOpt].rev(input)
  }

})
