import RungeKuttaMethod from './runge-kutta-method'
import limitIterable from './limit-iterable'

export default class InitialValueProblem {
  // first order IVP
  // constructor(dy_dt, yInitial, ...tRanges) {
  constructor(dy_dt, yInitial, tInitial = 0, tFinal = 10) {
    // dy_dt: Function(y: number || array, t: number): number || array
    // y'(t) = f(y(t), t)
    // y(t0) = y0
    this.dy_dt = dy_dt
    this.yInitial = yInitial

    this.isScalar = typeof this.yInitial === 'number'
    this.numDimensions = this.isScalar ? 1 : this.yInitial.length

    if (!(typeof dy_dt(yInitial, tInitial) === typeof yInitial)) {
      throw new Error(
        'Return value of first argument must match type of second argument, such that typeof f(y,t) === typeof y'
      )
    }
    this.tInitial = tInitial
    this.tFinal = tFinal
  }

  *makeIterator(rkMethod, stepSize = 1, limit = 1000) {
    if (!(rkMethod instanceof RungeKuttaMethod)) {
      if (typeof rkMethod === 'string') {
        rkMethod = new RungeKuttaMethod(rkMethod)
      } else {
        throw new Error(
          'First argument must be string or instanceof RungeKuttaMethod'
        )
      }
    }
    const rkIterator = rkMethod.makeIterator(
      this.dy_dt,
      this.yInitial,
      [this.tInitial, this.tFinal],
      stepSize
    )
    // const rkIterator = (this.isScalar)
    //    ? rkMethod.makeIterator(this.dy_dt, this.yInitial, [this.tInitial, this.tFinal], stepSize)
    //    : rkMethod.makeIteratorVec(this.dy_dt, this.yInitial, [this.tInitial, this.tFinal], stepSize);
    yield* limitIterable(rkIterator, limit, () =>
      console.warn(
        'Solution exited early. If more elements are needed, change limit'
      )
    )
  }

  // rkMethod, stepSize, limit
  solve(...args) {
    return [...this.makeIterator(...args)]
  }
}
