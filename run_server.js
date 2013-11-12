var SerialPort = require("serialport").SerialPort,
    server = require('node-static');

var points = [];
var fileServer = new server.Server(__dirname);

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
  while(points.length>0){
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

io.sockets.on('connection', function (socket) {
  socket.on('point', function (data) {
    points.push(data);
    console.log(data);
  });
});

function getPoints(){
    if (points.length>0){
        return points;
    }
    else{
        return 0;
    }
}
