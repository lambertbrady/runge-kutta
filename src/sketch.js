export default function sketch(p) {
  p.setup = () => {
    // +x: right, +y: downw, +z: towards
    p.createCanvas(p.windowWidth, p.windowHeight)
    // p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL)

    // p.noLoop();
  }

  p.draw = () => {
    p.background('#fafafa')
    // adjust axes so +x: right, +y: up, +z: towards
    p.scale(1, -1, 1)

    // // WEBGL
    // p.lights()
    // p.orbitControl(2, 2, 0.1)
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}
