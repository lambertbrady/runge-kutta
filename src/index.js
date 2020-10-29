import p5 from 'p5'
import sketch from './sketch'
import 'normalize.css'
import './style.css'

let canvasParent = document.createElement('div')
new p5(sketch, canvasParent)

document.body.appendChild(canvasParent)
