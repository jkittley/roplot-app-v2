<template>
  <v-ons-page>
    <v-ons-toolbar class="home-toolbar">
      <div class="left">
        <v-ons-toolbar-button @click="$store.commit('splitter/toggle')">
          <v-ons-icon icon="ion-printer, material:md-menu"></v-ons-icon>
        </v-ons-toolbar-button>

      </div>
      <div class="center">{{ msg }}</div>
    </v-ons-toolbar>

    <v-ons-tabbar swipeable position="auto"
      :tabs="tabs"
      :visible="true"
      :index.sync="activeIndex"
    >
    </v-ons-tabbar>


  </v-ons-page>
</template>

<script>

import VisPage from './VisPage'
import ConsolePage from './ConsolePage'
import NewsPage from './NewsPage'
import CreatePage from './CreatePage'

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
        },
        {
          icon: this.md() ? null : 'ion-ios-information-outline',
          label: 'News & Info',
          page: NewsPage,
          props: {
            myProp: 'This is a page prop!'
          },
          key: 'news'
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header {
  text-align: center;
}

img {
  max-width: 300px;
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
</style>
