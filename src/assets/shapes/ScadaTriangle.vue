<template>
  <polygon
    :points="trianglePoints"
    :fill="item.fill"
    :stroke="item.stroke"
    class="scada-triangle"
  />
</template>

<script>
export default {
  name: 'ScadaTriangle', // 必须声明组件名
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    trianglePoints() {
      const { x, y, width, height } = this.item
      return `
        ${x + width/2},${y} 
        ${x + width},${y + height} 
        ${x},${y + height}
      `
    }
  }
}
</script>