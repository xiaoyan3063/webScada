<template>
  <circle
    :cx="item.x + item.width/2"
    :cy="item.y + item.height/2"
    :r="Math.min(item.width, item.height)/2"
    :fill="item.fill"
    :stroke="item.stroke"
    class="scada-circle"
  />
</template>

<script>
export default {
  name: 'ScadaCircle', // 必须使用自定义名称
  props: {
    item: Object
  }
}
</script>

<style scoped>
.scada-circle {
  transition: all 0.2s;
}
</style>