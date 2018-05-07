var five = require("johnny-five")
var board = new five.Board()

board.on("ready", function() {

  var temp = new five.Thermometer({
    controller: "LM35",
    pin: "A0",
    freq: 100
  })

  let y1 = 0
  temp.on("data", function() {
    let y0 = this.celsius * 0.0609 + y1 * 0.9391
    console.log(Math.round(y0))
    y1 = y0
  })

})








