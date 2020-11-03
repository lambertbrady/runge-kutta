export function* eulerMethodGen(yInitial, fn, h = 1, tInitial = 0, tFinal = 4) {
  // fn = y'(y,t) = slope of curve
  let y = yInitial
  yield y
  for (let t = tInitial; t < tFinal; t += h) {
    y = y + h * fn(y, t)
    yield y
  }
}

export function eulerMethod(...args) {
  return Array.from(eulerMethodGen(...args))
}

export function* heunMethodGen(yInitial, fn, h = 1, tInitial = 0, tFinal = 4) {
  // fn = y'(y,t) = slope of curve
  let y = yInitial
  yield y
  const k1 = (y, t) => fn(y, t)
  const k2 = (y, t) => fn(y + k1(y, t), t + h)
  const b1 = 1 / 2
  const b2 = 1 / 2
  for (let t = tInitial; t < tFinal; t += h) {
    // yApprox = eulerMethodNext(y, fn, h, t);
    // y = y + h/2 * (fn(y, t) +  fn(yApprox, t));
    y = y + h * (b1 * k1(y, t) + b2 * k2(y, t))
    yield y
  }
}

export function heunMethod(...args) {
  return Array.from(heunMethodGen(...args))
}

export function* rk4MethodGen(yInitial, fn, h = 1, tInitial = 0, tFinal = 4) {
  // fn = y'(y,t) = slope of curve
  let y = yInitial
  yield y
  const k1 = (y, t) => fn(y, t)
  const k2 = (y, t) => fn(y + k1(y, t) / 2, t + h / 2)
  const k3 = (y, t) => fn(y + k2(y, t) / 2, t + h / 2)
  const k4 = (y, t) => fn(y + k3(y, t), t + h)
  const b1 = 1 / 6
  const b2 = 1 / 3
  const b3 = 1 / 3
  const b4 = 1 / 6
  for (let t = tInitial; t < tFinal; t += h) {
    // const sum = weights.reduce((sum, weight, i) => {
    //   return sum + weight * kArr[i](y, t)
    // }, 0)
    // y = y + h * sum
    y = y + h * (b1 * k1(y, t) + b2 * k2(y, t) + b3 * k3(y, t) + b4 * k4(y, t))
    yield y
  }
}

export function rk4Method(...args) {
  return Array.from(rk4MethodGen(...args))
}
