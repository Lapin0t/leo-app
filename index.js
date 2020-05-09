const P5 = require('p5');
//const ATCQ = require('atcq');
const skmeans = require('skmeans');
document.skmeans = skmeans;

const CANVAS_HEIGHT = 240;
const CANVAS_WIDTH = 320;

const N_COLORS = 5;

const sketch = (p5) => {
  p5.out = 0;

  p5.update_palette = () => {
    let img = p5.drawingContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    let pix = []
    for (let i = 0; i < CANVAS_WIDTH * CANVAS_HEIGHT; i++) {
        pix.push([img.data[3*i], img.data[3*i + 1], img.data[3*i+2]])
    }

    let out = skmeans(pix, N_COLORS)
    p5.palette = out.centroids.map((c) => c.map(Math.trunc))
  }

  p5.setup = () => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p5.colorMode(p5.HSB, 100);
    p5.frameRate(30);
    p5.textSize(30);
    p5.textAlign(p5.CENTER);

    p5.video = p5.createCapture(p5.VIDEO);
    p5.video.size(CANVAS_WIDTH, CANVAS_HEIGHT);
    p5.video.hide();

    p5.update_palette();

    //p5.palette = ATCQ.quantizeSync(p5.video, {maxColors: 32});
    //console.log(palette);

  };

  p5.draw = () => {
    p5.tint(255, 0, 150);
    p5.image(p5.video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if ((p5.frameCount & 63) === 0) p5.update_palette();

    for (let i = 0; i < N_COLORS; i++) {
        p5.fill(p5.palette[i][0], p5.palette[i][1], p5.palette[i][2])
        p5.rect(10*i, 0, 10, 10);
    }
  };
};

document.app = new P5(sketch);
