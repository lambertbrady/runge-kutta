// import RungeKuttaMethod from './utils/runge-kutta-method'
import InitialValueProblem from './utils/initial-value-problem'

// Euler Method: only consistent method with 1 stage
// const eulerMethod = new RungeKuttaMethod('euler')
// const midpointMethod = new RungeKuttaMethod('midpoint')
// const rk4Method = new RungeKuttaMethod('rk4')

///////
const y0 = 1
// const h = 1
const tRange = [0, 10]
const rkFunc = (y) => y
// const rkFuncArr = (y) => [y[0] + y[1], y[1], y[2]]

console.log('---')
const IVP = new InitialValueProblem(rkFunc, y0, ...tRange)
const solutionArr1 = IVP.solve('euler', 1)
const solutionArr2 = IVP.solve('euler', 0.5)
const solutionArr3 = IVP.solve('midpoint', 1)
const solutionArr4 = IVP.solve('midpoint', 0.5)
const solutionArr5 = IVP.solve('rk4', 1)
const solutionArr6 = IVP.solve('rk4', 0.5)
console.log(solutionArr1)
console.log(solutionArr2)
console.log(solutionArr3)
console.log(solutionArr4)
console.log(solutionArr5)
console.log(solutionArr6)

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

// const emClassGen = eulerMethod.makeIterator(rkFunc, y0, tRange, h)
// const emClassGen1 = eulerMethod.makeIterator(rkFunc, y0, tRange, h)
// console.log(emClassGen);
// console.log(emClassGen.next());
// console.log(emClassGen1.next());
// const em = buildRungeKutta(1, [], [], [1])(y0, rkFunc, h, ...tRange)
// console.log(em.next());
// console.log(em.next());
// // Midpoint Method
// const mm = buildRungeKutta(2, [0.5], [[0.5]], [0, 1])(y0, rkFunc, h, ...tRange)
// console.log(mm.next());
// console.log(mm.next());
// // Heun Method
// buildRungeKutta(2, [1], [[1]], [.5, .5]);
// // Ralston Method
// buildRungeKutta(2, [2/3], [[2/3]], [.25, .75]);
// // rk4 Method
// const rk4 = buildRungeKutta(
//   4,
//   [0.5, 0.5, 1],
//   [[0.5], [0, 0.5], [0, 0, 1]],
//   [0.167, 0.333, 0.333, 0.167]
// )(y0, rkFunc, h, ...tRange)
// console.log(rk4.next());
// console.log(rk4.next());
// buildRungeKutta(4, [.5, .5, 1], [[.5], [0, .5], [0, 0, 1]], [.167, .333, .333, .167]);

console.log('------')

/// P5JS ///
export default function sketch(p) {
  p.setup = () => {
    // +x: right, +y: down, +z: towards
    p.createCanvas(p.windowWidth, p.windowHeight)

    // p.noLoop()
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
    solutionArr1.forEach(([t, y]) => {
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
    solutionArr2.forEach(([t, y]) => {
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
    solutionArr3.forEach(([t, y]) => {
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
    solutionArr4.forEach(([t, y]) => {
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
    solutionArr5.forEach(([t, y]) => {
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
    solutionArr6.forEach(([t, y]) => {
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
