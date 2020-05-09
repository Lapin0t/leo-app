const P5 = require('p5');
const ATCQ = require('atcq');
const SKMeans = require('skmeans');

const CANVAS_HEIGHT = 240;
const CANVAS_WIDTH = 320;

let drawer = (p5) => {
  p5.setup = () => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p5.colorMode(p5.HSB, 100);
    p5.frameRate(30);
    p5.textSize(30);
    p5.textAlign(p5.CENTER);

    p5.video = p5.createCapture(p5.VIDEO);
    p5.video.size(CANVAS_WIDTH, CANVAS_HEIGHT);
    p5.video.hide();

    //p5.palette = ATCQ.quantizeSync(p5.video, {maxColors: 32});
    //console.log(palette);

  };

  p5.get_pixels = () => {
    let img = p5.drawingContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    let pxs = []
    let i
    for (i = 0; i < CANVAS_WIDTH * CANVAS_HEIGHT; i++) {
        pxs.push((img.data[3*i], img.data[3*i + 1], img.data[3*i+2]))
    }
    pxs
  }

  p5.draw = () => {
    p5.tint(255, 0, 150);
    p5.image(p5.video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    p5.text("frame: " + p5.frameCount, 0, 0);
    console.log(p5.get_pixels());
  };
};

var app = new P5(drawer);
