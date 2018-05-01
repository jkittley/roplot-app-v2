/**
 * Created by jacob on 20/06/2016.
 */
import * as d3 from 'd3'
import RAT from './rolang-rat'

const CAR_OUT = 1
const CAR_IN = 2
const ROTATE_CW = 1
const ROTATE_AC = 2
const PEN_UP = 1
const PEN_DOWN = 2

class RoplotVis {
  //
  constructor (elem, config) {
    // Set root element
    this.rootElem = elem
    // this.rootElem.classList.add('roplot')

    // All distance measurements in mm
    this.config = {
      'rotationSpeed': 10,
      'beltSpeed': 10,
      'boomRadius': 500,  // Radius of the boom
      'boomWidth': 10,    // Width of the boom
      'boomColor': 'gray',  // Boom colour
      'drawStart': 100,   // Distance from boom center where carriage stops - inner
      'drawEnd': 450,     // Distance from boom center where carriage stops - outer
      'carWidth': 20,     // Carriage Width - axis normal to boom
      'carHeight': 20,    // Carriage Height - axis parallel to boom
      'boomStep': 0.9,    // Boom stepper motor step size
      'carStep': 1.5,     // Carriage stepper motor step size
      'pens': [{
        'id': 1,
        'pole': 'north',  // Which half of the boom is the carriage on. North or South
        'color': 'red',   // Color of the pen
        'width': 5,
        'offset': {      // X Offset of pen tip from center of boom width
          'x': 25,
          'y': 0
        }
      }, {
        'id': 2,
        'pole': 'south',   // Which half of the boom is the carriage on. North or South
        'color': 'blue',   // Color of the pen
        'width': 5,
        'offset': {      // X Offset of pen tip from center of boom width
          'x': 25,
          'y': 0
        }
      }],
      'clock': {
        'tickInterval': 5,    // Interval in degrees between tick marks
        'LabelInterval': 15   // Interval in degrees between tick labels
      }
    }

    this.boom = null
    this.boomAngle = 0
    this.north = null
    this.south = null
    this.drawLayer = null
    this.physicalBeltPos = this.config.drawStart
    this.penState = []

    for (var i in this.config.pens) {
      this.penState[i] = PEN_UP
    }

    // Update configuration
    this.updConfig(config)

    // Create SVG
    var d = Math.min(this.rootElem.clientWidth, this.rootElem.clientHeight)
    this.svg = d3.select(this.rootElem).append('svg')
      .attr('width', d)
      .attr('height', d)
      .attr('viewBox', '0 0 ' + (this.config.boomRadius * 2) + ' ' + (this.config.boomRadius * 2))

    this.scaleFactor = d / (this.config.boomRadius * 2)
    console.log('this.scaleFactor', this.scaleFactor)

    this.buildSurface(this.svg)
    this.buildDrawLayer(this.svg)
    this.buildBoom(this.svg)
    this.buildCarriages(this.svg)
    this.buildClickLayer(this.svg)
  }

  updConfig (newSettings) {
    // $.extend(true, this.config, newSettings)
    // Safety checks
    if (this.config.drawEnd > this.config.boomRadius) throw new Error('Draw area exceeds boom')
    if (this.config.drawStart < 0 || this.config.drawEnd < 0) throw new Error('Draw area invalid')
  }

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------

  getConfig () {
    return this.config
  }

