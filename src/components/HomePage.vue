<template>
  <v-ons-page>
    <v-ons-toolbar class="home-toolbar">
      <div class="left">
        <v-ons-toolbar-button class="btn-printer" :class="{ 'no-printer': !hasPrinter }" @click="$store.commit('splitter/toggle')">
          <v-ons-icon icon="ion-printer"></v-ons-icon>
        </v-ons-toolbar-button>

        <v-ons-toolbar-button class="btn-ble-status" :class="{ 'no-ble': !isBleAvailable }" @click="$store.commit('splitter/toggle')">
          <v-ons-icon icon="ion-bluetooth"></v-ons-icon>
        </v-ons-toolbar-button>

        <v-ons-toolbar-button id="btn-alerts" class="btn-alerts" :class="{ 'no-alerts': !hasUnseenAlerts }" @click="showAlerts">
          <v-ons-icon icon="ion-alert-circled"></v-ons-icon>
          <span v-if="countUnseenAlerts>0" class="notification">{{ countUnseenAlerts }}</span>
        </v-ons-toolbar-button>
        <v-ons-popover cancelable
          :visible.sync="alertsDialogVisible"
          target="#btn-alerts"
          direction="down"
          @posthide="markAlerts">
          <div class="popover-title">Alerts</div>
          <div class="content alert-message" v-for="alert in getAlerts" v-bind:key="alert.key">
              <strong>{{ alert.title }}</strong><br>
              {{ alert.text }}
          </div>
          <p class="content alert-message" v-if="getAlerts.length===0">
            No messages
          </p>
        </v-ons-popover>
        
      </div>
      <div class="center">{{ msg }}</div>
    </v-ons-toolbar>

    <v-ons-tabbar swipeable position="auto"
      :tabs="tabs"
      :visible="hasPrinter"
      :index.sync="activeIndex"
    >
    </v-ons-tabbar>

  </v-ons-page>
</template>

<script>

import VisPage from './VisPage'
import ConsolePage from './ConsolePage'
import CreatePage from './CreatePage'

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'home',
  data () {
    return {
      msg: 'Roplot',
      alertsDialogVisible: false,
      activeIndex: 0,
      tabs: [
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
          icon: this.md() ? null : 'ion-paintbrush',
          label: 'Create',
          page: CreatePage,
          props: {
            myProp: 'This is a page prop!'
          },
          key: 'create',
          visible: false
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
    ...mapActions(['markAllAlertsAsSeen']),
    md () {
      return this.$ons.platform.isAndroid()
    },
    showAlerts: function (event) {
      this.alertsDialogVisible = true
    },
    markAlerts: function (event) {
      if (event) {
        this.markAllAlertsAsSeen()
      }
    }
  },
  computed: {
    title () {
      return this.tabs[this.activeIndex].label
    },
    ...mapGetters(['hasPrinter', 'isBleAvailable', 'hasUnseenAlerts', 'getAlerts', 'countUnseenAlerts'])
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

@keyframes danger-pulsate {
    0%   { color: rgba(255,20,0,0.8); }
    50%  { color:  rgba(255,20,0,0);}
    100% { color:  rgba(255,20,0,0.8);}
}

.no-printer {
  color: red;
  animation: danger-pulsate 2s infinite;
}

.no-ble {
  color: red;
}


@keyframes warning-pulsate {
    0%   { color: rgba(255,165,0,1); }
    50%  { color: rgba(255,165,0,0);}
    100% { color: rgba(255,165,0,1);}
}

.btn-alerts {
  color: orange;
  animation: warning-pulsate 2s infinite;
}

.no-alerts {
  color: #ccc;
  animation: none;
}

.alert-message {
  padding: 10px;
  background-color: #eee;
}

ons-toolbar-button {
  position: relative;
}

.notification {
  position: absolute;
  top: 0;
  right:0;
  height: 15px;
  width: 15px;
  font-size: 8px;
  padding: 0;
  margin: 0;
}

.popover-title {
  padding: 15px;
  text-align: center;
  font-weight: 800;
}


</style>
