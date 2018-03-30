var five = require("johnny-five")
var board = new five.Board()

board.on("ready", function() {
  var imu = new five.IMU({
    controller: "MPU6050"
    //freq: 100000      // optional
  });

  imu.on("change", function() {
    console.log(" rotación horizontal          : ", this.gyro.yaw.angle)
  })

})
