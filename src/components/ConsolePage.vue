<template>
  <v-ons-page>

    <please-connect v-if="!hasPrinter"></please-connect>
    
    <p v-else style="text-align: center">
      Console
    </p>
  </v-ons-page>
</template>

<script>
import PleaseConnect from './PleaseConnect'

export default {
  name: 'console',
  components: {
    PleaseConnect
  }
}
</script>