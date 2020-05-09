var P5 = require('p5');

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 600;

let drawer = (p5) => {
  p5.setup = () => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p5.colorMode(p5.HSB, 100);

    p5.video = p5.createCapture(p5.VIDEO);
    p5.video.size(320, 240);
    p5.video.hide();

  };

 p5.draw = () => {
     p5.image(p5.video, 0, 0, p5.mouseX, p5.mouseY);
 };
};

var app = new P5(drawer);
