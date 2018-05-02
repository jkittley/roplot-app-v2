<template>
    <div class="roplot" ref="vis"></div>
</template>

<script>
import { mapGetters } from 'vuex'
import RoplotVis from '../assets/roplot-visualiser'
import { cmdPrintProgress } from '../assets/rolang-chat'

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
      console.log('Vis Component (listener):', event, event.roplot)
    })
  },
  computed: mapGetters(['getPrinterUpdates']),
  watch: {
    getPrinterUpdates: function (val) {
      var updCommand = val[val.length - 1]
      if (updCommand.getType() === cmdPrintProgress) {
        var d = updCommand.getData()
        console.log('Visualiser: ', d)
        this.plot.run(d.rat)
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