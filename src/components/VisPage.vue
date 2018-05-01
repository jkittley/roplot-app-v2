<template>
  <v-ons-page>

    
    <v-ons-row vertical-align="top">

      <v-ons-col v-if="!hasPrinter">
      <div class="header" style="margin:50px;">
      <img src="../assets/logo-w-text.svg">
      </div>
      <v-ons-card class="header">
        <v-ons-icon size="50px" icon="ion-printer"></v-ons-icon>
        <h1>Please connect to a printer.</h1>
      </v-ons-card>
      </v-ons-col>
      
      <v-ons-col v-if="hasPrinterConfig">
        <roplot-visualiser v-bind:printer="getPrinter"></roplot-visualiser>    
      </v-ons-col>

      <v-ons-col v-if="hasPrinter && !hasPrinterConfig">
        <v-ons-card>
          <v-ons-icon icon="fa-refresh" spin></v-ons-icon>
          Waiting for printer configuration...
        </v-ons-card>
      </v-ons-col>

      <v-ons-col v-if="!isPrinting && hasPrinterConfig" width="250px" vertical-align="top">
         <v-ons-card>
          <div class="title">
            Manual Control
          </div>
          <div class="content">
            <div class="manual-controls">
              <v-ons-row vertical-align="top">
               <v-ons-col width="33%"></v-ons-col>
               <v-ons-col width="33%"><v-ons-button class="btn-dir"><v-ons-icon icon="fa-arrow-up"></v-ons-icon></v-ons-button></v-ons-col>
              </v-ons-row> 
              <v-ons-row vertical-align="top">
                <v-ons-col width="33%"><v-ons-button class="btn-dir"><v-ons-icon icon="fa-undo"></v-ons-icon></v-ons-button></v-ons-col>
                <v-ons-col width="33%"><v-ons-button class="btn-set"><v-ons-icon icon="fa-dot-circle-o"></v-ons-icon></v-ons-button></v-ons-col>
                <v-ons-col width="33%"><v-ons-button class="btn-dir"><v-ons-icon icon="fa-repeat"></v-ons-icon></v-ons-button></v-ons-col>
              </v-ons-row>
              <v-ons-row vertical-align="top">
                <v-ons-col width="33%"></v-ons-col>
                <v-ons-col width="33%"><v-ons-button class="btn-dir"><v-ons-icon icon="fa-arrow-down"></v-ons-icon></v-ons-button></v-ons-col>
              </v-ons-row>
              <br><br>
              <v-ons-button class="btn-pen" v-for="pen in getPrinterConfig.pens" v-bind:key="pen.id">
                <v-ons-icon icon="fa-pencil" fixed-width></v-ons-icon> {{ pen.pole }} {{ pen.color }}
              </v-ons-button>

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
  computed: mapGetters(['hasPrinter', 'getPrinter', 'getPrintProgress', 'getPrinterConfig', 'hasPrinterConfig', 'isPrinting']),
  components: {
    RoplotVisualiser
  }
}
</script>

<style>
.header {
  text-align: center;
}
.manual-controls {
  text-align: center;
}
.manual-controls .btn-dir, .manual-controls .btn-set,  {
  width: 50px;
  text-align: center;
  margin: 5px;
}

ons-button {
  width: 100%;
}

.manual-controls .btn-dir {
  background-color: dodgerblue;
}
.manual-controls .btn-set {
  background-color: #ccc;
}
.manual-controls .btn-pen {
  width: 100%;
  margin-bottom: 5px;
}

roplot-visualiser, ons-col, ons-row {
  width: 100%;
  height: 100%;
}
ons-col {
  padding: 5px;
}
</style>
