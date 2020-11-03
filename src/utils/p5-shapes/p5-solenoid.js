import p5 from 'p5'
import LineElement from './p5-line-element'
import { rangeN, rangeNGen } from '../range-utilities'

export default class Solenoid {
  constructor(L, R, numTurns, n) {
    // length of solenoid
    this.L = L
    // radius of solenoid
    this.R = R
    // number of turns
    this.numTurns = numTurns
    // elements per turn
    this.n = n

    // number of elements
    this.nTotal = this.numTurns * this.n

    this.elements = []
    this.vertices = []
    const thetaList = rangeN(this.n, 0, 2 * Math.PI, this.numTurns, false)
    thetaList.push(2 * Math.PI)
    const zGen = rangeNGen(this.nTotal + 1, 0, this.L)
    // const zList = rangeN(this.nTotal + 1, 0, this.L);
    for (let i = 0; i < this.nTotal + 1; i++) {
      const theta = thetaList[i]
      const x = this.R * Math.cos(theta)
      const y = this.R * Math.sin(theta)
      const z = zGen.next().value
      // const z = zList[i];
      const vertex = new p5.Vector(x, y, z)
      this.vertices.push(vertex)
      if (i !== 0) {
        const vInitial = this.vertices[i - 1]
        const vFinal = vertex
        this.elements.push(
          new LineElement(vInitial, vFinal, {
            turnIndex: Math.floor((i - 1) / this.n)
          })
        )
      }
    }
  }

  *[Symbol.iterator]() {
    for (let el of this.elements) {
      yield el
    }
  }
}
