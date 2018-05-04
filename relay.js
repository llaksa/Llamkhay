var five = require("johnny-five")
var board = new five.Board()

board.on("ready", function() {
  var relay = new five.Relay({
    pin: 10,
    type: "NO"
  })

  // Control the relay in real time
  // from the REPL by typing commands, eg.
  //
  // relay.on();
  //
  // relay.off();
  //
  // OR...
  //
  // relay.open();
  //
  // relay.close();
  //
  this.repl.inject({
    relay: relay
  })
})
