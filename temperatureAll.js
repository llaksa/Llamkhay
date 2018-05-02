const fs        = require('fs')
const NanoTimer = require('nanotimer')
const five      = require('johnny-five')

const board = new five.Board()

board.on("ready", function () {
  let i          = 0
  let zero_cross = false
  let freqStep   = '65u'

  const timer    = NanoTimer()
  const zcSensor = new five.Sensor.Digital(2)
  const multi    = new five.Multi({
    controller: "BME280"
  })

  zcSensor.on("change", function() {
    console.log(this.value)
    zero_cross = true;               // set the boolean to true to tell our dimming function that a zero cross has occured
    i=0;
    digitalWrite(AC_pin, LOW);       // turn off TRIAC (and AC)
  })

  timer.serInterval(dim_check, '', freqStep)

  function dim_check() {
    if(zero_cross == true) {
      if(i>=dim) {
        digitalWrite(AC_pin, HIGH); // turn on light
        i=0;  // reset time step counter
        zero_cross = false; //reset zero cross detection
      }
      else {
        i++; // increment time step counter
      }
    }
  }

  void loop() {
    val = analogRead(analogPotPin) / 8;
    dim = 128 - val;
    Serial.println(val);
    delay(18);
  }

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

})
