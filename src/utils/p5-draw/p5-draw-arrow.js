import p5 from 'p5'
import fromToRotation from '../from-to-rotation'

export default function drawArrow(
  arrowVector,
  position = new p5.Vector(0, 0, 0)
) {
  const cylinderOrientation = new p5.Vector(0, 1, 0)
  const R = fromToRotation(arrowVector, cylinderOrientation)
  const cylinderLength = arrowVector.mag()
  return function (
    cylinderRadius = 3,
    coneRadius = 1.5 * cylinderRadius,
    coneLength = 2 * coneRadius
  ) {
    p5.push()

    p5.translate(position)
    p5.applyMatrix(...R)

    p5.push()
    p5.translate(0, cylinderLength / 2, 0)
    p5.cylinder(cylinderRadius, cylinderLength)
    p5.pop()

    p5.push()
    p5.translate(0, cylinderLength + coneLength / 2, 0)
    p5.cone(coneRadius, coneLength)
    p5.pop()

    p5.pop()
  }
}
