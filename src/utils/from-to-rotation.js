import p5 from 'p5'

export default function fromToRotation(
  fromVec,
  toVec,
  epsilon = 0.01,
  camMatrix = true
) {
  // returns a 2D (3 by 3) rotation matrix
  // adapted from http://cs.brown.edu/research/pubs/pdfs/1999/Moller-1999-EBA.pdf
  // Moller & Hughes, 1999: 'Efficiently Building a Matrix to Rotate One Vector to Another'
  if (epsilon < 0 || epsilon > 1) {
    throw new Error('epsilon must be between 0 and 1')
  }

  // vectors must be normalized
  const from = fromVec.copy().normalize()
  const to = toVec.copy().normalize()
  let R = [...Array(3)].map(() => [...Array(3)])

  const c = p5.Vector.dot(from, to)
  if (Math.abs(c) > 1 - epsilon) {
    /* "from" and "to"-vector almost parallel */
    // set x equal to coordinate axis most nearly orthogonal to 'from' vector, which is the axis corresponding to the 'from' coordinate with minimum absolute value
    let x = from.array().map((val) => Math.abs(val))
    if (x[0] < x[1]) {
      if (x[0] < x[2]) {
        x = new p5.Vector(1, 0, 0)
      } else {
        x = new p5.Vector(0, 0, 1)
      }
    } else {
      if (x[1] < x[2]) {
        x = new p5.Vector(0, 1, 0)
      } else {
        x = new p5.Vector(0, 0, 1)
      }
    }

    const u = p5.Vector.sub(x, from)
    const v = p5.Vector.sub(x, to)

    // NOTE: dot(vec, vec) === |vec|**2
    const uu = p5.Vector.dot(u, u)
    const vv = p5.Vector.dot(v, v)

    // without check, c1 || c2 will equal Infinity when 'from' and 'to' vectors are orthogonal such that u || v is the zero vector (and therefore dot(u,u) === 0 || dot(v,v) === 0), respectively
    const c1 = uu === 0 ? 1 : 2 / uu
    const c2 = vv === 0 ? 1 : 2 / vv
    const c3 = c1 * c2 * p5.Vector.dot(u, v)

    const uArr = u.array()
    const vArr = v.array()
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const delta = i === j ? 1 : 0
        R[i][j] =
          delta -
          c1 * uArr[i] * uArr[j] -
          c2 * vArr[i] * vArr[j] +
          c3 * vArr[i] * uArr[j]
      }
    }
  } else {
    /* the most common case, unless "from"="to", or "from"=-"to" */

    // without check, c will equal Infinity when 'from' and 'to' vectors are antiparallel (and therefore dot(from, to) === 0)
    const h = 1 + c === 0 ? 1 : 1 / (1 + c)
    const v = p5.Vector.cross(from, to)

    // R[0][0] = h * v.x * v.x + c;
    // R[0][1] = h * v.x * v.y - v.z;
    // R[0][2] = h * v.x * v.z + v.y;
    // R[1][0] = h * v.y * v.x + v.z;
    // R[1][1] = h * v.y * v.y + c;
    // R[1][2] = h * v.y * v.z - v.x;
    // R[2][0] = h * v.z * v.x - v.y;
    // R[2][1] = h * v.z * v.y + v.x;
    // R[2][2] = h * v.z * v.z + c;
    const vArr = v.array()
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const sign = (i + 1) % 3 === j ? -1 : 1
        const delta = i === j ? c : vArr[3 - i - j]
        R[i][j] = h * vArr[i] * vArr[j] + sign * delta
      }
    }
  }

  // [R[0][0], R[0][1], R[0][2], 0,
  //  R[1][0], R[1][1], R[1][2], 0,
  //  R[2][0], R[2][1], R[2][2], 0,
  //  0,       0,       0,       1]
  return camMatrix ? [...R[0], 0, ...R[1], 0, ...R[2], 0, 0, 0, 0, 1] : R
}
