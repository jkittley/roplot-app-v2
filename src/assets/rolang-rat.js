class RAT {
  // Create Instruction
  static create (instructionType) {
    return new RATInstruction(instructionType)
  }
  // Convert single instruction to a string
  static toString (ratInstruction) {
    return ratInstruction.toString()
  }
  // Individual RAT commands to multiple e.g. RA,RA to 2*RA
  static pack () {

  }
  // Repeat RATs to indvx 3*RA to RA,RA,RA
  static unpack (instructions) {
    var unpacked = []
    if (!Array.isArray(instructions)) throw Error('Instructions must be an array')
    instructions.forEach(function (instruction, i) {
      var individual = instruction.clone()
      individual.repeat(0)
      for (var m = 0; m < instruction.getNumExec(); m++) {
        unpacked.push(individual)
      }
    })
    return unpacked
  }
  // Parse String of comma seporated instructions
  static parse (instructions) {
    var instructionArray = []
    if (instructions === null || instructions === undefined) throw Error('No instructions to parse')
    if (typeof instructions === 'string') {
      instructionArray = instructions.split(',')
    } else if (Array.isArray(instructions)) {
      instructionArray = instructions
    } else {
      throw Error('Unknown instructions set type. Must be comma separated string of Array of stings')
    }
    var parsedInstructions = []
    var errors = []
    instructionArray.forEach(function (ratInstruction, i) {
      if (typeof ratInstruction !== 'string') {
        errors.push('Instructions to parse must be strings, not ' + typeof ratInstruction)
        return false
      }

      ratInstruction = ratInstruction.trim()
      if (ratInstruction === '') return true
      try {
        parsedInstructions.push(this.parseRatInstruction(ratInstruction))
      } catch (Exception) {
        errors.push('Unable to parse instruction: ' + ratInstruction + ' (#' + i + ')')
        return false
      }
    }.bind(this))
    if (errors.length === 0) {
      return parsedInstructions
    } else {
      throw Error('Parse errors: ' + errors.join(' & '))
    }
  }
  // Parse String of comma seporated instructions
  // parseRatInstruction (instruction) {
  //   var re = XRegExp('^((?<repeats> \d+)*)?(?<cmd>PU|PD|RC|RA|CO|CI)(:(?<param>\d+))?')
  //   return XRegExp.exec(instruction, re)
  // var parsedDict = parsed.groups
  //
  // }
  // Parse individual instruction - horrible version
  static parseRatInstruction (instruction) {
    var working = instruction
    var r = {
      repeats: 1,
      cmd: null,
      param: null
    }
    var c = working.split('*')
    if (c.length > 1) {
      r.repeats = c[0]
      working = c[1]
    }
    var d = working.split(':')
    if (d.length > 1) {
      r.cmd = d[0]
      r.param = d[1]
    } else {
      r.cmd = working
    }
    // Clean
    r.repeats = (r.repeats === undefined || r.repeats === null) ? 0 : Number.parseInt(r.repeats - 1)
    r.param = (r.param === undefined || r.param === null) ? null : Number.parseInt(r.param)
    if (r.cmd === null) throw Error('Parse error')

    return new RATInstruction(r.cmd).repeat(r.repeats).param(r.param)
  }
}

const ROTATE_CW = 'RC'
const ROTATE_CCW = 'RA'
const CAR_IN = 'CI'
const CAR_OUT = 'CO'
const PEN_UP = 'PU'
const PEN_DOWN = 'PD'
const RAT_INST_TYPES = [ROTATE_CW, ROTATE_CCW, CAR_IN, CAR_OUT, PEN_UP, PEN_DOWN]

class RATInstruction {
  constructor (instructionType) {
    if (RAT_INST_TYPES.indexOf(instructionType) < 0) throw Error('Unknown RAT instruction type: ' + instructionType)
    this.struct = {
      t: instructionType,
      r: 1,
      p: null
    }
  }
  getType () {
    return this.struct.t
  }
  getNumExec () {
    return this.struct.r
  }
  getParam () {
    return this.struct.p
  }
  param (value) {
    this.struct.p = value
    return this
  }
  repeat (value) {
    value = Number.parseInt(value)
    value = Math.max(0, value)
    this.struct.r = 1 + value
    return this
  }
  toString () {
    var repeats = (this.getNumExec() > 1 ? this.getNumExec() + '*' : '')
    var param = (this.getParam() !== null ? ':' + this.getParam() : '')
    return repeats + this.getType() + param
  }

  clone () {
    return new RATInstruction(this.getType()).repeat(this.getNumExec() - 1).param(this.getParam())
  }
}

export default RAT
export {
  RAT,
  ROTATE_CW,
  ROTATE_CCW,
  CAR_OUT,
  CAR_IN,
  PEN_UP,
  PEN_DOWN
}
