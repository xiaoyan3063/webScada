<template>
  <!-- 移除transform改用绝对定位 -->
  <rect 
    :x="item.x"
    :y="item.y"
    :width="item.width"
    :height="item.height"
    :fill="item.fill"
    :stroke="item.stroke"
    :stroke-width="item.strokeWidth"
    class="shape-element"
  />
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
      validator: (item) => {
        // 强制验证关键属性
        return [
          'x', 'y', 'width', 'height', 
          'fill', 'stroke'
        ].every(prop => prop in item)
      }
    }
  }
}
</script>