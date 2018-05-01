import Vue from 'vue'
import Vuex from 'vuex'
import Printer from './printer'
import * as CHAT from './assets/rolang-chat'

Vue.use(Vuex)

const makeAlert = function (title, msg) {
  return {
    key: Date.now(),
    title: title,
    text: msg,
    seen: false
  }
}

const modulePrinter = {
  state: {
    alerts: [],
    selected: null,
    printers: [new Printer(window.ble, 0, 'Virtual Printer', true)],
    bleAvailable: false,
    isTestingBLE: false,
    isScanning: false,
    isPrinting: false,
    printProgress: 10,
    printUpdates: []
  },
  mutations: {
    emptyPrinterList (state) {
      console.log('Mutation: Emptying printer list')
      state.printers = []
    },
    addPrinterToList (state, printer) {
      console.log('Mutation: Adding printer')
      state.printers.push(printer)
    },
    setSelectedPrinter (state, printer) {
      console.log('Mutation: Setting selected to: ', printer.name)
      printer.isConnecting = false
      state.selected = printer
    },
    unsetSelectedPrinter (state) {
      console.log('Mutation: Unsetting selected')
      state.selected = null
    },
    setBleAvailable (state, value) {
      console.log('Mutation: Setting BLE available to: ', value)
      state.bleAvailable = value
    },
    setIsTestingBLE (state, value) {
      console.log('Mutation: setIsTestingBLE:', value)
      state.isTestingBLE = value
    },
    setIsScanning (state, value) {
      console.log('Mutation: setIsScanning:', value)
      state.isScanning = value
    },
    addAlert (state, msg) {
      console.log('Mutation: addAlert:', msg)
      state.alerts.push(msg)
    },
    setAlertSeenTo (state, payload) {
      console.log('Mutation: setAlertSeenTo:', payload)
      payload.alert.seen = payload.value
    },
    addPrintUpdate (state, payload) {
      console.log('Mutation: addPrintUpdate:', payload)
      state.printUpdates.push(payload)
    }
  },
  actions: {
    refreshPrinterList ({ commit }) {
      commit('setIsScanning', true)
      commit('emptyPrinterList')
      window.ble.startScan([],
        function (device) {
          if (!device.hasOwnProperty('name')) device.name = 'No name'
          commit('addPrinterToList', new Printer(window.ble, device.id, device.name, false))
        },
        function () {
          commit('setIsScanning', false)
        })
      // Stop after timeout
      setTimeout(window.ble.stopScan,
          10000,
          function () {
            commit('setIsScanning', false)
          },
          function () {
            commit('setIsScanning', false)
            commit('addAlert', makeAlert('Scan Error', 'Failed to stop scanning'))
          }
      )
      console.log('Action: Refreshing printer list')
    },
    connectToPrinter ({ commit }, printer) {
      console.log('Action: Connecting to printer', printer)
      printer.isConnecting = true
      printer.connect(
        function () {
          // If connection succeeds
          commit('setSelectedPrinter', printer)
        },
        function () {
          // If connect fails
          commit('addAlert', makeAlert('Connection Error', 'Failed to connect'))
        },
        function () {
          // If connection succeeds, but later connection fails
          commit('addAlert', makeAlert('Connection Error', 'The connection to the printer has failed'))
        },
        function (command) {
          // When data comes in
          console.log('New Data', command)
          if (command.getType() === CHAT.cmdPrintProgress) commit('addPrintUpdate', command)
        }
      )
    },
    disconnectPrinter ({ commit, state }) {
      console.log('Action: Disconnecting printer')
      state.selected.disconnect(function (error) {
        if (error) commit('addAlert', makeAlert('Disconnection Error', 'Failed to verify disconnection'))
        commit('unsetSelectedPrinter')
      })
    },
    testBLEConnection ({ commit }) {
      console.log('Action: Testing BLE connection')
      commit('setIsTestingBLE', true)
      try {
        window.ble.isEnabled(
        function () {
          commit('setBleAvailable', true)
          commit('setIsTestingBLE', false)
        },
        function () {
          commit('setBleAvailable', false)
          commit('setIsTestingBLE', false)
        })
      } catch (e) {
        commit('setBleAvailable', false)
        commit('setIsTestingBLE', false)
      }
    },
    markAllAlertsAsSeen: function ({ commit, state }) {
      console.log('Action: marking all alerts as seen')
      for (let item of state.alerts) {
        commit('setAlertSeenTo', { alert: item, value: true })
      }
    },
    sendCommand: function ({ commit, state }, command, waitForResponse = false) {
      console.log('Action: Sending command', command, 'waitForResponse:', waitForResponse)
      state.selected.sendCommand(command)
    }
  },
  getters: {
    hasUnseenAlerts: state => {
      for (let item of state.alerts) {
        if (item.seen === false) return true
      }
      return false
    },
    countUnseenAlerts: state => {
      var counter = 0
      for (let item of state.alerts) {
        if (item.seen === false) counter++
      }
      return counter
    },
    getAlerts: state => {
      return state.alerts
    },
    availablePrinters: state => {
      return state.printers
    },
    getPrinter: state => {
      return state.selected
    },
    hasPrinter: state => {
      return state.selected !== null
    },
    isBleAvailable: state => {
      return state.bleAvailable
    },
    isScanning: state => {
      return state.isScanning
    },
    isTestingBLE: state => {
      return state.isTestingBLE
    },
    isPrinting: state => {
      return state.isPrinting
    },
    isConnecting: state => {
      for (let item of state.printers) {
        if (item.isConnecting === true) return true
      }
      return false
    },
    getPrintProgress: state => {
      return state.printProgress
    },
    getPrinterConfig: state => {
      if (state.selected === null) return null
      return state.selected.config
    },
    hasPrinterConfig: state => {
      if (state.selected === null) return false
      if (state.selected.config === null) return false
      return true
    },
    getPrinterUpdates: state => {
      return state.printUpdates
    }
  }
}

const moduleSplitter = {
  namespaced: true,
  state: {
    open: false
  },
  mutations: {
    toggle (state, shouldOpen) {
      if (typeof shouldOpen === 'boolean') {
        state.open = shouldOpen
      } else {
        state.open = !state.open
      }
    }
  }
}

export default new Vuex.Store({
  modules: {
    splitter: moduleSplitter,
    printers: modulePrinter
  }
})
