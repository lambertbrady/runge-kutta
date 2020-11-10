function addArrays(A, B) {
  return A.map((a, i) => a + B[i])
}

// function dotArrays(A, B) {
//   return A.map((a, i) => a * B[i]);
// }

function multArray(arr, scalar) {
  return arr.map((val) => scalar * val)
}

export default class RungeKuttaMethod {
  // defines an explicit Runge-Kutta method
  // following strings are allowed: 'euler' | 'midpoint' | 'rk4'
  constructor(numStages, nodes, rkMatrix, weights) {
    // Arguments in terms of standard Runge-Kutta Method notation:
    // numStages:
    // s
    // * Integer greater than or equal to 1
    // Butcher Tableau values
    // nodes:
    // [c_2, c_3, ..., c_(s-1), c_s]
    // * Array with length equal to (s-1)
    // * Array entries are numbers in range [0,1]
    // ** NOTE: c_1 is always 0, so it is omitted - the nodes array for a first order Euler Method will be empty []
    // rkMatrix (Runge-Kutta Matrix):
    // [a_ij] = [[a_21], [a_31, 32], ..., [a_s1, a_s2, ..., a_s(s-1)]]
    // * Array with length equal to (s-1)
    // * Array entries (a_ij) are arrays with length equal to j = rkMatrix[index+1]
    // * a_ij entries are numbers in range [0,1]
    // * Sum of a_ij entries must equal the corresponding node value, a_i1 + a_i3 + ... + a_i(s-1) = c_i  <==>  sum(rkMatrix[index]) = nodes[index]
    // ** NOTE: [a_11] is always omitted - the rKMatrix array for a first order Euler Method will be empty []
    // weights:
    // [b_1, b_2, ..., b_(s-1), b_s]
    // * Array with length equal to (s)
    // * Array entries are numbers in range [0,1]
    // * Sum of array entries must equal 1 (approximately, to allow for fractional rounding errors)

    if (typeof numStages === 'string') {
      ;[numStages, nodes, rkMatrix, weights] = RungeKuttaMethod.getDefaults(
        numStages
      )
    } else {
      RungeKuttaMethod.validate(...arguments)
    }

    this.numStages = numStages
    this.nodes = nodes
    this.rkMatrix = rkMatrix
    this.weights = weights
  }

  static getDefaults(name) {
    switch (name) {
      case 'euler':
        return [1, [], [], [1]]
      case 'midpoint':
        return [2, [0.5], [[0.5]], [0, 1]]
      case 'rk4':
        return [
          4,
          [0.5, 0.5, 1],
          [[0.5], [0, 0.5], [0, 0, 1]],
          [0.167, 0.333, 0.333, 0.167]
        ]
      default:
        throw new Error('name does not match any default Runge Kutta methods')
    }
  }

