import p5 from 'p5'

export default class Point {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x
    this.y = y
    this.z = z

    // this.size = 3;
  }

  *[Symbol.iterator]() {
    yield this.x
    yield this.y
    yield this.z
  }

  toVector() {
    return new p5.Vector(...this)
  }
}
