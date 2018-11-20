const fs    = require('fs')
const five  = require("johnny-five")
const board = new five.Board()

board.on("ready", async function () {

  let pot = new five.Sensor({
    pin: "A3",
  })

  let potIn
  pot.on("change", async () => {
    potIn = pot.scaleTo(0, 12)
    await grabarOne()
  })

  let rc = new five.Sensor({
    pin: "A2",
  })

  let rcOut
  rc.on("change", () => {
    rcOut = rc.scaleTo(0, 12)
  })

  board.repl.inject({
    reset: reset
  })

  // SAVING DATA
  async function grabarOne () {
    await fs.appendFile('rcout.txt', `\n${rcOut}`, () => console.log(`RC Out: ${rcOut}`))
    await fs.appendFile('potin.txt', `\n${potIn}`, () => console.log(`Pot In: ${potIn}`) )
    await delay(100)
  }

  async function reset () {
    await fs.unlink('rcout.txt', () => console.log(`RC out: ${rcOut}`))
    await fs.unlink('potin.txt', () => console.log(`Pot In: ${potIn}`))
  }

  // UTILS
  async function delay (time) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }

  await reset()

})
