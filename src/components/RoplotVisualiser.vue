<template>
    <div class="roplot" ref="vis"></div>
</template>

<script>
import RoplotVis from '../assets/roplot-visualiser'

export default {
  props: ['printer'],
  data: function () {
    return {
      count: 0
    }
  },
  mounted () {
    console.log('printer', this.printer)
    console.log('REFS', this.$refs.lastChild)
    var plot = new RoplotVis(this.$refs.vis, {})
    this.$refs.vis.addEventListener('click', function (event) {
        console.log(event, event.roplot)
    })
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