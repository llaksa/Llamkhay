const fs    = require('fs')
const five  = require("johnny-five")
const board = new five.Board()

board.on("ready", async function() {

  board.repl.inject({
    fan: fan
  })

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
    if (n > 2) {
      let t0 = new Date() * 1
      tDif = t0 - t1
      vel0 = 100000 / (6*tDif)
      //console.log("vel0: " + vel0)
      t1 = t0
      n = 0
    }
  })

  setInterval(() => {
    if (vel0 == vel1) {
      vel0 = 0
    }
    console.log("==============================")
    //console.log("tDif: " + tDif)
    console.log("vel0: " + vel0)
    //console.log("n: " + n)
    vel1 = vel0
    /*
    console.log("========================")
    console.log("var de t: " + tDif)
    console.log("t1: " + t1)
    */
  }, 100)

  this.pinMode(9, five.Pin.PWM)
  async function fan (x) {
    if (x < 90) {
      board.analogWrite(9, 0)
    } else if (x > 255) {
      board.analogWrite(9, 255)
    } else {
      board.analogWrite(9, x)
    }
  }
  await fan(0)

})
