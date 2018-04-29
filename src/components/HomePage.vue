<template>
  <v-ons-page>
    <v-ons-toolbar class="home-toolbar">
      <div class="left">
        <v-ons-toolbar-button class="btn-printer" :class="{ 'no-printer': !hasPrinter }" @click="$store.commit('splitter/toggle')">
          <v-ons-icon icon="ion-printer, material:md-menu"></v-ons-icon>
        </v-ons-toolbar-button>

        <v-ons-toolbar-button class="btn-ble-status" :class="{ 'no-ble': !isBleAvailable }">
          <v-ons-icon icon="ion-bluetooth, material:md-menu"></v-ons-icon>
        </v-ons-toolbar-button>

      </div>
      <div class="center">{{ msg }}</div>
    </v-ons-toolbar>

    <v-ons-tabbar swipeable position="auto"
      :tabs="tabs"
      :visible="true"
      :index.sync="activeIndex"
      v-show="hasPrinter"
    >
    </v-ons-tabbar>
    
    <div v-show="!hasPrinter">
      <div class="header" style="margin:50px;">
      <img src="../assets/logo-w-text.svg">
      </div>
      <v-ons-card>
        <v-ons-icon size="50px" icon="ion-printer"></v-ons-icon>
        <h1>Please connect to a printer.</h1>
      </v-ons-card>
    </div>

  </v-ons-page>
</template>

<script>

import VisPage from './VisPage'
import ConsolePage from './ConsolePage'
import CreatePage from './CreatePage'

import { mapGetters } from 'vuex'

export default {
  name: 'home',
  data () {
    return {
      msg: 'Roplot',
      activeIndex: 0,
      tabs: [
        {
          icon: this.md() ? null : 'ion-paintbrush',
          label: 'Create',
          page: CreatePage,
          props: {
            myProp: 'This is a page prop!'
          },
          key: 'create'
        },
        {
          icon: this.md() ? null : 'ion-ios-printer-outline',
          label: 'Print',
          page: VisPage,
          props: {
            myProp: 'This is a page prop!'
          },
          key: 'print'
        },
        {
          icon: this.md() ? null : 'ion-bug',
          label: 'Debug',
          page: ConsolePage,
          props: {
            myProp: 'This is a page prop!'
          },
          key: 'debug'
        }
      ]
    }
  },
  methods: {
    goTo (url) {
      window.open(url, '_blank')
    },
    md () {
      return this.$ons.platform.isAndroid()
    }
  },
  computed: {
    title () {
      return this.tabs[this.activeIndex].label
    },
    ...mapGetters(['hasPrinter', 'isBleAvailable'])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header {
  text-align: center;
}

img {
  max-height: 200px;
}

ons-list-title {
  text-transform: none;
}

ons-list-title:not(:first-of-type) {
  margin-top: 30px;
}

ons-card {
  text-align: center;
}

ons-list-item, ons-card {
  cursor: pointer;
}

.btn-ble-status {
  color: rgb(51, 204, 51);
}

.btn-printer {
  color: rgb(51, 204, 51);
}

@keyframes border-pulsate {
    0%   { color: rgba(255,20,0,0.8); }
    50%  { color:  rgba(255,20,0,0);}
    100% { color:  rgba(255,20,0,0.8);}
}

.no-printer {
  color: red;
  animation: border-pulsate 2s infinite;
}

.no-ble {
  color: red;
}

</style>
