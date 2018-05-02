import RAT from './rolang-rat'

const cmdGetConfig = 1
const cmdPrintProgress = 2
const cmdRAT = 3
const cmdStop = 4

const cmdTypes = [cmdGetConfig, cmdPrintProgress, cmdRAT, cmdStop]

class Command {
  //
  constructor (type, data = null) {
    if (cmdTypes.indexOf(type) < 0) throw Error('Invalid command Type')
    // If command rat
    if (type === cmdRAT && !Array.isArray(data)) throw Error('Invalid Data for command type cmdRAT. Data must be an array of RATInstructions not: ' + typeof data)
    if (type === cmdRAT) data = data.map(RAT.toString)

    this.struct = {
      t: type,
      d: data
    }
  }

  static fromJson (json) {
    return new this(json.t, json.d)
  }

  static fromString (str) {
    var json = JSON.parse(str)
    return this.fromJson(json)
  }

  getType () {
    return this.struct.t
  }

  getData () {
    return this.struct.d
  }

  toJson () {
    return this.struct
  }

  toString () {
    return JSON.stringify(this.struct)
  }
  //
}

export {
  Command,
  cmdGetConfig,
  cmdPrintProgress,
  cmdRAT,
  cmdStop
}
