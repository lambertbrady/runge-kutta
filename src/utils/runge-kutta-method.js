function addArrays(A, B) {
  return A.map((a, i) => a + B[i])
}

function multArray(scalar, arr) {
  // swap variables if needed, so order of argument order doesn't matter
  if (Array.isArray(scalar)) {
    ;[arr, scalar] = [scalar, arr]
  }
  return arr.map((val) => scalar * val)
}

export default class RungeKuttaMethod {
  // defines an explicit Runge-Kutta method
  // config: { numStages, nodes, rkMatrix, weights, preset }
  // when preset is defined, all other values are ignored
  constructor(config) {
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
    // weightsAdaptive (optional):
    // * Equivalent to weights, but one order lower
    // * Difference between higher order method (weights) and lower order method (weightsAdaptive) gives estimate of local truncation error at each step

    const { numStages, nodes, rkMatrix, weights } = config.preset
      ? RungeKuttaMethod.getPresetConfig(config.preset)
      : RungeKuttaMethod.validate(config) && config

    this.numStages = numStages
    this.nodes = nodes
    this.rkMatrix = rkMatrix
    this.weights = weights
    // this.weightsAdaptive = weightsAdaptive
  }

  static getPresetConfig(preset) {
    switch (preset) {
      case 'euler':
        return { numStages: 1, nodes: [0], rkMatrix: [], weights: [1] }
      case 'midpoint':
        return {
          numStages: 2,
          nodes: [0, 0.5],
          rkMatrix: [[0.5]],
          weights: [0, 1]
        }
      case 'heun':
        return {
          numStages: 2,
          nodes: [0, 1],
          rkMatrix: [[1]],
          weights: [0.5, 0.5]
        }
      case 'rk4':
        return {
          numStages: 4,
          nodes: [0, 0.5, 0.5, 1],
          rkMatrix: [[0.5], [0, 0.5], [0, 0, 1]],
          weights: [0.167, 0.333, 0.333, 0.167]
        }
      default:
        throw new Error('preset does not match any preset Runge Kutta methods')
    }
  }

