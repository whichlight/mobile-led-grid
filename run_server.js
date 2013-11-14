var SerialPort = require("serialport").SerialPort,
    server = require('node-static'),
    events = require('events');

var fileServer = new server.Server(__dirname);
var eventEmitter = new events.EventEmitter();

var app = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(8080);

var io = require('socket.io').listen(app);

var serialPort = new SerialPort("/dev/tty.usbmodem1411", {
  baudrate: 9600
});

var points = []; //logic for the vis


serialPort.on("open", function () {
  console.log('open');
  /*
     INPUT: x,y,h,s,v;
     x : 0 to 31
     y : 0 to 31
     h : 0 to 1535
     s : 0 to 255
     v : 0 to 255
     */

  eventEmitter.on('send_point_serial', function(p){
    var h = Math.floor(p.hue *1535);
    var str = p.x+','+p.y+','+h+','+Math.floor(p.s*255)+','+Math.floor(p.life*255)+';';
    serialPort.write(str, function(err, res){
      console.log(str);
      if (err) console.log('err '+err);
    });
  });
});

io.sockets.on('connection', function (socket) {
  socket.on('point', function (data) {
   new Point(data.x, data.y, data.hue, 1,1);
  });
});

var draw = function(){
  points.forEach(function(p){
    p.display();
    p.update();
  })
}


function Point(x,y,h,s,l) {
  this.hue = h;
  this.s = s;
  this.life = l;
  this.x=x;
  this.y=y;
  this.display();
  this.done();

}

Point.prototype.update = function(){
  this.life-=0.1;
  if(this.life<0){
    points.splice(points.indexOf(this),1);
  }
}

Point.prototype.display = function() {
   eventEmitter.emit('send_point_serial', this);
}

Point.prototype.done= function() {
  if(this.life>0){
   var that = this;
  setTimeout(function(){
    var p = new Point(that.x, that.y, 0,0,0);
  },1000);
  }
}


