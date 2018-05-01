<template>
  <v-ons-page>

    
    <v-ons-row vertical-align="top">

      <v-ons-col v-if="hasPrinterConfig">
        <roplot-visualiser v-bind:printer="getPrinter"></roplot-visualiser>    
      </v-ons-col>

      <v-ons-col v-if="!hasPrinterConfig">
        Waiting for printer configuration...
      </v-ons-col>

      <v-ons-col v-if="!isPrinting && hasPrinterConfig" width="250px" vertical-align="top">
         <v-ons-card>
          <div class="title">
            Manual Control
          </div>
          <div class="content">
            <div class="manual-controls">
              <v-ons-row vertical-align="top">
                <v-ons-col width="33%"><v-ons-button class="btn-pen"><v-ons-icon icon="ion-edit"></v-ons-icon><v-ons-icon icon="ion-arrow-up-c"></v-ons-icon></v-ons-button></v-ons-col>
                <v-ons-col width="33%"><v-ons-button class="btn-dir"><v-ons-icon icon="ion-arrow-up-c"></v-ons-icon></v-ons-button></v-ons-col>
                <v-ons-col width="33%"><v-ons-button class="btn-pen"><v-ons-icon icon="ion-edit"></v-ons-icon></v-ons-icon><v-ons-icon icon="ion-arrow-down-c"></v-ons-icon></v-ons-button></v-ons-col>
              </v-ons-row>
              <v-ons-row vertical-align="top">
                <v-ons-col width="33%"><v-ons-button class="btn-dir"><v-ons-icon icon="ion-arrow-return-right"></v-ons-icon></v-ons-button></v-ons-col>
                <v-ons-col width="33%"><v-ons-button class="btn-set"><v-ons-icon icon="ion-android-locate"></v-ons-icon></v-ons-button></v-ons-col>
                <v-ons-col width="33%"><v-ons-button class="btn-dir"><v-ons-icon icon="ion-arrow-return-left"></v-ons-icon></v-ons-button></v-ons-col>
              </v-ons-row>
              <v-ons-button class="btn-dir"><v-ons-icon icon="ion-arrow-down-c"></v-ons-icon></v-ons-button>
            </div>
          </div>
        </v-ons-card>
      </v-ons-col>

      <v-ons-col v-if="isPrinting" width="250px" vertical-align="top">
         <v-ons-card>
          <div class="title">
            Printing
          </div>
          <div class="content">
            <div class="printing-controls">
              <p>
              Progress: {{ getPrintProgress }}%
              </p>
              <p>
                <v-ons-progress-bar value="20"></v-ons-progress-bar>
              </p>
              <v-ons-button class="btn-dir"><v-ons-icon icon="ion-close-circled"></v-ons-icon> Cancel</v-ons-button>
            </div>
          </div>
        </v-ons-card>
      </v-ons-col>

    </v-ons-row>

  </v-ons-page>
</template>

<script>

import { mapGetters } from 'vuex'
import RoplotVisualiser from './RoplotVisualiser'

export default {
  name: 'vis',
  props: ['myProp'],
  computed: mapGetters(['getPrinter', 'getPrintProgress', 'getPrinterConfig', 'hasPrinterConfig', 'isPrinting']),
  components: {
    RoplotVisualiser
  }
}
</script>

<style>
.manual-controls {
  text-align: center;
}
.manual-controls ons-button {
  width: 50px;
  text-align: center;
  margin: 5px;
}
.manual-controls ons-button ons-icon {
  padding-bottom: 8px;
}
.manual-controls .btn-dir {
  background-color: dodgerblue;
}
.manual-controls .btn-set {
  background-color: #ccc;
}
.manual-controls .btn-pen {
  background-color:  #ccc;
}
.manual-controls ons-button ons-icon {
  padding-bottom: 8px;
}
.printing-controls ons-button {
  width: 100%;
}
.printing-controls ons-button ons-icon {
  padding-bottom: 8px;
}
roplot-visualiser, ons-col, ons-row {
  width: 100%;
  height: 100%;
}
ons-col {
  padding: 10px;
}
</style>