  static validate({ numStages, nodes, rkMatrix, weights }) {
    // numStages
    if (numStages < 1 || !Number.isInteger(numStages)) {
      throw new Error('numStages must be an integer greater than or equal to 1')
    }

    // nodes
    if (!Array.isArray(nodes) || nodes.length !== numStages - 1) {
      throw new Error('nodes must be an array with length equal to numStages')
    }
    if (nodes[0] !== 0) {
      throw new Error('first node must be 0')
    }
    if (nodes.some((node) => node < 0 || node > 1)) {
      throw new Error(
        'each node must be a number between 0 (inclusive) and 1 (inclusive)'
      )
    }

    // rkMatrix
    if (!Array.isArray(rkMatrix) || rkMatrix.length !== numStages - 1) {
      throw new Error(
        'rkMatrix must be an array with length equal to (numStages - 1)'
      )
    }
    rkMatrix.forEach((rkEntry, entryIndex) => {
      if (!Array.isArray(rkEntry)) {
        throw new Error('each entry in rkMatrix must be an array')
      }
      if (!Array.isArray(rkEntry) || rkEntry.length !== entryIndex + 1) {
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
    if (!Array.isArray(weights) || weights.length !== numStages) {
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

    // // weightsAdaptive
    // if (weightsAdaptive) {
    //   if (
    //     !Array.isArray(weightsAdaptive) ||
    //     weightsAdaptive.length !== numStages
    //   ) {
    //     throw new Error(
    //       'weightsAdaptive must be an array with length equal to numStages'
    //     )
    //   }
    //   if (weightsAdaptive.some((weight) => weight < 0 || weight > 1)) {
    //     throw new Error(
    //       'each weight must be a number between 0 (inclusive) and 1 (inclusive)'
    //     )
    //   }
    //   // TODO: handle fractional rounding errors
    //   const weightSum = weightsAdaptive.reduce((sum, weight) => sum + weight, 0)
    //   if (weightSum !== 1) {
    //     console.warn(
    //       `sum of weightsAdaptive is not equal to 1. Current sum is ${weightSum}`
    //     )
    //     // throw new Error('sum of all weightsAdaptive must equal 1');
    //   }
    // }

    return true
  }

  stepScalar(dy_dt, y, t, stepSize) {
    // true if dy_dt is independent of t, i.e., f(y,t) = f(y)
    const isAutonomous = dy_dt.length < 2
    const slopes = [...Array(this.numStages)]

    let weightedSumSlopes = 0
    for (let i = 0; i < this.numStages; i++) {
      let weightedSumCoefficients = 0
      for (let j = 0; j < i; j++) {
        weightedSumCoefficients += this.rkMatrix[i - 1][j] * slopes[j]
      }

      slopes[i] = dy_dt(
        y + stepSize * weightedSumCoefficients,
        !isAutonomous && t + stepSize * this.nodes[i]
      )

      weightedSumSlopes += this.weights[i] * slopes[i]
    }

    y += stepSize * weightedSumSlopes
    const stepError = 0.5
    return { y, stepError }
  }

  stepArray(dy_dt, y, t, stepSize) {
    // true if dy_dt is independent of t, i.e., f(y,t) = f(y)
    const isAutonomous = dy_dt.length < 2
    const slopes = [...Array(this.numStages)]

    let weightedSumSlopes = y.map(() => 0)
    for (let i = 0; i < this.numStages; i++) {
      let weightedSumCoefficients = y.map(() => 0)
      for (let j = 0; j < i; j++) {
        weightedSumCoefficients = addArrays(
          weightedSumCoefficients,
          multArray(this.rkMatrix[i - 1][j], slopes[j])
        )
      }

      slopes[i] = dy_dt(
        addArrays(y, multArray(stepSize, weightedSumCoefficients)),
        isAutonomous && t + stepSize * this.nodes[i]
      )

      weightedSumSlopes = addArrays(
        weightedSumSlopes,
        multArray(this.weights[i], slopes[i])
      )
    }

    y = addArrays(y, multArray(stepSize, weightedSumSlopes))
    return { y, stepError }
  }

  step(dy_dt, y, t, stepSize) {
    return typeof y === 'number'
      ? this.stepScalar(dy_dt, y, t, stepSize)
      : this.stepArray(dy_dt, y, t, stepSize)
  }

  *makeIterator({ dy_dt, yInitial, tInitial = 0, tFinal, stepSize = 1 }) {
    // slopes
    // k_1 = dy_dt(t_n, y_n)
    // k_2 = f(k_1) = dy_dt(t_n + h * c_2, y_n + h * (a_21 * k_1))
    // k_s = f(k_(s-1)) = dy_dt(t_n + h * c_s, y_n + h * (a_s1*k_1 + a_s2*k_2 + ... + a_s(s-1)*k_(s-1)))
    // y_(n+1) = y_n + h * (b_1*k_1 + b_2*k_2 + ... + b_s*k_s);

    if (!(typeof dy_dt(yInitial, tInitial) === typeof yInitial)) {
      throw new Error(
        'Return value of dy_dt must have the same type as yInitial'
      )
    }

    let t = tInitial,
      y = yInitial,
      step = 0,
      stepError = 0,
      accumulatedError = 0

    yield { t, y, step, stepError, accumulatedError }

    t += stepSize
    while (t <= tFinal) {
      ;({ y, stepError } = this.step(dy_dt, y, t, stepSize))
      step++
      accumulatedError += stepError
      yield { t, y, step, stepError, accumulatedError }

      t += stepSize
    }
  }
}

export const EulerMethod = new RungeKuttaMethod({ preset: 'euler' })
export const MidpointMethod = new RungeKuttaMethod({ preset: 'midpoint' })
export const HeunMethod = new RungeKuttaMethod({ preset: 'heun' })
export const RK4Method = new RungeKuttaMethod({ preset: 'rk4' })
