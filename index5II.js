var five = require("johnny-five")
var board = new five.Board()

var y0 = 0

board.on("ready", function() {
  var imu = new five.IMU({
    controller: "MPU6050"
    //freq: 100000      // optional
  });

  imu.on("change", function() {
    console.log("=========================")
    y0 = 0.0549*this.gyro.yaw.angle + y0*0.945
    //y0 = 0.0006281*this.gyro.yaw.angle + y0*0.9994
    //console.log(" rotación horizontal          : ", this.gyro.yaw.angle)
    console.log(" rotación horizontal          : ", Math.round(y0*10)/10)
    console.log("=========================")
  })

})
