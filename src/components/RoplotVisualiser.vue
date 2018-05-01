<template>
    <div class="roplot" ref="vis"></div>
</template>

<script>
import { mapGetters } from 'vuex'
import RoplotVis from '../assets/roplot-visualiser'

export default {
  props: ['printer'],
  data: function () {
    return {
      plot: null
    }
  },
  mounted () {
    this.plot = new RoplotVis(this.$refs.vis, {})
    this.$refs.vis.addEventListener('click', function (event) {
      console.log(event, event.roplot)
    })
  },
  computed: mapGetters(['getPrinterUpdates']),
  watch: {
    getPrinterUpdates: function (val) {
      var upd = val[val.length - 1]
      console.log('Updating plot', upd)
      if (upd.hasOwnProperty('type') && upd.type.toLowerCase() === 'progressupd') {
        this.plot.run(upd.rat)
      }
    }
  }
}
</script>

<style>
    @import '../assets/roplot-visualiser.css';
    .roplot {
        width: 100%;
        height: 100%;
    }
</style>