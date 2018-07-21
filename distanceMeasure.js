const fs = require("fs")
const five = require("johnny-five")
const board = new five.Board()

board.on("ready", async function() {
  const proximity = new five.Proximity({
    controller: "HCSR04",
    pin: 7
  })

  let y1 = 0
  proximity.on("data", async function() {
    let y0 = this.cm * 0.0609 + y1 * 0.9391
    output = y0
    console.log("  cm  : ", this.cm);
    y1 = y0
  })

})

/*
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "HCSR04",
    pin: 7
  });

  proximity.on("data", function() {
    console.log("  cm  : ", this.cm);
  });

});
*/
