var app    = require('express')()
var server = require('http').Server(app)
var io     = require('socket.io')(server)
var five   = require('johnny-five')
var state  = false



server.listen(3000)

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
});



var board = new five.Board()

board.on("ready", function() {
  var led = new five.Led(11)

  io.on('connection', function (socket) {

    socket.on('clickToggle', function () {
      state = !state
      if (state) {
        led.pulse()
      } else {
        led.stop().off()
      }
    })
  })
})



/*
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' })
  socket.on('my other event', function (data) {
    console.log(data)
  })
})
*/

