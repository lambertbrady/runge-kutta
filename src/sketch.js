import InitialValueProblem from './utils/initial-value-problem'

///////
const y0 = 1
// const h = 1
// const rkFunc = (y) => y
const rkFunc = (y, t) => y ** 0.5 * t * 2
// const rkFuncArr = (y) => [y[0], y[1]]

console.log('---')
const IVP = new InitialValueProblem(rkFunc, y0)
// const IVPVec = new InitialValueProblem(rkFuncArr, [1, 2])
// const solutionArr1 = IVPVec.solve('euler', 1)
const solutionArr1 = IVP.solve({
  rkMethod: 'euler-heun',
  stepSize: 1,
  tFinal: 15
})
const solutionArr2 = IVP.solve({
  rkMethod: 'euler-heun',
  stepSize: 0.5,
  tFinal: 15
})
const solutionArr3 = IVP.solve({
  rkMethod: 'midpoint',
  stepSize: 1,
  tFinal: 15
})
const solutionArr4 = IVP.solve({
  rkMethod: 'midpoint',
  stepSize: 0.5,
  tFinal: 15
})
const solutionArr5 = IVP.solve({ rkMethod: 'rk4', stepSize: 1, tFinal: 15 })
const solutionArr6 = IVP.solve({ rkMethod: 'rk4', stepSize: 0.5, tFinal: 15 })
console.log(solutionArr1)
console.log(solutionArr2)
console.log(solutionArr3)
console.log(solutionArr4)
console.log(solutionArr5)
console.log(solutionArr6)

const drawSolution = (p, arr, color) => {
  // scalefactor
  const sf_t = 30
  const sf_y = 0.015

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
    p.translate(0, p.height)
    // adjust axes so +x: right, +y: up, +z: towards
    p.scale(1, -1, 1)

    // p.background('#fafafa')

    p.noFill()

    drawSolution(p, solutionArr1, 'red')
    drawSolution(p, solutionArr2, 'blue')

    p.translate(p.width / 3, 0)
    drawSolution(p, solutionArr3, 'red')
    drawSolution(p, solutionArr4, 'blue')

    p.translate(p.width / 3, 0)
    drawSolution(p, solutionArr5, 'red')
    drawSolution(p, solutionArr6, 'blue')
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}
