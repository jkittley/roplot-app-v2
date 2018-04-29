import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const makePrinter = function (id, name, isVirtual = false) {
  return {
    name: 'Printer ' + id,
    isConnecting: false,
    id: id,
    isVirtual: isVirtual
  }
}

const modulePrinter = {
  state: {
    selected: null,
    printers: [makePrinter(0, 'Virtual Printer', true)],
    bleAvailable: false
  },
  mutations: {
    refreshPrinterList (state) {
      state.printers.push(makePrinter(state.printers.length, 'Printer ' + state.printers.length))
    },
    setSelectedPrinter (state, printer) {
      console.log('Setting selected to: ', printer.name)
      printer.isConnecting = false
      state.selected = printer
    },
    unsetSelectedPrinter (state) {
      console.log('Un Setting selected')
      state.selected = null
    },
    setBleAvailable (state, value) {
      console.log('Setting BLE available to: ', value)
      state.bleAvailable = value
    }
  },
  actions: {
    refreshPrinterList ({ commit }) {
      commit('refreshPrinterList')
    },
    connectToPrinter ({ commit }, printer) {
      printer.isConnecting = true
      setTimeout(function () {
        commit('setSelectedPrinter', printer)
      }, 2000)
    },
    disconnectPrinter ({ commit }) {
      commit('unsetSelectedPrinter')
    },
    testBLEConnection ({ commit }) {
      console.log('Testing if BLE radio is available')
      try {
        window.ble.isEnabled(
        function () {
          commit('setBleAvailable', true)
        },
        function () {
          commit('setBleAvailable', false)
        })
      } catch (e) {
        commit('setBleAvailable', false)
      }
    }
  },
  getters: {
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
