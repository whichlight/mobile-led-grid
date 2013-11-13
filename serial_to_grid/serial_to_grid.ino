/*
serial to RGB LED grid, 32x32
 
 input from serial as `x,y,hue;`
 maps to LED grid
 
 Kawandeep Virdee
 @whichlight
 */

#include <Adafruit_GFX.h>   // Core graphics library
#include <RGBmatrixPanel.h> // Hardware-specific library

// If your 32x32 matrix has the SINGLE HEADER input,
// use this pinout:
#define CLK 8  // MUST be on PORTB!
#define OE  9
#define LAT 10
#define A   A0
#define B   A1
#define C   A2
#define D   A3

RGBmatrixPanel matrix(A, B, C, D, CLK, LAT, OE, false);

void setup() {
  Serial.begin(9600);
  matrix.begin();

  for(int y=0; y < matrix.width(); y++) {
    for(int x=0; x < matrix.height(); x++) {
      matrix.drawPixel(x, y, matrix.Color333(0,0,0));
    }
  }
}

void loop() {
  // do nothing
  while(Serial.available() > 0)
  {

    int x = Serial.parseInt(); 
    int y = Serial.parseInt(); 
    int h = Serial.parseInt(); 
    int s = Serial.parseInt();
    int v = Serial.parseInt(); 

    if (Serial.read() == 59) {
      matrix.drawPixel(x,y,matrix.ColorHSV(h,s,v,true));
    }
  }
}




