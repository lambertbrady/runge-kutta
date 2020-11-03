export default function buildRungeKutta(
  numStages = 1,
  nodes = [],
  rkMatrix = [],
  weights = [1]
) {
  // default values build Euler Method
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

  return function* (yInitial, dy_dt, step = 1, tInitial = 0, tFinal = 10) {
    // y0, f(y,t), h, t0, tn
    let y = yInitial
    yield y
    for (let t = tInitial; t < tFinal; t += step) {
      let slopes = []
      // sum of weights * slopes <==> b * k
      const bkSum = weights.reduce((sum, weight, stageIndex) => {
        let y_k = y
        let t_k = t
        if (stageIndex > 0) {
          // sum of matrix coefficents * slopes from previous stages
          const akSum = rkMatrix[stageIndex - 1].reduce(
            (sum, a, j) => sum + a * slopes[j],
            0
          )
          y_k += step * akSum
          t_k += step * nodes[stageIndex - 1]
        }
        const k = dy_dt(y_k, t_k)
        slopes.push(k)
        return sum + weight * slopes[stageIndex]
      }, 0)
      // k_1 = dy_dt(t_n, y_n)
      // k_2 = f(k_1) = dy_dt(t_n + h * c_2, y_n + h * (a_21 * k_1))
      // k_s = f(k_(s-1)) = dy_dt(t_n + h * c_s, y_n + h * (a_s1*k_1 + a_s2*k_2 + ... + a_s(s-1)*k_(s-1)))
      // y_(n+1) = y_n + h * (b_1*k_1 + b_2*k_2 + ... + b_s*k_s);
      y = y + step * bkSum
      yield y
    }
  }
}
