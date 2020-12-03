function addArrays(A, B) {
  return A.map((a, i) => a + B[i])
}

function multArray(scalar, arr) {
  // swap variables if needed, so argument order doesn't matter
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

    const { order, numStages, nodes, rkMatrix, weights } = config.preset
      ? RungeKuttaMethod.getPresetConfig(config.preset)
      : RungeKuttaMethod.validate(config) && config

    // TODO: order refers to low order method in adaptive methods
    // TODO: attempt to calculate order based on this.numStages?
    // TODO: weightsAdaptive --> weights: { high: [...], low: [...] }
    this.order = order
    this.numStages = numStages
    this.nodes = nodes
    this.rkMatrix = rkMatrix
    this.weights = weights

    this.isAdaptive = !Array.isArray(weights)
  }

  static getPresetConfig(preset) {
    switch (preset) {
      // explicit methods
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
      case 'ralston':
        // minimum truncation error
        return {
          order: 2,
          numStages: 2,
          nodes: [0, 2 / 3],
          rkMatrix: [[2 / 3]],
          weights: [1 / 4, 3 / 4]
        }
      case 'rk3':
        return {
          order: 3,
          numStages: 3,
          nodes: [0, 1 / 2, 1],
          rkMatrix: [[1 / 2], [-1, 2]],
          weights: [1 / 6, 2 / 3, 1 / 6]
        }
      case 'heun3':
        return {
          order: 3,
          numStages: 3,
          nodes: [0, 1 / 3, 2 / 3],
          rkMatrix: [[1 / 3], [0, 2 / 3]],
          weights: [1 / 4, 0, 3 / 4]
        }
      case 'ralston3':
        return {
          order: 3,
          numStages: 3,
          nodes: [0, 1 / 2, 3 / 4],
          rkMatrix: [[1 / 2], [0, 3 / 4]],
          weights: [2 / 9, 1 / 3, 4 / 9]
        }
      case 'ssprk3':
        // Strong Stability Preserving Runge-Kutta
        return {
          order: 3,
          numStages: 3,
          nodes: [0, 1, 1 / 2],
          rkMatrix: [[1], [1 / 4, 1 / 4]],
          weights: [1 / 6, 1 / 6, 2 / 3]
        }
      case 'rk4':
        // classic Runge–Kutta method
        return {
          order: 4,
          numStages: 4,
          nodes: [0, 1 / 2, 1 / 2, 1],
          rkMatrix: [[1 / 2], [0, 1 / 2], [0, 0, 1]],
          weights: [1 / 6, 1 / 3, 1 / 3, 1 / 6]
        }
      case 'ralston4':
        // minimum truncation error
        return {
          order: 4,
          numStages: 4,
          nodes: [0, 0.4, 0.45573725, 1],
          rkMatrix: [
            [0.4],
            [0.29697761, 0.15875964],
            [0.2181004, -3.05096516, 3.83286476]
          ],
          weights: [0.17476028, -0.55148066, 1.2055356, 0.17118478]
        }
      // Adaptive/Embedded Methods
      case 'euler-midpoint':
        // combined Euler and Midpoint methods
        return {
          order: 1,
          numStages: 2,
          nodes: [0, 1 / 2],
          rkMatrix: [[1 / 2]],
          weights: { high: [0, 1], low: [1, 0] }
        }
      case 'euler-heun':
        // combined Euler and Heun methods
        return {
          order: 1,
          numStages: 2,
          nodes: [0, 1],
          rkMatrix: [[1]],
          weights: { high: [1 / 2, 1 / 2], low: [1, 0] }
        }
      case 'rkf12':
        return {
          order: 1,
          numStages: 3,
          nodes: [0, 1 / 2, 1],
          rkMatrix: [[1 / 2], [1 / 256, 255 / 256]],
          weights: {
            high: [1 / 512, 255 / 256, 1 / 512],
            low: [1 / 256, 255 / 256, 0]
          }
        }
      case 'bs23':
        // Bogacki–Shampine method
        return {
          order: 2,
          numStages: 4,
          nodes: [0, 1 / 2, 3 / 4, 1],
          rkMatrix: [[1 / 2], [0, 3 / 4], [2 / 9, 1 / 3, 4 / 9]],
          weights: {
            high: [2 / 9, 1 / 3, 4 / 9, 0],
            low: [7 / 24, 1 / 4, 1 / 3, 1 / 8]
          }
        }
      case 'rkf45':
        // Runge–Kutta–Fehlberg method
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
          weights: {
            high: [16 / 135, 0, 6656 / 12825, 28561 / 56430, -9 / 50, 2 / 55],
            low: [25 / 216, 0, 1408 / 2565, 2197 / 4104, -1 / 5, 0]
          }
        }
      case 'ck45':
        // Cash-Karp method
        return {
          order: 4,
          numStages: 6,
          nodes: [0, 1 / 5, 3 / 10, 3 / 5, 1, 7 / 8],
          rkMatrix: [
            [1 / 5],
            [3 / 40, 9 / 40],
            [3 / 10, -9 / 10, 6 / 5],
            [-11 / 54, 5 / 2, -70 / 27, 35 / 27],
            [1631 / 55296, 175 / 512, 575 / 13824, 44275 / 110592, 253 / 4096]
          ],
          weights: {
            high: [37 / 378, 0, 250 / 621, 125 / 594, 0, 512 / 1771],
            low: [
              2825 / 27648,
              0,
              18575 / 48384,
              13525 / 55296,
              277 / 14336,
              1 / 4
            ]
          }
        }
      case 'dp45':
        // Dormand-Prince method
        return {
          order: 4,
          numStages: 7,
          nodes: [0, 1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1],
          rkMatrix: [
            [1 / 5],
            [3 / 40, 9 / 40],
            [44 / 45, -56 / 15, 32 / 9],
            [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729],
            [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656],
            [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]
          ],
          weights: {
            high: [
              35 / 384,
              0,
              500 / 1113,
              125 / 192,
              -2187 / 6784,
              11 / 84,
              0
            ],
            low: [
              5179 / 57600,
              0,
              7571 / 16695,
              393 / 640,
              -92097 / 339200,
              187 / 2100,
              1 / 40
            ]
          }
        }
      default:
        throw new Error('preset does not match any preset Runge Kutta methods')
    }
  }

  static validate({ order, numStages, nodes, rkMatrix, weights }) {
    // order
    if (order < 1 || !Number.isInteger(order)) {
      throw new Error('order must be an integer greater than or equal to 1')
    }

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
    const validateWeightsArray = (weightsArray, name) => {
      if (weightsArray.length !== numStages) {
        throw new Error(`${name} must have length equal to numStages`)
      }
      // TODO: handle fractional rounding errors
      const weightSum = weightsArray.reduce((sum, weight) => sum + weight, 0)
      if (weightSum !== 1) {
        console.warn(
          `sum of ${name} is not equal to 1. Current sum is ${weightSum}`
        )
        // throw new Error('sum of all weightsArray must equal 1');
      }
    }
    if (Array.isArray(weights)) {
      validateWeightsArray(weights, 'weights')
    } else if (typeof weights === 'object' && weights !== null) {
      if (weights.high === undefined || weights.low === undefined) {
        throw new Error(
          'weights object must have properties high and low defined'
        )
      }
      if (!Array.isArray(weights.high) || !Array.isArray(weights.low)) {
        throw new Error('weights.high and weights.low must be arrays')
      }
      validateWeightsArray(weights.high, 'weights.high')
      validateWeightsArray(weights.low, 'weights.low')
    } else {
      throw new Error('weights must be an array or an object')
    }

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
      useLocalExtrapolation,
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

      weightedSumSlopesHigh += this.weights.high[i] * slopes[i]
      weightedSumSlopesLow += this.weights.low[i] * slopes[i]
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

    let result
    if (stepFailed && stepSize > stepSizeMin) {
      // retry with smaller stepSize since stepError is too large and current stepSize can be decreased
      result = this.stepScalarAdaptive({
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
      result = {
        y: useLocalExtrapolation ? yHigh : yLow,
        t: t + stepSize,
        stepSizeUsed: stepSize,
        stepError,
        stepAttempts,
        stepSizeNext: adaptedStepSize
      }
    }

    return result
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
    stepSize = (tFinal - tInitial) / 10,
    stepSizeMin = 0.01 * stepSize,
    stepSizeMax = 10 * stepSize,
    errorThreshold = 0.1 * stepSizeMin,
    safetyFactor = 0.9,
    useLocalExtrapolation = true,
    maxSteps = 500
  }) {
    if (typeof dy_dt(yInitial, tInitial) !== typeof yInitial) {
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
          stepError,
          stepAttempts,
          stepSizeNext
        } = this.stepScalarAdaptive({
          dy_dt,
          y,
          t,
          stepSize: stepSizeNext,
          stepSizeMin,
          stepSizeMax,
          errorThreshold,
          safetyFactor,
          useLocalExtrapolation
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

// explicit methods
// order 1
export const EulerMethod = new RungeKuttaMethod({ preset: 'euler' })
// order 2
export const MidpointMethod = new RungeKuttaMethod({ preset: 'midpoint' })
export const HeunMethod = new RungeKuttaMethod({ preset: 'heun' })
export const RalstonMethod = new RungeKuttaMethod({ preset: 'ralston' })
// order 3
export const rk3Method = new RungeKuttaMethod({ preset: 'rk3' })
export const Heun3Method = new RungeKuttaMethod({ preset: 'heun3' })
export const Ralston3Method = new RungeKuttaMethod({ preset: 'ralston3' })
export const SSPRK3Method = new RungeKuttaMethod({ preset: 'ssprk3' })
// order 4
export const RK4Method = new RungeKuttaMethod({ preset: 'rk4' })
export const Ralston4Method = new RungeKuttaMethod({ preset: 'ralston4' })
// adaptive/embedded methods
// order 1,2
export const EulerHeunMethod = new RungeKuttaMethod({ preset: 'euler-heun' })
export const EulerMidpointMethod = new RungeKuttaMethod({
  preset: 'euler-midpoint'
})
export const RKF12Method = new RungeKuttaMethod({ preset: 'rkf12' })
// order 2,3
export const BS23Method = new RungeKuttaMethod({ preset: 'bs23' })
// order 4,5
export const RKF45Method = new RungeKuttaMethod({ preset: 'rkf45' })
export const CK45Method = new RungeKuttaMethod({ preset: 'ck45' })
export const DP45Method = new RungeKuttaMethod({ preset: 'dp45' })
