// import RungeKuttaMethod from './utils/runge-kutta-method'
import InitialValueProblem from './utils/initial-value-problem'

// Euler Method: only consistent method with 1 stage
// const eulerMethod = new RungeKuttaMethod('euler')
// const midpointMethod = new RungeKuttaMethod('midpoint')
// const rk4Method = new RungeKuttaMethod('rk4')

///////
const y0 = 1
// const h = 1
const rkFunc = (y) => y
// const rkFuncArr = (y) => [y[0], y[1]]

console.log('---')
const IVP = new InitialValueProblem(rkFunc, y0)
// const IVPVec = new InitialValueProblem(rkFuncArr, [1, 2])
// const solutionArr1 = IVPVec.solve('euler', 1)
const solutionArr1 = IVP.solve('euler', 1)
const solutionArr2 = IVP.solve('euler', 0.5)
const solutionArr3 = IVP.solve('midpoint', 1)
const solutionArr4 = IVP.solve('midpoint', 0.5)
const solutionArr5 = IVP.solve('rk4', 1)
const solutionArr6 = IVP.solve('rk4', 0.5)
// console.log(solutionArr1)
// console.log(solutionArr2)
// console.log(solutionArr3)
// console.log(solutionArr4)
// console.log(solutionArr5)
// console.log(solutionArr6)

// const solutionIterator1 = IVP.makeIterator('euler', 0.5)
// const solutionIterator2 = IVP.makeIterator('euler', 1)
// for (let val of solutionIterator1) {
//   console.log(val)
// }
// for (let val of solutionIterator2) {
//   console.log(val)
// }
// const IVPVec = new InitialValueProblem(rkFuncArr, [1, 2, 0.5], ...tRange)
// const solutionIterator3 = IVPVec.makeIterator('euler', 1)
// for (const vec of solutionIterator3) {
//   console.log(vec)
// }

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

    // scalefactor
    const sf_t = 40
    const sf_y = 0.015

    p.noFill()
    p.push()
    p.stroke('red')
    p.strokeWeight(4)
    p.beginShape()
    solutionArr1.forEach(({ t, y }) => {
      p.vertex(sf_t * t, sf_y * y)

      p.push()
      p.strokeWeight(1)
      p.fill('red')
      p.circle(sf_t * t, sf_y * y, 10)
      p.pop()
    })
    p.endShape()
    p.pop()

    p.beginShape()
    p.stroke('blue')
    p.strokeWeight(4)
    solutionArr2.forEach(({ t, y }) => {
      p.vertex(sf_t * t, sf_y * y)

      p.push()
      p.strokeWeight(1)
      p.fill('blue')
      p.circle(sf_t * t, sf_y * y, 10)
      p.pop()
    })
    p.endShape()

    p.translate(p.width / 3, 0)

    p.noFill()
    p.push()
    p.stroke('red')
    p.strokeWeight(4)
    p.beginShape()
    solutionArr3.forEach(({ t, y }) => {
      p.vertex(sf_t * t, sf_y * y)

      p.push()
      p.strokeWeight(1)
      p.fill('red')
      p.circle(sf_t * t, sf_y * y, 10)
      p.pop()
    })
    p.endShape()
    p.pop()

    p.beginShape()
    p.stroke('blue')
    p.strokeWeight(4)
    solutionArr4.forEach(({ t, y }) => {
      p.vertex(sf_t * t, sf_y * y)

      p.push()
      p.strokeWeight(1)
      p.fill('blue')
      p.circle(sf_t * t, sf_y * y, 10)
      p.pop()
    })
    p.endShape()

    p.translate(p.width / 3, 0)

    p.noFill()
    p.push()
    p.stroke('red')
    p.strokeWeight(4)
    p.beginShape()
    solutionArr5.forEach(({ t, y }) => {
      p.vertex(sf_t * t, sf_y * y)

      p.push()
      p.strokeWeight(1)
      p.fill('red')
      p.circle(sf_t * t, sf_y * y, 10)
      p.pop()
    })
    p.endShape()
    p.pop()

    p.beginShape()
    p.stroke('blue')
    p.strokeWeight(4)
    solutionArr6.forEach(({ t, y }) => {
      p.vertex(sf_t * t, sf_y * y)

      p.push()
      p.strokeWeight(1)
      p.fill('blue')
      p.circle(sf_t * t, sf_y * y, 10)
      p.pop()
    })
    p.endShape()
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}
