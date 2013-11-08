var RESOLUTION= 32;
var px;
var scale;

//base color
var minColor = 200;
var widthColor = 100;

//user color
var brush = 0;

var setup = function() {
  createGraphics(600, 600);
  colorMode("hsb");
  px = new Array(RESOLUTION);
  for (var i = 0; i<px.length; i++) {
    px[i] = new Array(RESOLUTION);
  }

  for (var i = 0; i<px.length; i++) {
    for (var j = 0; j<px[0].length; j++) {
      px[i][j]=(minColor+widthColor*random())/360;
    }
  }

  scale = width/RESOLUTION;
};

var draw = function() {
  for (var i = 0; i<px.length; i++) {
    for (var j = 0; j<px[0].length; j++) {
      px[i][j]=backColor(px[i][j], minColor+widthColor, minColor);
      fill(px[i][j],1,1);
      noStroke();
      rect(i*scale, j*scale, scale, scale);
    }
  }
};

function backColor(val, maxVal, minVal){
  val*=360;
  val+=1;
  if(val>(maxVal)){
    val=minVal;
  }
  return val/360;
}


var paint = function(x,y){
  for (var i=-1; i<2; i++){
    for (var j=-1; j<2; j++){
      if(x+i < px.length && x+i >= 0 && y+j < px[0].length && y+j>=0){
        px[x+i][y+j] = brush/360;
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
