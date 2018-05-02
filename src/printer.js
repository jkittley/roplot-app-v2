import Vue from 'vue'
import RAT from './assets/rolang-rat'
import { Command, cmdGetConfig, cmdRAT, cmdPrintProgress } from './assets/rolang-chat'

const bluefruit = {
  serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
  rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
}

class Printer {
  constructor (ble, id, name, isVirtual) {
    this.id = id
    this.ble = ble
    this.name = (name === undefined || name === null) ? 'No name' : name
    this.isConnected = false
    this.isConnecting = false
    this.data = ''
    this.writeMethod = null
    this.isVirtual = isVirtual
    this.dataCallback = null
    this.config = null
  }

  connect (cbConnect = null, cbConnectFail = null, cbDisconnect = null, cbData = null) {
    this.dataCallback = cbData
    this.isConnected = false
    this.isConnecting = true
    // Virtual Printer
    if (this.isVirtual) {
      setTimeout(function () {
        this.isConnected = true
        this.isConnecting = false
        // Get the config details
        this.requestConfiguration()
        // Notify connection made
        cbConnect()
      }.bind(this), 1000)
      return
    }

    // Real Printer
    var onConnect = function (peripheral) {
      this.isConnecting = false
      try {
        this._determineWriteType(peripheral)
        this.ble.startNotification(this.id, bluefruit.serviceUUID, bluefruit.rxCharacteristic, this._onData.bind(this), cbDisconnect.bind(this))
        this.isConnected = true
        // Get the config details
        this.requestConfiguration()
        // Notify connection made
        if (cbConnect !== null) cbConnect()
      } catch (error) {
        Vue.$log.error('onConnect', error)
        this.isConnecting = false
        if (cbDisconnect !== null) cbConnectFail()
      }
    }.bind(this)
    var onDisconnect = function () {
      this.isConnected = false
      this.isConnecting = false
      if (cbDisconnect !== null) cbDisconnect()
    }.bind(this)
    this.ble.connect(this.id, onConnect, onDisconnect)
  }

  disconnect (cb = null) {
    // Virtual Printer
    if (this.isVirtual) {
      setTimeout(function () {
        this.isConnected = false
        if (cb !== null) cb()
      }, 1000)
      return
    }
    // Real Printer
    this.ble.disconnect(
      this.id,
      function () {
        this.isConnected = false
        if (cb !== null) cb(null)
      }.bind(this),
      function (error) {
        if (cb !== null) cb(error)
      }
    )
  }

  // Request the printer configuration
  requestConfiguration (cb = null) {
    var cmd = new Command(cmdGetConfig, null)
    this.sendCommand(cmd, cb)
  }

  sendCommand (command, cb = null) {
    // Virtual Printer
    if (this.isVirtual) {
      this._sendVirtualCommand(command, cb)
      return
    }
    // Real printer
    this.ble.write(
      this.id,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      this.stringToBytes(command.toString()),
      function (e) {
        Vue.$log.debug('Printer: ACK')
        if (cb !== null) cb(e, true)
      },
      function (e) {
        Vue.$log.debug('Printer: No ACK')
        if (cb !== null) cb(e, false)
      }
    )
  }

  _sendVirtualCommand (command, cb = null) {
    Vue.$log.debug('Printer: Sending virtual command: ', command)

    // Callback to say command sent
    if (cb !== null) cb()

    if (command.getType() === cmdGetConfig) {
      var fakeResponseData = JSON.stringify({
        'type': 'printerConfig',
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
      })
      // Time delay fake response
      setTimeout(function () {
        var cmd = new Command(cmdGetConfig, fakeResponseData)
        this._onData(this.stringToBytes(cmd.toString()))
      }.bind(this), 500)
      //
    } else if (command.getType() === cmdRAT) {
      //
      var parsed = RAT.parse(command.getData())
      var unpacked = RAT.unpack(parsed)

      var i = unpacked.length - 1

      var ticker = setInterval(function () {
        var instruction = unpacked[i]
        var cmd = new Command(cmdPrintProgress, {
          rat: instruction.toString(),
          i: i,
          of: unpacked.length
        })
        this._onData(this.stringToBytes(cmd.toString()))
        Vue.$log.debug(i)
        i--
        if (i < 1) clearInterval(ticker)
      }.bind(this), 500)
    }
  }

  _onData (data) {
    // Append data and remove all newlines, tabs, etc.
    this.data += this.bytesToString(data).replace(/(\r\n\t|\n|\r\t)/gm, '')
    var numOpenBraces = (this.data.match(/{/g) || []).length
    var numCloseBraces = (this.data.match(/}/g) || []).length
    // If the string is a complete json sting i.e. num of { == num of }
    if (numOpenBraces === numCloseBraces) {
      try {
        this._processData(this.data)
      } catch (e) {
        Vue.$log.debug('Printer: Parse error', e)
      } finally {
        this.data = ''
      }
    } else {
      Vue.$log.debug('Printer: incomplete packet')
    }
  }

  _processData (data) {
    var cmd = Command.fromString(data)
    // Handle internal messages
    if (cmd.getType() === cmdGetConfig) {
      this.config = cmd.getData()
    }
    // Pass data to external handler
    if (this.dataCallback !== null) this.dataCallback(cmd)
  }

  _determineWriteType (peripheral) {
    var characteristic = peripheral.characteristics.filter(function (element) {
      if (element.characteristic.toLowerCase() === bluefruit.txCharacteristic) {
        return element
      }
    })[0]
    this.writeMethod = (characteristic.properties.indexOf('WriteWithoutResponse') > -1) ? this.ble.writeWithoutResponse : this.ble.write
  }

  // ASCII only
  bytesToString (buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer))
  }
  // ASCII only
  stringToBytes (string) {
    var array = new Uint8Array(string.length)
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i)
    }
    return array.buffer
  }
}

export default Printer
