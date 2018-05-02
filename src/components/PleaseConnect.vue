<template>
  <div>
    <div class="header" style="margin:50px;">
        <img src="../assets/logo-w-text.svg">
    </div>
    <v-ons-card class="header" @click="$store.commit('splitter/toggle')">
      <v-ons-icon size="50px" icon="ion-printer"></v-ons-icon>
      <h1 v-if="!isConnecting">Please connect to a printer.</h1>
      <h1 v-else><v-ons-icon icon="fa-refresh" spin></v-ons-icon> Connecting...</h1>
    </v-ons-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'please-connect',
  computed: mapGetters(['isConnecting'])
}
</script>