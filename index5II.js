var five = require("johnny-five")
var board = new five.Board()

var y0 = 0

board.on("ready", function() {
  var imu = new five.IMU({
    controller: "MPU6050"
    //freq: 100000      // optional
  });

  imu.on("change", function() {
  //  console.log("=========================")
    y0 = 0.0549*this.gyro.yaw.angle + y0*0.945
    //y0 = 0.0006281*this.gyro.yaw.angle + y0*0.9994
    //console.log(" rotación horizontal          : ", this.gyro.yaw.angle)
    //console.log(" rotación horizontal          : ", Math.round(y0*10)/10)
  //  console.log("=========================")
  })

  /*
     Motor A: PWM 9, dir 8
     Motor B: PWM 6, dir 5
   */
  var motors = new five.Motors([
    { pins: { dir: 8, pwm: 9 }, invertPWM: true },
    { pins: { dir: 7, pwm: 6}, invertPWM: true }
  ])

  board.repl.inject({
    motors: motors,
    myFwd: myFwd,
    myRev: myRev
  })

  function myFwd (motor, value) {
    // Go forward at full speed for 5 seconds
    console.log("Full speed ahead!")
    motors[motor].forward(value)
    board.wait(100, function () {
      motors[motor].stop()
      console.log(" rotación horizontal          : ", Math.round(y0*10)/10)
    })
  }

  function myRev (motor, value) {
    // Go forward at full speed for 5 seconds
    console.log("Full speed ahead!")
    motors[motor].reverse(value)
    board.wait(100, function () {
      motors[motor].stop()
      console.log(" rotación horizontal          : ", Math.round(y0*10)/10)
    })
  }

})
