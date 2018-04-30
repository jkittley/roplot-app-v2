<template>
  <v-ons-page>
    <v-ons-toolbar modifier="transparent"></v-ons-toolbar>
    <div class="header">
        <img src="../assets/logo.svg">
    </div>
    
    <v-ons-list-title v-show="hasPrinter">
      <div class="left">
         Selected Printer
      </div>
    </v-ons-list-title>
    <v-ons-list>
      <v-ons-list-item v-if="hasPrinter">
        <div class="left"><v-ons-icon fixed-width icon="ion-printer"></v-ons-icon></div>
        <div class="center">{{ getPrinter.name }}</div>
        <div class="right"><v-ons-button @click="disconnectPrinter" modifier="quiet">Disconnect</v-ons-button></div>
      </v-ons-list-item>
    </v-ons-list>
    <br>
    <v-ons-list-title>
      <div class="left">
        Available Devices
      </div>
    </v-ons-list-title>
    <v-ons-list>
      <v-ons-list-item v-if="getPrinter != item" v-for="item in availablePrinters" :key="item.key">
    
        <div class="left" v-show="!item.isConnecting">
          <v-ons-icon fixed-width icon="ion-printer"></v-ons-icon>
          </div>
        <div class="left" v-show="item.isConnecting">
          <v-ons-icon fixed-width icon="ion-refresh" spin></v-ons-icon> 
          </div>
        <div class="center">{{ item.name }}</div>
        <div class="right"><v-ons-button v-show="!isConnecting && !hasPrinter" @click="connectToPrinter(item)" modifier="quiet">Connect</v-ons-button></div>
      </v-ons-list-item>

      <v-ons-list-item v-if="isBleAvailable">
          <div class="right">
            <v-ons-icon v-show="!isScanning" fixed-width icon="ion-android-refresh"></v-ons-icon>
            <v-ons-icon v-show="isScanning" fixed-width icon="ion-android-refresh" spin></v-ons-icon>
            <v-ons-button v-show="!isScanning" @click="refreshPrinterList" modifier="quiet">Refresh</v-ons-button>
            <v-ons-button v-show="isScanning" modifier="quiet">Refreshing...</v-ons-button>
          </div>
      </v-ons-list-item>
    </v-ons-list>
     
    <v-ons-card v-show="!isBleAvailable">
      <div class="title">
        BLE Connection Error
      </div>
      <div class="content">
        No Bluetooth Low Energy (BLE) connection is available. Please make sure Bluetooth is enabled in your devices settings.
        <br><br>
        <v-ons-button v-if="!isTestingBLE" @click="testBLEConnection">Test for BLE Again</v-ons-button>
        <v-ons-button v-else modifier="outline">
          <v-ons-icon fixed-width icon="ion-refresh" spin></v-ons-icon> 
            Testing for BLE...
          </v-ons-button>
      </div>
    </v-ons-card>

  </v-ons-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'printer-menu',
  computed: mapGetters(['availablePrinters', 'getPrinter', 'hasPrinter', 'isBleAvailable', 'isTestingBLE', 'isConnecting', 'isScanning']),
  methods: mapActions(['refreshPrinterList', 'connectToPrinter', 'disconnectPrinter', 'testBLEConnection'])
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