  static validate(numStages, nodes, rkMatrix, weights) {
    // numStages
    if (numStages < 1 || !Number.isInteger(numStages)) {
      throw new Error('numStages must be an integer greater than or equal to 1')
    }
    // nodes
    if (!(nodes instanceof Array) || nodes.length !== numStages - 1) {
      throw new Error(
        'nodes must be an array with length equal to (numStages - 1)'
      )
    }
    if (nodes.some((node) => node < 0 || node > 1)) {
      throw new Error(
        'each node must be a number between 0 (inclusive) and 1 (inclusive)'
      )
    }
    // rkMatrix
    if (!(rkMatrix instanceof Array) || rkMatrix.length !== numStages - 1) {
      throw new Error(
        'rkMatrix must be an array with length equal to (numStages - 1)'
      )
    }
    rkMatrix.forEach((rkEntry, entryIndex) => {
      if (!(rkEntry instanceof Array)) {
        throw new Error('each entry in rkMatrix must be an instanceof Array')
      }
      if (!(rkEntry instanceof Array) || rkEntry.length !== entryIndex + 1) {
        throw new Error(
          `each entry in rkMatrix must have a length equal to (entryIndex + 1). Entry provided at index ${entryIndex} has length equal to ${
            rkEntry.length
          }, but should be ${entryIndex + 1}`
        )
      }
      const entrySum = rkEntry.reduce((sum, entryVal) => (sum += entryVal), 0)
      if (entrySum !== nodes[entryIndex]) {
        throw new Error(
          `sum of values in each rkMatrix entry must be equal to the entry's corresponding node value. Sum of entry provided at index ${entryIndex} is equal to ${entrySum}, but should be ${nodes[entryIndex]}`
        )
      }
    })
    // weights
    if (!(weights instanceof Array) || weights.length !== numStages) {
      throw new Error('weights must be an array with length equal to numStages')
    }
    if (weights.some((weight) => weight < 0 || weight > 1)) {
      throw new Error(
        'each weight must be a number between 0 (inclusive) and 1 (inclusive)'
      )
    }
    // TODO: handle fractional rounding errors
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0)
    if (weightSum !== 1) {
      console.warn(
        `sum of weights is not equal to 1. Current sum is ${weightSum}`
      )
      // throw new Error('sum of all weights must equal 1');
    }
  }

  yNextScalar(dy_dt, t, y, h) {
    const slopes = []
    const bkSum = [...Array(this.numStages)].reduce((sum, _, i) => {
      const akSum = slopes.reduce((innerSum, slope, j) => {
        return innerSum + this.rkMatrix[i - 1][j] * slope
      }, 0)

      const k = dy_dt(y + h * akSum, t + h * this.nodes[i - 1])
      slopes.push(k)

      return sum + this.weights[i] * slopes[i]
    }, 0)

    return y + h * bkSum
  }

  yNextArray(dy_dt, t, y, h) {
    const slopes = []
    const bkSum = [...Array(this.numStages)].reduce(
      (sum, _, i) => {
        const akSum = slopes.reduce(
          (innerSum, slope, j) => {
            return addArrays(
              innerSum,
              multArray(slope, this.rkMatrix[i - 1][j])
            )
          },
          y.map(() => 0)
        )

        const k = dy_dt(
          addArrays(y, multArray(akSum, h)),
          t + h * this.nodes[i - 1]
        )
        slopes.push(k)

        return addArrays(sum, multArray(slopes[i], this.weights[i]))
      },
      y.map(() => 0)
    )

    return addArrays(y, multArray(bkSum, h))
  }

  yNext(dy_dt, t, y, h) {
    return typeof y === 'number'
      ? this.yNextScalar(dy_dt, t, y, h)
      : this.yNextArray(dy_dt, t, y, h)
  }

  *makeIterator(
    dy_dt,
    yInitial,
    // Array: [tInitial, tFinal] || Number: tFinal >> [0, tFinal]
    tRange,
    stepSize = 1
  ) {
    // k_1 = dy_dt(t_n, y_n)
    // k_2 = f(k_1) = dy_dt(t_n + h * c_2, y_n + h * (a_21 * k_1))
    // k_s = f(k_(s-1)) = dy_dt(t_n + h * c_s, y_n + h * (a_s1*k_1 + a_s2*k_2 + ... + a_s(s-1)*k_(s-1)))
    // y_(n+1) = y_n + h * (b_1*k_1 + b_2*k_2 + ... + b_s*k_s);

    let tInitial, tFinal
    if (Array.isArray(tRange)) {
      ;[tInitial, tFinal] = tRange
    } else if (typeof tRange === 'number') {
      tInitial = 0
      tFinal = tRange
    } else {
      throw new Error('third argument must be array or number')
    }

    if (!(typeof dy_dt(yInitial, tInitial) === typeof yInitial)) {
      throw new Error(
        'Return value of first argument must match type of second argument, such that typeof f(y,t) === typeof y'
      )
    }

    yield { t: tInitial, y: yInitial }
    let y = yInitial
    for (let t = tInitial; t <= tFinal; t += stepSize) {
      y = this.yNext(dy_dt, t, y, stepSize)
      yield { t: t, y: y }
    }
  }
}

export const EulerMethod = new RungeKuttaMethod('euler')
export const MidpointMethod = new RungeKuttaMethod('midpoint')
export const RK4Method = new RungeKuttaMethod('rk4')
