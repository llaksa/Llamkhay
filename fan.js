const fs    = require('fs')
const five  = require("johnny-five")
const board = new five.Board()

board.on("ready", async function() {

  board.repl.inject({
    fan: fan
  })

  const velocity = new five.Sensor({
    pin: 4,
    freq: 25,
    type: "digital"
  })

  let t1 = new Date() * 1
  let t0 = 0
  let n0 = 0
  let n1 = 0
  let vel0 = 0
  let vel1 = 0
  let tDif
  velocity.on("change", () => {
    n0 = n0 + 1
    t0 = new Date() * 1
  })

  setInterval(() => {
    console.log("==============================")
    console.log("vel0: " + vel0)
    tDif = t0 - t1
    //console.log("n0: " + n0)
    //console.log("n1: " + n1)
    //console.log("tDif: " + tDif)
    vel0 = (n0 - n1) * 100000 / (6 * 0.1)
    t1 = t0
    n1 = n0
  }, 100)

  this.pinMode(10, five.Pin.PWM)
  async function fan (x) {
    if (x < 90) {
      board.analogWrite(10, 0)
    } else if (x > 255) {
      board.analogWrite(10, 255)
    } else {
      board.analogWrite(10, x)
    }
  }
  await fan(0)

  let resPot = new five.Sensor("A3")
  let valPot

  // Scale the sensor's data from 0-1023 to 0-10 and log changes
  resPot.on("change", async () => {
    valPot = resPot.scaleTo(0, 255)
    await fan(valPot)
    //console.log(valPot)
  })

})
