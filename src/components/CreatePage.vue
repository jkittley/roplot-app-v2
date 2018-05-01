<template>
  <v-ons-page>

    <please-connect v-if="!hasPrinter"></please-connect>
    
    <div v-show="hasPrinter" style="text-align: center">
      Create things to print
    </div>
  </v-ons-page>
</template>

<script>
import { mapGetters } from 'vuex'
import PleaseConnect from './PleaseConnect'

export default {
  name: 'create',
  computed: mapGetters(['hasPrinter']),
  components: {
    PleaseConnect
  }
}
</script>