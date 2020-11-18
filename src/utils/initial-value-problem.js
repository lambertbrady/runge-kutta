import RungeKuttaMethod from './runge-kutta-method'
import limitIterable from './limit-iterable'

export default class InitialValueProblem {
  // first order IVP
  constructor(dy_dt, yInitial, tInitial = 0) {
    // dy_dt: Function(y: number || array, t: number): number || array
    // y'(t) = f(y(t), t)
    // y(t0) = y0
    this.dy_dt = dy_dt
    this.yInitial = yInitial
    this.tInitial = tInitial

    this.numDimensions =
      typeof this.yInitial === 'number' ? 1 : this.yInitial.length
  }

  *makeIterator({ rkMethod, stepSize, tFinal, limit, limitCallback }) {
    // validation
    if (!(rkMethod instanceof RungeKuttaMethod)) {
      if (typeof rkMethod === 'string') {
        rkMethod = new RungeKuttaMethod({ preset: rkMethod })
      } else {
        throw new Error(
          'rkMethod must be string or instanceof RungeKuttaMethod'
        )
      }
    }

    const rkIterator = rkMethod.makeIterator({
      dy_dt: this.dy_dt,
      yInitial: this.yInitial,
      tInitial: this.tInitial,
      tFinal,
      stepSize
    })
    yield* limit ? limitIterable(rkIterator, limit, limitCallback) : rkIterator
  }

  solve({
    rkMethod,
    stepSize,
    tFinal,
    limit = 1000,
    limitCallback = () =>
      console.warn(
        'Solution exited early. If more elements are needed, change limit'
      )
  }) {
    return [
      ...this.makeIterator({ rkMethod, stepSize, tFinal, limit, limitCallback })
    ]
  }
}
