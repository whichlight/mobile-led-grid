var setup;
var draw;

var RESOLUTION= 32;
var scale;
var hue = random();
var touch = [];
var points = [];
var xlast=0;
var ylast=0;




var socket = io.connect('http://'+window.location.hostname);

//buffer[time][x+y*res] = val
var bufferlen = 100;
var buffer = new Array(bufferlen);
var bufferindex = 0;
for(var i=0;i<bufferlen;i++){
  buffer[i]={};
}



//setup and draw loop
setup = function() {
  createGraphics(1000, 1000);
  colorMode("hsb");
  scale = width/RESOLUTION;
  stroke(0,0,0.5);
  fill(0,0,0);
  strokeWeight(10);
  rect(0,0,width,height);
};

draw = function() {

//  addBufferPoints(buffer[bufferindex]);
  points.forEach(function(point){
   point.display();
   point.update();
  });
// addRandomNoise();
  bufferindex++;
  bufferindex%=bufferlen;

};


setInterval(function(){
  touch.forEach(function(t){
    socket.emit('point', t);
    console.log(t);
    points.push(new Point(t.x, t.y, t.hue, 1,1));
    buffer[bufferindex][t.x+RESOLUTION*t.y]=t;
  })
  touch= [];
}, 50);


//Functions

var addBufferPoints = function(pointsDict){
    Object.keys(pointsDict).forEach(function(index){
        var x  = index % RESOLUTION;
        var y  = index / RESOLUTION;
        console.log("ADDING x: "+x+","+y);
        points.unshift(new Point(x,y,0,0,0.5));
        console.log('test');
    });
}

function rnd_snd() {
    return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
}

function rnd(mean, stdev) {
    return Math.round(rnd_snd()*stdev+mean);
}

var addRandomNoise = function() {
    var x  = rnd(16,5);
    var y  = rnd(16,5);
    points.push(new Point(x,y,0,0,1));
}


/*UI*/
var paint = function(x,y){
  var p = { 'x':x, 'y':y, 'hue' : hue}
  if (xlast!=x || ylast!=y){
    touch.push(p);
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



////Classes

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
        fill(this.hue,this.s,this.life);
        noStroke();
        rect(this.x*scale, this.y*scale, scale, scale);
}


