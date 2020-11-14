export function isIterable(obj) {
  return Symbol.iterator in Object(obj)
}

export default function limitIterable(
  iterable,
  iterationLimit,
  callback
  // callback = (result, itCount, it) => undefined
  // callback is optional and will be executed if iterator terminates early
) {
  // validation
  if (!isIterable(iterable)) {
    throw new Error('First argument must be iterable')
  }
  if (iterationLimit < 1 || !Number.isInteger(iterationLimit)) {
    throw new Error(
      'Second argument must be an integer greater than or equal to 1'
    )
  }
  if (callback !== undefined && !(callback instanceof Function)) {
    throw new Error('Third argument, if provided, must be a function')
  }

  return (function* () {
    const iterator = iterable[Symbol.iterator]()
    // value passed to the first invocation of next() is always ignored, so no need to pass argument to next() outside of while loop
    let result = iterator.next()
    let iterationCount = 0
    while (!result.done && iterationCount < iterationLimit) {
      const nextArg = yield result.value
      result = iterator.next(nextArg)
      iterationCount++
    }
    if (result.done) {
      // iterator has been fully consumed, so result.value will be the iterator's return value (the value present alongside done: true)
      return result.value
    } else {
      // iteration was terminated before completion (note that iterator will still accept calls to next() inside the callback function)
      return callback(result, iterationCount, iterator)
    }
  })()
}
