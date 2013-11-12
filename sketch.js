var setup;
var draw;

var RESOLUTION= 32;
var scale;
var hue = random();
var points = [];

var socket = io.connect('http://'+window.location.hostname);

setup = function() {
  createGraphics(1000, 1000);
  colorMode("hsb");
  scale = width/RESOLUTION;
  noFill();
  stroke(0,0,0.5);
  strokeWeight(10);
  rect(0,0,width,height);
};

draw = function() {
};

var xlast=0;
var ylast=0;

var paint = function(x,y){
  var p = { 'x':x, 'y':y, 'hue' : hue}

  if (xlast!=x || ylast!=y){
    points.push(p);
    xlast = x;
    ylast = y;
  }

  for (var i=-1; i<1; i++){
    for (var j=-1; j<1; j++){
      if(x+i < width/scale && x+i >= 0 && y+j < height/scale && y+j>=0){
        fill(hue,1,1);
        noStroke();
        rect(x*scale, y*scale, scale, scale);
      }
    }
  }
}

var mousePressed = function() {
    var x = Math.floor(mouseX/scale);
    var y = Math.floor(mouseY/scale);
    paint(x,y);
}

var mouseDragged = mousePressed;

var touchMoved= function() {
    var x = Math.floor(touchX/scale);
    var y = Math.floor(touchY/scale);
    paint(x,y);
}
var touchStarted= function() {
    var x = Math.floor(touchX/scale);
    var y = Math.floor(touchY/scale);
    paint(x,y);
}
var touchEnded= function() {
    var x = Math.floor(touchX/scale);
    var y = Math.floor(touchY/scale);
    paint(x,y);
}

setInterval(function(){
  points.forEach(function(point){
    socket.emit('point', point);
    console.log(point);
  })
  points = [];
}, 50);
