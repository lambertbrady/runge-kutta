import p5 from 'p5'
import LineElement from './p5-line-element'

export default class Path {
  constructor(...vertices) {
    this.vertices = vertices
    this._length
  }

  static create(vertexInitial, numVertices, callback) {
    // callback returns Point
    let vertices = [...Array(numVertices)]
    for (let i = 0; i < numVertices; i++) {
      if (i === 0) {
        vertices[i] = vertexInitial
      } else {
        vertices[i] = callback(vertices[i - 1])
      }
    }
    return new Path(...vertices)
  }

  *[Symbol.iterator]() {
    for (let vertex of this.vertices) {
      yield vertex
    }
  }

  get length() {
    return (
      this._length ||
      this.vertices.reduce((length, vertex, i, vertices) => {
        const dl = i !== 0 ? this.lengthBetween(vertex, vertices[i - 1]) : 0
        return length + dl
      }, 0)
    )
  }

  lengthBetween(vInitial, vFinal) {
    return p5.Vector.dist(vFinal, vInitial)
  }

  getLineElements(closedPath = false) {
    let lineElements = []
    this.vertices.forEach((vertex, i, vertices) => {
      const isLastVertex = i === vertices.length - 1
      if (isLastVertex && !closedPath) {
        return
      }
      const vertexNext = isLastVertex ? vertices[0] : vertices[i + 1]
      lineElements.push(new LineElement(vertex, vertexNext))
    })
    return lineElements
  }
}
