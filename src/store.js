import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const modulePrinter = {
  state: {
    selected: null,
    printers: [{
      name: 'Virtual Printer',
      id: 0
    }]
  },
  mutations: {
    refreshPrinterList (state) {
      state.printers.push({
        key: state.printers.length,
        name: 'Printer ' + state.printers.length,
        id: 0
      })
    },
    setSelectedPrinter (state, printer) {
      console.log('Setting selected to: ', printer.name)
      state.selected = printer
    },
    unsetSelectedPrinter (state) {
      console.log('Un Setting selected')
      state.selected = null
    }
  },
  actions: {
    refreshPrinterList ({ commit }) {
      commit('refreshPrinterList')
    },
    connectToPrinter ({ commit }, printer) {
      commit('setSelectedPrinter', printer)
    },
    disconnectSelectedPrinter ({ commit }) {
      commit('unsetSelectedPrinter')
    }
  },
  getters: {
    allPrinters: state => {
      return state.printers
    },
    getSelectedPrinter: state => {
      return state.selected
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
