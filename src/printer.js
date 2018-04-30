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
  }

  _determineWriteType (peripheral) {
    var characteristic = peripheral.characteristics.filter(function (element) {
      if (element.characteristic.toLowerCase() === bluefruit.txCharacteristic) {
        return element
      }
    })[0]
    this.writeMethod = (characteristic.properties.indexOf('WriteWithoutResponse') > -1) ? this.ble.writeWithoutResponse : this.ble.write
  }

  connect (cbConnect = null, cbConnectFail = null, cbDisconnect = null) {
    this.isConnected = false
    this.isConnecting = true
    // Virtual Printer
    if (this.isVirtual) {
      setTimeout(function () {
        this.isConnected = true
        this.isConnecting = false
        cbConnect()
      }, 2000)
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
        // this.requestConfig(function () {
        if (cbConnect !== null) cbConnect()
        // })
      } catch (error) {
        console.log('error', error)
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

  _onData (data) {
    // Append data and remove all newlines, tabs, etc.
    this.data += this.bytesToString(data).replace(/(\r\n\t|\n|\r\t)/gm, '')
    var numOpenBraces = (this.data.match(/{/g) || []).length
    var numCloseBraces = (this.data.match(/}/g) || []).length
    // If the string is a complete json sting i.e. num of { == num of }
    if (numOpenBraces === numCloseBraces) {
      try {
        console.log(this.data)
        var json = JSON.parse(this.data)
        this.printManager._processUpdates(json)
      } catch (e) {
        console.log('Parse error', e)
      } finally {
        this.data = ''
      }
    } else {
      console.log('incomplete packet')
    }
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
  requestConfig (cb = null) {
    this.sendCommand('getconfig')
    if (cb !== null) cb()
  }
  sendCommand (command, cb = null) {
    var cmd = JSON.stringify({'type': command})
    console.log('sending command: ', cmd, ' to: ', this.id)
    this.ble.write(
      this.id,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      this.stringToBytes(cmd),
      function (e) {
        console.log('ACK')
        if (cb !== null) cb(e, true)
      },
      function (e) {
        console.log('No ACK')
        if (cb !== null) cb(e, false)
      }
    )
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
