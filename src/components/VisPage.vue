<template>
  <v-ons-page>

    
    <v-ons-row vertical-align="top">

      <v-ons-col v-if="!hasPrinter">
        <please-connect></please-connect>
      </v-ons-col>
      
      <v-ons-col v-if="hasPrinterConfig">
        <roplot-visualiser v-bind:printer="getPrinter" v-bind:updates="updates" ></roplot-visualiser>    
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
               <v-ons-col width="33%"><v-ons-button @click="carOut" class="btn-dir"><v-ons-icon icon="fa-arrow-up"></v-ons-icon></v-ons-button></v-ons-col>
              </v-ons-row> 
              <v-ons-row vertical-align="top">
                <v-ons-col width="33%"><v-ons-button @click="rotateCCW" class="btn-dir"><v-ons-icon icon="fa-undo"></v-ons-icon></v-ons-button></v-ons-col>
                <v-ons-col width="33%"><v-ons-button @click="center" class="btn-set"><v-ons-icon icon="fa-dot-circle-o"></v-ons-icon></v-ons-button></v-ons-col>
                <v-ons-col width="33%"><v-ons-button @click="rotateCW" class="btn-dir"><v-ons-icon icon="fa-repeat"></v-ons-icon></v-ons-button></v-ons-col>
              </v-ons-row>
              <v-ons-row vertical-align="top">
                <v-ons-col width="33%"></v-ons-col>
                <v-ons-col width="33%"><v-ons-button @click="carIn" class="btn-dir"><v-ons-icon icon="fa-arrow-down"></v-ons-icon></v-ons-button></v-ons-col>
              </v-ons-row>
              <br><br>
              <v-ons-row vertical-align="top" v-for="pen in getPrinterConfig.pens" v-bind:key="pen.id" >
                <v-ons-col width="100%">
                  {{ pen.pole }} {{ pen.color }}
                </v-ons-col>
                <v-ons-col width="50%">
                  <v-ons-button class="btn-pen" @click="penUp(pen.id)">
                     <v-ons-icon icon="fa-arrow-up" fixed-width></v-ons-icon> 
                  </v-ons-button>
                </v-ons-col>
                <v-ons-col width="50%">
                  <v-ons-button class="btn-pen" @click="penDown(pen.id)">
                     <v-ons-icon icon="fa-arrow-down" fixed-width></v-ons-icon> 
                  </v-ons-button>
                </v-ons-col>
              </v-ons-row>

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

import { mapGetters, mapActions } from 'vuex'
import RoplotVisualiser from './RoplotVisualiser'
import PleaseConnect from './PleaseConnect'
import { Command, cmdRAT, cmdStop } from '../assets/rolang-chat'

export default {
  name: 'vis',
  data: function () {
    return {
      updates: []
    }
  },
  computed: mapGetters(['hasPrinter', 'getPrinter', 'getPrintProgress', 'getPrinterConfig', 'hasPrinterConfig', 'isPrinting']),
  components: {
    RoplotVisualiser,
    PleaseConnect
  },
  methods: {
    ...mapActions(['sendCommand']),
    rotateCW () {
      var cmd = new Command(cmdRAT, ['RC', 'RC', 'RC', 'RC', 'RC', 'RC'])
      this.sendCommand(cmd)
    },
    rotateCCW () {
      var cmd = new Command(cmdRAT, ['RA'])
      this.sendCommand(cmd)
    },
    carOut () {
      var cmd = new Command(cmdRAT, ['CO'])
      this.sendCommand(cmd)
    },
    carIn () {
      var cmd = new Command(cmdRAT, ['CI'])
      this.sendCommand(cmd)
    },
    center () {
      // this.getPrinter().sendCommand('')
    },
    penUp (penID) {
      var cmd = new Command(cmdRAT, ['PU:' + penID])
      this.sendCommand(cmd)
    },
    penDown (penID) {
      var cmd = new Command(cmdRAT, ['PD:' + penID])
      this.sendCommand(cmd)
    },
    stop () {
      var cmd = new Command(cmdStop, null)
      this.sendCommand(cmd)
    }
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
