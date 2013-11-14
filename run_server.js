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

process.stdin.resume();
process.stdin.setEncoding('utf8');


//visualization vars

var RESOLUTION = 32;

//buffer[time][x+y*res] = val
var bufferlen = 30;
var buffer = new Array(bufferlen);
var bufferindex = 0;

var touch = []; //transfer the gesture data
var points = []; //logic for the vis
var sendstr = [];  // what to transmit


for(var i=0;i<bufferlen;i++){
  buffer[i]={};
}

var screen = new Array(RESOLUTION);

for(var i=0;i<screen.length;i++){
  screen[i]=new Array(RESOLUTION);
}

var clearScreen = function(){
  for(var i=0;i<screen.length;i++){
    for(var j=0;j<screen.length;j++){
      screen[i][j]={"x":i, "y":j, "hue":0, "s":0, "life":1};
    }
  }
}

clearScreen();


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
    var str = p.x+','+p.y+','+h+','+Math.floor(p.s*255)+','+Math.floor(255)+';';
    serialPort.write(str, function(err, res){
      console.log(str);
      if (err) console.log('err '+err);
    });
  });


  eventEmitter.on('send_array_serial', function(arr){
    for(var i=0;i<screen.length;i++){
      for(var j=0;j<screen.length;j++){
        var p = screen[i][j];
        var h = Math.floor(p.hue *1535);
        var str = p.x+','+p.y+','+h+','+Math.floor(p.s*255)+','+Math.floor(255)+';';
        serialPort.write(str, function(err, res){
          if (err) console.log('err '+err);
        });
      }
    }
  });

});

//io to touch
io.sockets.on('connection', function (socket) {
  socket.on('point', function (data) {
   eventEmitter.emit('send_point_serial', new Point(data.x, data.y, data.hue, 1,1));
    //buffer[bufferindex][t.x+RESOLUTION*t.y]=t;
  });
});

//from touch to points
/*
setInterval(function(){
//  addBufferPoints(buffer[bufferindex]);
  points.forEach(function(point){
//   point.update();
    point.display();
    points.splice(points.indexOf(point),1);
  });
  bufferindex++;
  bufferindex%=bufferlen;
}, 100);
*/



var addBufferPoints = function(pointsDict){
  Object.keys(pointsDict).forEach(function(index){
    var x  = index % RESOLUTION;
    var y  = (index-x) / RESOLUTION;
    points.unshift(new Point(x,y,0,0,0.5));
  });
}

function Point(x,y,h,s,l) {
  this.hue = h;
  this.s = s;
  this.life = l;
  this.x=x;
  this.y=y;
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
