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

function clamp(min, val, max) {
  return Math.min(Math.max(val, min), max)
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

    const {
      order,
      numStages,
      nodes,
      rkMatrix,
      weights,
      weightsAdaptive
    } = config.preset
      ? RungeKuttaMethod.getPresetConfig(config.preset)
      : RungeKuttaMethod.validate(config) && config

    this.order = order
    this.numStages = numStages
    this.nodes = nodes
    this.rkMatrix = rkMatrix
    this.weights = weights

    this.isAdaptive = weightsAdaptive !== undefined
    this.weightsAdaptive = weightsAdaptive
  }

  static getPresetConfig(preset) {
    switch (preset) {
      case 'euler':
        return {
          order: 1,
          numStages: 1,
          nodes: [0],
          rkMatrix: [],
          weights: [1]
        }
      case 'midpoint':
        return {
          order: 2,
          numStages: 2,
          nodes: [0, 1 / 2],
          rkMatrix: [[1 / 2]],
          weights: [0, 1]
        }
      case 'heun':
        return {
          order: 2,
          numStages: 2,
          nodes: [0, 1],
          rkMatrix: [[1]],
          weights: [1 / 2, 1 / 2]
        }
      case 'rk4':
        return {
          order: 4,
          numStages: 4,
          nodes: [0, 1 / 2, 1 / 2, 1],
          rkMatrix: [[1 / 2], [0, 1 / 2], [0, 0, 1]],
          weights: [1 / 6, 1 / 3, 1 / 3, 1 / 6]
        }
      case 'eulerAdaptive':
        return {
          order: 2,
          numStages: 2,
          nodes: [0, 1],
          rkMatrix: [[1]],
          weights: [1 / 2, 1 / 2],
          weightsAdaptive: [1, 0]
        }
      case 'rkf45':
        return {
          order: 4,
          numStages: 6,
          nodes: [0, 1 / 4, 3 / 8, 12 / 13, 1, 1 / 2],
          rkMatrix: [
            [1 / 4],
            [3 / 32, 9 / 32],
            [1932 / 2197, -7200 / 2197, 7296 / 2197],
            [439 / 216, -8, 3680 / 513, -845 / 4104],
            [-8 / 27, 2, -3544 / 2565, 1859 / 4104, -11 / 40]
          ],
          weights: [16 / 135, 0, 6656 / 12825, 28561 / 56430, -9 / 50, 2 / 55],
          weightsAdaptive: [25 / 216, 0, 1408 / 2565, 2197 / 4104, -1 / 5, 0]
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
      let sumCoefficients = 0
      for (let j = 0; j < i; j++) {
        sumCoefficients += this.rkMatrix[i - 1][j] * slopes[j]
      }

      slopes[i] = dy_dt(
        y + stepSize * sumCoefficients,
        isAutonomous ? undefined : t + stepSize * this.nodes[i]
      )

      weightedSumSlopes += this.weights[i] * slopes[i]
    }

    return {
      y: y + stepSize * weightedSumSlopes,
      t: t + stepSize,
      stepSize
    }
  }

  calcAdaptedStepSize(stepSize, stepError, errorThreshold, safetyFactor) {
    // adapted from "Adaptive Stepsize Runge-Kutta Integration" by William H. Press and Saul A. Teukolsky
    // COMPUTERS IN PHYSICS, VOL. 6, NO.2, MAR/APR 1992, p. 188 - 191
    // https://aip.scitation.org/doi/pdf/10.1063/1.4823060
    const exponentDivisor =
      errorThreshold >= stepError ? this.order + 1 : this.order
    return (
      stepSize *
      safetyFactor *
      Math.abs(errorThreshold / stepError) ** (1 / exponentDivisor)
    )
  }

  stepScalarAdaptive(parameters) {
    let {
      dy_dt,
      y,
      t,
      stepSize,
      stepSizeMin,
      stepSizeMax,
      errorThreshold,
      safetyFactor,
      stepAttempts = 1
    } = parameters

    // true if dy_dt is independent of t, i.e., fn(y,t) = fn(y)
    const isAutonomous = dy_dt.length < 2
    const slopes = [...Array(this.numStages)]

    let weightedSumSlopesHigh = 0
    let weightedSumSlopesLow = 0
    for (let i = 0; i < this.numStages; i++) {
      let weightedSumCoefficients = 0
      for (let j = 0; j < i; j++) {
        weightedSumCoefficients += this.rkMatrix[i - 1][j] * slopes[j]
      }

      // skip t calculation if function is autonomous
      slopes[i] = dy_dt(
        y + stepSize * weightedSumCoefficients,
        isAutonomous ? undefined : t + stepSize * this.nodes[i]
      )

      weightedSumSlopesHigh += this.weights[i] * slopes[i]
      weightedSumSlopesLow += this.weightsAdaptive[i] * slopes[i]
    }

    const yHigh = y + stepSize * weightedSumSlopesHigh
    const yLow = y + stepSize * weightedSumSlopesLow
    // local error estimate is the difference between higher and lower order method results
    const stepError = yHigh - yLow
    // step failed, need to retry with smaller stepSize if possible
    const stepFailed = stepError > errorThreshold

    // adaptedStepSize is clamped between stepSizeMin and stepSizeMax, so skip calculation if stepSize can't be changed from min or max value
    // i.e., skip if step failed but stepSize can't be decreased, or if step succeeded but stepSize can't be increased
    const adaptedStepSize =
      (stepFailed && stepSize === stepSizeMin) ||
      (!stepFailed && stepSize === stepSizeMax)
        ? stepSize
        : clamp(
            stepSizeMin,
            this.calcAdaptedStepSize(
              stepSize,
              stepError,
              errorThreshold,
              safetyFactor
            ),
            stepSizeMax
          )

    if (stepFailed && stepSize > stepSizeMin) {
      // retry with smaller stepSize since stepError is too large and current stepSize can be decreased
      return this.stepScalarAdaptive({
        ...parameters,
        stepSize: adaptedStepSize,
        stepAttempts: ++stepAttempts
      })
    } else {
      if (stepFailed && stepSize === stepSizeMin) {
        console.warn(
          `stepError is greater than errorThreshold, but stepSize is at a minimum. Decrease value of stepSizeMin for more accurate results, or increase errorThreshold if current accuracy is acceptable.`
        )
      }
      // return result along with stepSize to use in next iteration
      // local extrapolation: use higher order value for y, even though error refers to lower order result
      return {
        y: yHigh,
        t: t + stepSize,
        stepError,
        stepSizeUsed: stepSize,
        stepSizeNext: adaptedStepSize,
        stepAttempts
      }
    }
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
        isAutonomous ? undefined : t + stepSize * this.nodes[i]
      )

      weightedSumSlopes = addArrays(
        weightedSumSlopes,
        multArray(this.weights[i], slopes[i])
      )
    }

    y = addArrays(y, multArray(stepSize, weightedSumSlopes))
    return { y, t: t + stepSize, stepSize }
  }

  step(dy_dt, y, t, stepSize) {
    // slopes
    // k_1 = dy_dt(t_n, y_n)
    // k_2 = f(k_1) = dy_dt(t_n + h * c_2, y_n + h * (a_21 * k_1))
    // k_s = f(k_(s-1)) = dy_dt(t_n + h * c_s, y_n + h * (a_s1*k_1 + a_s2*k_2 + ... + a_s(s-1)*k_(s-1)))
    // y_(n+1) = y_n + h * (b_1*k_1 + b_2*k_2 + ... + b_s*k_s);
    return typeof y === 'number'
      ? this.stepScalar(dy_dt, y, t, stepSize)
      : this.stepArray(dy_dt, y, t, stepSize)
  }

  *makeIterator({
    dy_dt,
    yInitial,
    tInitial = 0,
    tFinal = 10,
    stepSize = 0.1,
    stepSizeMin = 0.01,
    stepSizeMax = 1,
    errorThreshold = 10,
    safetyFactor = 0.9,
    maxSteps = 500
  }) {
    if (!(typeof dy_dt(yInitial, tInitial) === typeof yInitial)) {
      throw new Error(
        'Return value of dy_dt must have the same type as yInitial'
      )
    }

    let y = yInitial,
      t = tInitial,
      step = 0,
      stepSizeUsed = null,
      stepSizeNext = stepSize,
      stepError = null,
      accumulatedError = 0,
      stepAttempts = null,
      accumulatedAttempts = 0

    while (t <= tFinal && step <= maxSteps) {
      if (this.isAdaptive) {
        yield {
          y,
          t,
          stepSize: stepSizeUsed,
          stepError,
          accumulatedError,
          stepAttempts,
          accumulatedAttempts
        }
        ;({
          y,
          t,
          stepSizeUsed,
          stepSizeNext,
          stepError,
          stepAttempts
        } = this.stepScalarAdaptive({
          dy_dt,
          y,
          t,
          stepSize: stepSizeNext,
          stepSizeMin,
          stepSizeMax,
          errorThreshold,
          safetyFactor
        }))

        accumulatedError += stepError
        accumulatedAttempts += stepAttempts
      } else {
        yield { y, t, stepSize }
        ;({ y, t, stepSize } = this.step(dy_dt, y, t, stepSize))
      }

      step++
    }
  }
}

export const EulerMethod = new RungeKuttaMethod({ preset: 'euler' })
export const MidpointMethod = new RungeKuttaMethod({ preset: 'midpoint' })
export const HeunMethod = new RungeKuttaMethod({ preset: 'heun' })
export const RK4Method = new RungeKuttaMethod({ preset: 'rk4' })
export const EulerAdaptiveMethod = new RungeKuttaMethod({
  preset: 'eulerAdaptive'
})
