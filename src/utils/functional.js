export const compose = (...fns) =>
  fns.reduce((f, g) => (...args) => f(g(...args)))

export const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2))
      }
    }
  }
}

export const partial = (fn) => (...pargs) => (...args) =>
  fn instanceof Function ? fn.apply(null, [...pargs, ...args]) : undefined

export const partialRight = (fn) => (...pargs) => (...args) =>
  fn instanceof Function
    ? fn.apply(null, [...args, ...pargs.reverse()])
    : undefined
