<template>
  <v-ons-page>
    <v-ons-toolbar modifier="transparent"></v-ons-toolbar>
    <div class="header">
      Printers
    </div>
    
    <v-ons-list-title v-show="getSelectedPrinter!==null">
      <div class="left">
         Selected Printer
      </div>
    </v-ons-list-title>
    <v-ons-list>
      <v-ons-list-item v-if="getSelectedPrinter">
        <div class="left"><v-ons-icon fixed-width icon="ion-printer"></v-ons-icon></div>

        <div class="center">{{ getSelectedPrinter.name }}</div>
        <div class="right"><v-ons-button @click="disconnectSelectedPrinter" modifier="quiet">Disconnect</v-ons-button></div>
      </v-ons-list-item>
    </v-ons-list>
    
    <v-ons-list-title>
      <div class="left">
        Available Printers
      </div>
    </v-ons-list-title>
    <v-ons-list>
      <v-ons-list-item modifier="chevron" v-for="item in allPrinters" @click="connectToPrinter(item)" :key="item.key">
        <div class="left"><v-ons-icon fixed-width icon="ion-printer"></v-ons-icon></div>
        <div class="center">{{ item.name }}</div>
      </v-ons-list-item>
    </v-ons-list>
     <v-ons-button @click="refreshPrinterList" modifier="quiet">Refresh</v-ons-button>
  </v-ons-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'menu',
  computed: mapGetters(['allPrinters', 'getSelectedPrinter']),
  methods: mapActions(['refreshPrinterList', 'connectToPrinter', 'disconnectSelectedPrinter'])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header {
  text-align: center;
  margin-bottom: 20px;
}

img {
  max-width: 150px;
}

ons-list-title {
  text-transform: none;
}

ons-list-item {
  cursor: pointer;
}
</style>
