import InitialValueProblem from './utils/initial-value-problem'

///////
const y0 = 1
// const h = 1
// const rkFunc = (y) => y
// const rkFunc = (y, t) => y ** 0.5 * t * 2
const rkFunc = (y, t) => y * Math.sin(t) ** 2
// const rkFunc = (y, t) => -2 * t * y ** 2
// const rkFuncArr = (y) => [y[0], y[1]]

console.log('---')
const IVP = new InitialValueProblem(rkFunc, y0)
const ivpObj = { stepSize: 0.8, tFinal: 5 }
// const method1 = IVP.solve({ ...ivpObj, rkMethod: 'euler' })
// const method2 = IVP.solve({ ...ivpObj, rkMethod: 'ralston' })
// const method3 = IVP.solve({ ...ivpObj, rkMethod: 'ralston3' })
// const method4 = IVP.solve({ ...ivpObj, rkMethod: 'ralston4' })
const method1 = IVP.solve({ ...ivpObj, rkMethod: 'rkf12' })
const method2 = IVP.solve({ ...ivpObj, rkMethod: 'bs23' })
const method3 = IVP.solve({ ...ivpObj, rkMethod: 'ck45' })
console.log(method1)
console.log(method2)
console.log(method3)

const drawSolution = (p, arr, color) => {
  // scalefactor
  // const sf_t = p.windowWidth / ivpObj.tFinal
  const sf_t = 250
  const sf_y = 50

  p.push()
  p.stroke(color)
  p.strokeWeight(4)
  p.beginShape()
  arr.forEach(({ t, y }) => {
    p.vertex(sf_t * t, sf_y * y)

    p.push()
    p.strokeWeight(1)
    p.fill(color)
    p.circle(sf_t * t, sf_y * y, 10)
    p.pop()
  })
  p.endShape()
  p.pop()
}

console.log('------')

/// P5JS ///
export default function sketch(p) {
  p.setup = () => {
    // +x: right, +y: down, +z: towards
    p.createCanvas(p.windowWidth, p.windowHeight)

    p.noLoop()
  }

  p.draw = () => {
    // adjust axes so +x: right, +y: up, +z: towards
    p.scale(1, -1, 1)
    p.translate(0, -p.height)
    p.noFill()

    drawSolution(p, method1, 'red')
    drawSolution(p, method2, 'green')
    drawSolution(p, method3, 'blue')
    // drawSolution(p, method4, 'black')
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}
