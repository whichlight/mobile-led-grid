var SerialPort = require("serialport").SerialPort,
    server = require('node-static');

var fileServer = new server.Server(__dirname);

var app = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(8080);

var io = require('socket.io').listen(app);


var serialPort = new SerialPort("/dev/tty.usbmodem1421", {
  baudrate: 9600
});

process.stdin.resume();
process.stdin.setEncoding('utf8');



//visualization vars

var RESOLUTION = 32;

//buffer[time][x+y*res] = val
var bufferlen = 100;
var buffer = new Array(bufferlen);
var bufferindex = 0;

var touch = []; //transfer the gesture data
var points = []; //logic for the vis
var sendstr = [];  // what to transmit


for(var i=0;i<bufferlen;i++){
  buffer[i]={};
}


serialPort.on("open", function () {
  console.log('open');
  /*
  serialPort.on('data', function(data) {
    process.stdout.write(data);
  });

  process.stdin.on('data', function (chunk) {
    process.stdout.write('STDIN: ' + chunk);
    serialPort.write(chunk, function(err, results) {
      if (err) console.log('err ' + err);
    });
  });
  */

  /*
    INPUT: x,y,h,s,v;
    x : 0 to 31
    y : 0 to 31
    h : 0 to 1535
    s : 0 to 255
    v : 0 to 255
  */

  setInterval(function(){
    while(touch.length>0){
      var p = points.shift();
      if(p){
        var h = Math.floor(p.hue *1535);
        var str = p.x+','+p.y+','+h+',255,255;';
        console.log(str);
        serialPort.write(str, function(err, res){
          if (err) console.log('err '+err);
        });
      }
    }
  },100);
});

//io to touch
io.sockets.on('connection', function (socket) {
  socket.on('point', function (data) {
    touch.push(data);
  });
});

//from touch to points
setInterval(function(){
  touch.forEach(function(t){
    points.push(new Point(t.x, t.y, t.hue, 1,1));
    buffer[bufferindex][t.x+RESOLUTION*t.y]=t;
  })
  touch= [];
}, 50);

function Point(x,y,h,s,l) {
  this.hue = h;
  this.s = s;
  this.life = l;
  this.x=x;
  this.y=y;
}

Point.prototype.update = function(){
  this.life-=0.05;
  if(this.life<0){
    points.splice(points.indexOf(this),1);
  }
}

Point.prototype.display = function() {
  for (var i=-1; i<1; i++){
    for (var j=-1; j<1; j++){
      if(this.x+i < RESOLUTION && this.x+i >= 0 && this.y+j < RESOLUTION && this.y+j>=0){
        sendstr(this);
      }
    }
  }
}
