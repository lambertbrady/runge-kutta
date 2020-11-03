import p5 from 'p5'

export function* eulerMethodVecGen(
  yInitial,
  fn,
  h = 1,
  tInitial = 0,
  tFinal = 4
) {
  // fn = y'(y,t) = slope of curve
  let y = yInitial
  yield y
  for (let t = tInitial; t < tFinal; t += h) {
    y = p5.Vector.add(y, fn(y, t).mult(h))
    // y = y + h * fn(y, t);
    yield y
  }
}

export function eulerMethodVec(...args) {
  return Array.from(eulerMethodVecGen(...args))
}

export function* heunMethodVecGen(
  yInitial,
  fn,
  h = 1,
  tInitial = 0,
  tFinal = 4
) {
  // fn = y'(y,t) = slope of curve
  let y = yInitial
  yield y
  const k1 = (y, t) => fn(y, t)
  const k2 = (y, t) => fn(p5.Vector.add(y, k1(y, t)), t + h)
  // const k2 = (y, t) => fn(y + k1(y,t), t + h);
  const b1 = 1 / 2
  const b2 = 1 / 2
  for (let t = tInitial; t < tFinal; t += h) {
    const bkSum = p5.Vector.mult(k1(y, t), b1).add(p5.Vector.mult(k2(y, t), b2))
    y = p5.Vector.add(y, bkSum.mult(h))
    // y = y + h * (b1 * k1(y,t) + b2 * k2(y,t));
    yield y
  }
}

export function heunMethodVec(...args) {
  return Array.from(heunMethodVecGen(...args))
}

export function* rk4MethodVecGen(
  yInitial,
  fn,
  h = 1,
  tInitial = 0,
  tFinal = 4
) {
  // fn = y'(y,t) = slope of curve
  let y = yInitial
  yield y
  const k1 = (y, t) => fn(y, t)
  const k2 = (y, t) =>
    fn(p5.Vector.add(y, p5.Vector.div(k1(y, t), 2)), t + h / 2)
  const k3 = (y, t) =>
    fn(p5.Vector.add(y, p5.Vector.div(k2(y, t), 2)), t + h / 2)
  const k4 = (y, t) => fn(p5.Vector.add(y, k3(y, t)), t + h)
  const b1 = 1 / 6
  const b2 = 1 / 3
  const b3 = 1 / 3
  const b4 = 1 / 6
  for (let t = tInitial; t < tFinal; t += h) {
    const bk1 = p5.Vector.mult(k1(y, t), b1)
    const bk2 = p5.Vector.mult(k2(y, t), b2)
    const bk3 = p5.Vector.mult(k3(y, t), b3)
    const bk4 = p5.Vector.mult(k4(y, t), b4)
    const bkSum = bk1.add(bk2).add(bk3).add(bk4)
    y = p5.Vector.add(y, bkSum.mult(h))
    // y = y + h * (b1 * k1(y,t) + b2 * k2(y,t));
    yield y
  }
}

export function rk4MethodVec(...args) {
  return Array.from(rk4MethodVecGen(...args))
}
