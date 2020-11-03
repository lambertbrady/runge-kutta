import p5 from 'p5'
import fromToRotation from '../from-to-rotation'

export default function drawCylinder(v0, v1) {
  const v = p5.Vector.sub(v1, v0)
  const pos = p5.Vector.div(v, 2).add(v0)
  // cylinders point in +y direction by default
  const R = fromToRotation(v, new p5.Vector(0, 1, 0))
  const L = v.mag()

  return function (radius = 2, rotateCenter = true) {
    p5.push()

    p5.translate(pos)
    if (!rotateCenter) {
      p5.translate(0, L / 2, 0)
    }
    p5.applyMatrix(...R)

    p5.cylinder(radius, L)

    p5.pop()
  }
}
