const fs        = require('fs')
const NanoTimer = require('nanotimer')
const five      = require('johnny-five')

let          i = 0
let zero_cross = false
const freqStep = '65u'
let        val = 0
let        dim = 128

const halfWave = 10
let     potVal = 0

const board = new five.Board()

board.on("ready", function () {

  const AC_pin        = 9
  const timer         = new NanoTimer()
  const potenciometer = new five.Sensor("A0")
  const zetaCross     = new five.Sensor({
    pin: 2,
    type: "digital",
    freq: 1
  })
  const multi         = new five.Multi({
    controller: "BME280"
  })

  this.pinMode(AC_pin, five.Pin.PWM)

  zetaCross.on("change", async function () {
    //timer.clearTimeout()
    zero_cross = true               // set the boolean to true to tell our dimming function that a zero cross has occured
    //i = 0
    //await board.analogWrite(AC_pin, 0)       // turn off TRIAC (and AC)
  })

  async function both () {
    if (zero_cross == true) {
      await acLow()
      zero_cross = false
    } else {
      await acHigh()
    }
  }

  timer.setInterval(both, '', '11s')

  async function acLow () {
    //timer.clearTimeout()
    timer.setTimeout(() => {
      board.analogWrite(AC_pin, 0)
    }, '', `${Math.round(halfWave * potVal)}s`)
  }

  async function acHigh () {
    //timer.clearTimeout()
    timer.setTimeout(() => {
      board.analogWrite(AC_pin, 255)
    }, '', `${Math.round(halfWave * (1 - potVal))}s`)
  }

  //timer.setInterval(dim_check, '', freqStep)

  async function dim_check() {
    console.log(`zero cross : ${zero_cross}`)
    console.log(`i          : ${i}`)
    console.log(`dim        : ${dim}`)
    console.log(`val        : ${val}`)
    if(zero_cross == true) {
      if(i>=dim) {
        //console.log('mayor que dim')
        await board.analogWrite(AC_pin, 255) // turn on light
        i = 0  // reset time step counter
        zero_cross = false //reset zero cross detection
      }
      else {
        //console.log('i++')
        //console.log(i)
        i++ // increment time step counter
      }
    }
  }

  // Value from potenciometer pin
  potenciometer.on("change", function() {
    //val = Math.round(this.value / 8)
    //dim = 128 - val
    potVal = Math.round(this.fscaleTo(0, 1) * 100) / 100
  })

  /*
  multi.on("data", function() {
    console.log("Thermometer")
    console.log("  celsius      : ", this.thermometer.celsius)
    console.log("  fahrenheit   : ", this.thermometer.fahrenheit)
    console.log("  kelvin       : ", this.thermometer.kelvin)
    console.log("--------------------------------------")

    console.log("Barometer")
    console.log("  pressure     : ", this.barometer.pressure)
    console.log("--------------------------------------")

    console.log("Hygrometer")
    console.log("  humidity     : ", this.hygrometer.relativeHumidity)
    console.log("--------------------------------------")

    console.log("Altimeter")
    console.log("  feet         : ", this.altimeter.feet)
    console.log("  meters       : ", this.altimeter.meters)
    console.log("--------------------------------------")
  })

  async function myData () {
    await fs.unlink('outputTemperature.txt', function (err) {})
    await fs.unlink('entryVolt.txt', function (err) {})

  }

  async function myControll () {
  }
  */

})
