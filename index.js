import 'regenerator-runtime/runtime'
import P5 from 'p5'
import MedianCut from 'mediancut'
//import VA from './virtualAnalog.js'
import { violon_fou } from './violon_fou.js'

//window.VA = VA

const clamp = (x, a, b) => x<a?a:x>b?b:x

const CANVAS_HEIGHT = 240
const CANVAS_WIDTH = 320
const N_COLORS = 5



const argmin = (xs) => {
    var i = 0;
    for (let j = 1; j < xs.length; j++) {
      if(xs[j] < xs[i]) {
          i = j
      }
    }
    return i;
}

const argmax = (xs) => {
    var i = 0;
    for (let j = 1; j < xs.length; j++) {
      if(xs[j] > xs[i]) {
          i = j
      }
    }
    return i;
}
// bucket {min[3], max[3], start,length }
const cut_bucket = (data, min, max, start, length) => {
    let r = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
    let chan = argmin(r)

    var xs = []
    for (let i = 0; i<length; i++) { xs.push(i) }
    xs.sort((a, b) => data[3*(start+a) + chan] - data[3*(start+b) + chan])
    console.log(xs)

    let data_old = new Uint8ClampedArray(length)
    data_old.set(data.subarray(start, start+length), 0)
    for (let i = 0; i<length; i++) {
        for (let j = 0; j<3; j++) {
            data[3*(start+i) + j] = data_old[3*(start+xs[i]) + j]
        }
    }

    let med_i = Math.floor(length / 2)

    var max0 = [max[0], max[1], max[2]]
    var min1 = [min[0], min[1], min[2]]
    max0[chan] = data[3*(start+med_i) + chan]
    min1[chan] = data[3*(start+med_i+1) + chan]
    return [max0, min1]
}

window.cut_bucket = cut_bucket

const palette = (img, n) => {
  var min = [0, 0, 0]
  var max = [255, 255, 255]

  for (let i = 0; i < img.width*img.height; i++) {
    for (let j = 0; j < 3; j++) {
      min[j] = Math.min(min[j], img.data[3*i+j])
      max[j] = Math.max(max[j], img.data[3*i+j])
    }
  }

  for (let i = 0; i < n; i++) {

  }
}

const histo = (img, res) => {
    let hist = [new Array(res), new Array(res), new Array(res)]

    for(let i = 0; i<3; i++) {
        for(let j = 0; j<res; j++) {
            hist[i][j] = 0;
        }
    }

    var r,g,b,alpha,beta,hue,chrom,lum

    for(let i = 0; i < img.height*img.width; i++) {
        r = img.data[4*i] / 256
        g = img.data[4*i+1] / 256
        b = img.data[4*i+2] / 256

        beta = Math.sqrt(3) * (g - b) / 2
        alpha = (2*r - g - b) / 2
        hue = Math.atan2(beta, alpha) / (2 * Math.PI)
        if (hue < 0) { hue += 1 }
        chrom = Math.sqrt(alpha**2 + beta**2)
        lum = 0.212*r + 0.701*g + 0.087*b

        hist[0][Math.floor(res * hue)] += 1
        hist[1][Math.floor(chrom * res)] += 1
        hist[2][Math.floor(lum * res)] += 1
        

        //for (let j = 0; j < 3; j++) {
          //  hist[j][Math.floor(img.data[4*i+j] * res / 256)] += 1
        //}
    }
    return hist
}
window.histo = histo
window.col = [0, 0, 0]


const sketch = (p5) => {
  p5.setAudio = (b) => b ? p5.audioCtx.resume() : p5.audioCtx.suspend()
  p5.synth_ready = false

  p5.setup = () => {
    // initialisation audio
    p5.audioCtx = new window.AudioContext()
    violon_fou.createDSP(p5.audioCtx, 512)
      .then(dsp => {
          p5.synth_ready = true
          p5.synth = dsp
          p5.synth.connect(p5.audioCtx.destination)
      })

    let toggle = document.getElementById("audio_toggle")
    toggle.onclick = () => p5.setAudio(toggle.checked)
    p5.setAudio(toggle.checked)

    // initialisation canvas
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    p5.colorMode(p5.RGB, 255)
    p5.frameRate(40)

    // initialisation webcam
    p5.video = p5.createCapture(p5.VIDEO)
    p5.video.size(CANVAS_WIDTH, CANVAS_HEIGHT)
    p5.video.hide()

    

  };

  p5.getPixels = () => p5.drawingContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  p5.draw = () => {
    // copie la frame de video dans le canvas
    p5.image(p5.video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    let hist = histo(p5.getPixels(), 256)
    let i = 0;
    for (let i=0; i<3; i++) {
        p5.fill(255, 255, 0)
        for (let j = 0; j<256; j++) {
            p5.rect(j*1, i*50 + 50 - (hist[i][j] / 50), 1, (hist[i][j] / 50))
        }
    }

    let a = argmax(hist[0])
    let b = argmax(hist[1])
    let c = argmax(hist[2])

    if (p5.synth_ready) {
        p5.synth.setParamValue("/violon_fou/length", 1 - a / 256)
        p5.synth.setParamValue("/violon_fou/pos", c / 256)
    }

    /*let vx = p5.winMouseX - p5.pwinMouseX
    let vy = p5.winMouseY - p5.pwinMouseY
    let v = Math.sqrt(vx*vx + vy*vy)

    var r = Math.round(clamp(v, 1, 50))

    if (p5.frameCount % r == 0 && p5.synth != null) {
        p5.synth.setParamValue("/violon_fou/length", p5.mouseX / CANVAS_WIDTH)
        p5.synth.setParamValue("/violon_fou/pos", p5.mouseY / CANVAS_HEIGHT)
    }*/

    //let f = p5.synth.getParamValue("")
    //p5.synth.

    // quantisation des couleurs (buggué, pourquoi pas en entier?)
    //let img = p5.drawingContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    //let medianCut = new MedianCut(img)
    //let qimg = medianCut.reduce(16)

  }
}

document.app = new P5(sketch)
