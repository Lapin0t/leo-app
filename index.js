import 'regenerator-runtime/runtime'
import P5 from 'p5'
import MedianCut from 'mediancut'
import { virtualAnalog } from './virtualAnalog.js'


const CANVAS_HEIGHT = 240
const CANVAS_WIDTH = 320
const N_COLORS = 5

const sketch = (p5) => {
  p5.setup = () => {
    // initialisation audio
    p5.audioCtx = new window.AudioContext()
    virtualAnalog.createDSP(p5.audioCtx, 512)
      .then(dsp => {
          p5.synth = dsp
          p5.synth.connect(p5.audioCtx.destination)
      })

    // initialisation canvas
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    p5.colorMode(p5.HSB, 100)
    p5.frameRate(5)
    p5.textSize(30)
    p5.textAlign(p5.CENTER)

    // initialisation webcam
    p5.video = p5.createCapture(p5.VIDEO)
    p5.video.size(CANVAS_WIDTH, CANVAS_HEIGHT)
    p5.video.hide()

  };

  p5.draw = () => {
    // copie la frame de video dans le canvas
    p5.image(p5.video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // quantisation des couleurs (buggué, pourquoi pas en entier?)
    let img = p5.drawingContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    let medianCut = new MedianCut(img)
    let qimg = medianCut.reduce(16)
    p5.drawingContext.putImageData(qimg, 0, 0, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }
}

document.app = new P5(sketch)
