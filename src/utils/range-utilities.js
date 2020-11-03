export function* rangeGen(start, stop, step = 1, cycles = 1, inclusive = true) {
  // function range(...args) {
  // input
  // 1 argument: range(stop) where start is 0
  // 2 or more arguments: range(start, stop, step = 1, cycles = 1)
  // returns inclusive range: [start, ..., stop]

  // 0 arguments provided: throw Error
  if (start === undefined) {
    throw new Error('must provide at least one argument')
  }
  // 1 argument provided: use argument for value of stop
  if (stop === undefined) {
    stop = start
    start = 0
  } else {
    // 2 or more arguments provided: validate step, cycles
    if (step === 0) {
      throw new Error('step cannot be 0')
    }
    if (cycles < 0) {
      throw new Error('cycles must be greater than or equal to 0')
    }
  }
  if (start === stop) {
    return [start]
  }
  if (Math.sign(stop - start) !== Math.sign(step)) {
    // equivalent to: if ((stop > start && step < 0) || (stop < start && step > 0)) {...}
    step *= -1
    console.warn(
      'sign of step value has been flipped to match sign of (stop - start)'
    )
  }

  const n = Math.floor((stop - start) / step) + Number(inclusive)
  const nTotal = Math.floor(n * cycles)
  for (let i = 0; i < nTotal; i++) {
    yield (i % n) * step + start
  }
  // return [...Array(nTotal)].map((_, i) => i % n * step + start);
}

export function range(...args) {
  return Array.from(rangeGen(...args))
}

export function* rangeNGen(n, start, stop, cycles = 1, inclusive = true) {
  if (n === undefined || start === undefined || stop === undefined) {
    throw new Error('must provide at least 3 arguments: n, start, stop')
  }
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error('n must be an integer greater than 0')
  }
  if (cycles < 0) {
    throw new Error('cycles must be greater than or equal to 0')
  }
  if (start === stop) {
    return [start]
  }
  const step = (stop - start) / (n - Number(inclusive))
  const nTotal = Math.floor(n * cycles)
  for (let i = 0; i < nTotal; i++) {
    yield (i % n) * step + start
  }
  // yield* rangeGen(start, stop, step, cycles, inclusive);
  // return [...Array(n)].map((_, i) => i * (stop - start) / (n - 1) + start);
}

export function rangeN(...args) {
  return Array.from(rangeNGen(...args))
}
