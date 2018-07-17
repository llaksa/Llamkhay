const five = require("johnny-five")
const board = new five.Board()

board.on("ready", function() {
  const light = new five.Light({
    controller: "BH1750",
  })

  light.on("data", function() {
    console.log("Lux: ", this.lux);
  })
})
