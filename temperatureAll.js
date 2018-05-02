const fs    = require('fs')
const five  = require('johnny-five')
const board = new five.Board()

board.on("ready", function () {
  var zcSensor = new five.Sensor.Digital(2)

  var multi = new five.Multi({
    controller: "BME280"
  })

  zcSensor.on("change", function() {
    console.log(this.value)
  })

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

  async function experimentalData () {
    await fs.unlink('outputTemperature.txt', function (err) {})
    await fs.unlink('entryVolt.txt', function (err) {})

  }
})
