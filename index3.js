var five = require("johnny-five")
var board = new five.Board()

board.on("ready", function() {
  // Assuming a sensor is attached to pin "A1"
  this.pinMode(9, five.Pin.INPUT)
  this.digitalRead(9, function(voltage) {
    console.log(voltage)
  })
})
