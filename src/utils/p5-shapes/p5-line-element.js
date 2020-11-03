import p5 from 'p5'
import fromToRotation from '../from-to-rotation'

export default class LineElement {
  constructor(vInitial, vFinal, props = {}) {
    this.vInitial = vInitial
    this.vFinal = vFinal
    this.props = props

    // vector from origin to position of current element (average of vInitial and vFinal)
    this.pos = p5.Vector.add(this.vInitial, this.vFinal).div(2)
    // vector from vInitial to vFinal
    this.dl = p5.Vector.sub(this.vFinal, this.vInitial)

    // rotation matrix with lazy getter
    this._rotationMatrix
  }

  get rotationMatrix() {
    // cylinders point in +y direction by default
    return (
      this._rotationMatrix || fromToRotation(this.dl, new p5.Vector(0, 1, 0))
    )
  }

  drawCylinder(radius = 2, rotateCenter = true) {
    return (p) => {
      p.push()

      p.translate(this.pos)
      if (!rotateCenter) {
        p.translate(0, this.dl.mag() / 2, 0)
      }
      p.applyMatrix(...this.rotationMatrix)

      p.cylinder(radius, this.dl.mag())

      p.pop()
    }
  }
}