  fireEvent (eventName, data = null) {
    var event // The custom event that will be created
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents')
      event.initEvent(eventName, true, true)
      event.roplot = data
    } else {
      event = document.createEventObject()
      event.eventType = eventName
      event.roplot = data
    }
    event.eventName = eventName
    if (document.createEvent) {
      this.rootElem.dispatchEvent(event)
    } else {
      this.rootElem.fireEvent('on' + event.eventType, event)
    }
  }

  // Take an xy from top left and convert to a point from center of circle
  cartToPolar (x, y) {
    if (y === undefined) { y = x[1]; x = x[0] }
    var offsetX = x - this.config.boomRadius
    var offsetY = this.config.boomRadius - y
    var offsetC = Math.sqrt(Math.abs(offsetX * offsetX) + Math.abs(offsetY * offsetY))
    var radians = 0
    if (offsetX >= 0 && offsetY >= 0) { radians = Math.asin(offsetX / offsetC) } else if (offsetX >= 0 && offsetY < 0) { radians = Math.PI / 2 + Math.asin(Math.abs(offsetY) / offsetC) } else if (offsetX < 0 && offsetY < 0) { radians = Math.PI + Math.asin(Math.abs(offsetX) / offsetC) } else { radians = Math.PI * 1.5 + Math.asin(offsetY / offsetC) }
    if (isNaN(radians)) radians = 0
    var degrees = this.radianToDegree(radians)
    return {
      originalX: x,
      originalY: y,
      degrees: 1 * degrees.toFixed(2),
      radians: 1 * radians.toFixed(2),
      radius: 1 * offsetC.toFixed(2),
      cxOffset: 1 * offsetX.toFixed(2),
      cyOffset: 1 * offsetY.toFixed(2)
    }
  }

  polarToCart (d, r) {
    return {
      x: this.config.boomRadius + (r * Math.cos(this.degreeToRadian(d - 90))),
      y: this.config.boomRadius + (r * Math.sin(this.degreeToRadian(d - 90)))
    }
  }

  degreeToRadian (degrees) {
    return Math.PI / 180 * degrees
  }

  radianToDegree (radians) {
    return 180 / Math.PI * radians
  }

  // ----------------------------------------------------
  // Boom
  // ----------------------------------------------------

  stepBoom (direction) {
    console.log('Stepping boom')
    if (direction !== ROTATE_AC && direction !== ROTATE_CW) throw new Error('Unknown direction')
    var d = (direction === ROTATE_AC) ? -1 : 1
    this.boomAngle = this.boomAngle + (this.config.boomStep * d)
    this.boom.attr('transform', 'rotate(' + this.boomAngle + ',' + this.config.boomRadius + ',' + this.config.boomRadius + ')')
  }

  // ----------------------------------------------------
  // Carriages
  // ----------------------------------------------------

  stepCar (direction) {
    if (direction !== CAR_IN && direction !== CAR_OUT) throw new Error('Unknown direction')
    var d = (direction === CAR_IN) ? -1 : 1
    this.physicalBeltPos = this.physicalBeltPos + (this.config.carStep * d)
    this.physicalBeltPos = Math.min(this.physicalBeltPos, this.config.drawEnd)
    this.physicalBeltPos = Math.max(this.physicalBeltPos, this.config.drawStart)
    this.north.attr('transform', 'translate(0, ' + -this.physicalBeltPos + ')')
    this.south.attr('transform', 'translate(0, ' + this.physicalBeltPos + ')')
  }

  // ----------------------------------------------------
  // Pen
  // ----------------------------------------------------

  setPenState (penIndex, newState) {
    if (penIndex >= this.penState.length) throw new Error('Unknown pen index')
    if (newState !== PEN_DOWN && newState !== PEN_UP) throw new Error('Unknown pen state')
    this.penState[penIndex] = newState
  }

  // ----------------------------------------------------
  // Build
  // ----------------------------------------------------

  buildSurface (svg) {
    // Surface
    svg.append('circle')
      .attr('r', this.config.boomRadius)
      .attr('cx', this.config.boomRadius)
      .attr('cy', this.config.boomRadius)
      .attr('class', 'draw-surface')
    // Hub
    svg.append('circle')
      .attr('r', 20)
      .attr('cx', this.config.boomRadius)
      .attr('cy', this.config.boomRadius)
      .attr('class', 'hub')
    // Drawable area
    var arc = d3.arc()
      .innerRadius(this.config.drawStart)
      .outerRadius(this.config.drawEnd)
      .startAngle(0)
      .endAngle(2 * Math.PI)
    svg.append('path')
      .attr('d', arc)
      .attr('class', 'drawable-area')
      .attr('transform', 'translate(' + this.config.boomRadius + ',' + this.config.boomRadius + ')')

    // Clock face
    var face = svg.append('g')
      .attr('id', 'clock-face')
      .attr('transform', 'translate(' + this.config.boomRadius + ',' + this.config.boomRadius + ')')

    face.selectAll('.degree-tick')
      .data(d3.range(0, 360 / 5)).enter()
      .append('line')
      .attr('class', 'degree-tick')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', this.config.boomRadius)
      .attr('y2', this.config.boomRadius - 5)
      .attr('transform', function (d) {
        return 'rotate(' + d * this.config.clock.tickInterval + ')'
      }.bind(this))

    var radian = Math.PI / 180
    var interval = this.config.clock.LabelInterval
    var labelRadius = this.config.boomRadius - 20
    face.selectAll('.degree-label')
      .data(d3.range(0, 360 / interval))
      .enter()
      .append('text')
      .attr('class', 'degree-label')
      .attr('text-anchor', 'middle')
      .attr('x', function (d) {
        return labelRadius * Math.sin(d * interval * radian)
      })
      .attr('y', function (d) {
        return -labelRadius * Math.cos(d * interval * radian)
      })
      .attr('dy', '.35em')
      .text(function (d) {
        return d * interval
      })
  }

  buildBoom (svg) {
    this.boom = svg.append('g')
      .attr('id', 'boom')
    // Boom
    this.boom.append('line')
      .attr('x1', this.config.boomRadius)
      .attr('y1', 0)
      .attr('x2', this.config.boomRadius)
      .attr('y2', this.config.boomRadius + this.config.boomRadius)
      .attr('stroke-width', Math.max(2, this.config.boomWidth))
      .style('stroke', this.config.boomColor)
    // Angle markers
    this.boom.append('circle')
      .attr('class', 'boom-angle-marker')
      .attr('cx', this.config.boomRadius)
      .attr('cy', 5)
      .attr('r', 5)
    this.boom.append('circle')
      .attr('class', 'boom-angle-marker')
      .attr('cx', this.config.boomRadius)
      .attr('cy', -5)
      .attr('r', 5)
  }

  buildCarriages (svg) {
    var carriages = this.boom.append('g')
      .attr('id', 'carriages')

    // Great groups for north and south
    this.north = carriages.append('g').attr('id', 'north-belt')
    this.south = carriages.append('g').attr('id', 'south-belt')

    this.north.append('rect')
      .attr('class', 'carriage')
      .attr('x', this.config.boomRadius - this.config.carWidth / 2)
      .attr('y', function () {
        return this.config.boomRadius - this.config.carHeight / 2
      }.bind(this))
      .attr('width', this.config.carWidth)
      .attr('height', this.config.carHeight)

    this.north.attr('transform', 'translate(0, ' + -this.physicalBeltPos + ')')

    this.south.append('rect')
      .attr('class', 'carriage')
      .attr('x', this.config.boomRadius - this.config.carWidth / 2)
      .attr('y', function () {
        return this.config.boomRadius - this.config.carHeight / 2
      }.bind(this))
      .attr('width', this.config.carWidth)
      .attr('height', this.config.carHeight)

    this.south.attr('transform', 'translate(0, ' + this.physicalBeltPos + ')')

    // Add pens
    for (var i in this.config.pens) {
      var pen = this.config.pens[i]
      var pole = (pen.pole === 'north') ? this.north : this.south
      // Pens
      pen.circle = pole.append('circle')
        .attr('class', 'pen')
        .attr('id', 'pen-' + i)
        .attr('r', 5)
        .attr('cx', this.config.boomRadius + pen.offset.x)
        .attr('cy', this.config.boomRadius + pen.offset.y)
        .style('fill', pen.color)
    }
  }

  buildClickLayer (svg) {
    svg.append('circle')
      .attr('r', this.config.boomRadius)
      .attr('cx', this.config.boomRadius)
      .attr('cy', this.config.boomRadius)
      .style('fill', 'transparent')

    svg.on('mousemove', function (e) {
      var m = d3.mouse(this.rootElem)
      var x = m[0] / this.scaleFactor
      var y = m[1] / this.scaleFactor
      var trans = this.cartToPolar(x, y)
      if (trans !== undefined) {
        trans.inDrawSpace = (trans.radius >= this.config.drawStart && trans.radius <= this.config.drawEnd)
        if (trans.radius <= this.config.boomRadius) this.fireEvent('mousemove', trans)
      }
      d3.event.stopPropagation()
    }.bind(this))
    .on('click', function () {
      var m = d3.mouse(this.rootElem)
      var x = m[0] / this.scaleFactor
      var y = m[1] / this.scaleFactor
      var trans = this.cartToPolar(x, y)
      trans.inDrawSpace = (trans.radius >= this.config.drawStart && trans.radius <= this.config.drawEnd)
      this.fireEvent('click', trans)
      d3.event.stopPropagation()
    }.bind(this))
  }

  buildDrawLayer (svg) {
    this.drawLayer = svg.append('g')
  }

  // ----------------------------------------------------
  // RAT
  // ----------------------------------------------------

  drawClean () {
    this.drawLayer.selectAll('*').remove()
  }

  drawLine (pen, x1, y1, x2, y2) {
    this.drawLayer.append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .style('stroke-width', pen.width)
      .style('stroke', pen.color)
  }

  drawCircle (pen, x1, y1) {
    this.drawLayer.append('circle')
      .attr('r', pen.width / 2)
      .attr('cx', x1)
      .attr('cy', y1)
      .style('fill', pen.color)
  }

  run (cmdStr) {
    console.log('Running RAT', cmdStr)

    var parsedInstructions = RAT.parse(cmdStr)

    // Execute parsed instructions
    parsedInstructions.forEach(function (instruction, i) {
      for (var j = 0; j < instruction.repeats; j++) {
        var lines = {}
        for (var k in this.penState) {
          if (this.penState[k] === PEN_DOWN) {
            lines[k] = { 'before': this.polarToCart(this.boomAngle, this.physicalBeltPos) }
          }
        }

        switch (instruction.cmd) {
          case 'PU':
            this.setPenState(instruction.param, PEN_UP)
            break
          case 'PD':
            this.setPenState(instruction.param, PEN_DOWN)
            var pos = this.polarToCart(this.boomAngle, this.physicalBeltPos)
            this.drawCircle(this.config.pens[instruction.param], pos.x, pos.y)
            break
          case 'RC':
            this.stepBoom(ROTATE_CW)
            break
          case 'RA':
            this.stepBoom(ROTATE_AC)
            break
          case 'CO':
            this.stepCar(CAR_OUT)
            break
          case 'CI':
            this.stepCar(CAR_IN)
            break
          default:
            throw new Error('Unknown RAT command')
        }

        // Draw ink
        // for (var l in lines) {
        //   lines[l]['after'] = this.polarToCart(this.boomAngle, this.physicalBeltPos)
        //   this.drawLine(this.config.pens[l], lines[l].before.x, lines[l].before.y, lines[l].after.x, lines[l].after.y)
        // }
      }
    }.bind(this))
  }
}

export default RoplotVis
