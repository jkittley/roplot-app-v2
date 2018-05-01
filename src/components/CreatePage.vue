<template>
  <v-ons-page>

    <please-connect v-if="!hasPrinter"></please-connect>
    
    <p v-else style="text-align: center">
      Create things to print
    </p>
  </v-ons-page>
</template>

<script>
import PleaseConnect from './PleaseConnect'

export default {
  name: 'create',
  components: {
    PleaseConnect
  }
}
</script>