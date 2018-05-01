class RAT {
  // Individual RAT commands to multiple e.g. RA,RA to 2*RA
  static pack () {

  }
  // Repeat RATs to indvx 3*RA to RA,RA,RA
  static unpack () {

  }
  // Parse String of comma seporated instructions
  static parse (instructionString) {
    var parsedInstructions = []
    var errors = []
    instructionString.split(',').forEach(function (instruction, i) {
      instruction = instruction.trim()
      if (instruction === '') return true
      try {
        parsedInstructions.push(this.parseRatInstruction(instruction))
      } catch (Exception) {
        var e = 'Unable to parse instruction: ' + instruction + ' (#' + i + ')'
        errors.push(e)
        return false
      }
    }.bind(this))
    if (errors.length === 0) {
      return parsedInstructions
    } else {
      throw Error('Parse errors: ' + ' & '.join(errors))
    }
  }
  // Parse String of comma seporated instructions
  // parseRatInstruction (instruction) {
  //   var re = XRegExp('^((?<repeats> \d+)*)?(?<cmd>PU|PD|RC|RA|CO|CI)(:(?<param>\d+))?')
  //   return XRegExp.exec(instruction, re)
  // var parsedDict = parsed.groups
  //     parsedDict.repeats = (parsedDict.repeats === undefined) ? 1 : Number.parseInt(parsedDict.repeats)
  //     parsedDict.param = (parsedDict.param === undefined) ? null : Number.parseInt(parsedDict.param)
  //     parsedInstructions.push(parsedDict)
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
    r.repeats = (r.repeats === undefined) ? 1 : Number.parseInt(r.repeats)
    r.param = (r.param === undefined) ? null : Number.parseInt(r.param)
    if (r.cmd === null) throw Error('Parse error')
    return r
  }
}

export default RAT
