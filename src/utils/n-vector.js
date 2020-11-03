export default class nVector {
  constructor(...components) {
    this.components = components
    this.n = components.length
  }

  *[Symbol.iterator]() {
    for (const component of this.components) {
      yield component
    }
  }

  get(index) {
    return this.components[index]
  }

  add(v) {
    this.components.map((el, i) => el + v[i])
  }

  mult() {}
}
