<template>
  <g
    class="scada-component scada-tank"
    :transform="`translate(${item.x}, ${item.y})`"
  >
    <!-- 罐体 -->
    <rect
      width="100"
      height="150"
      rx="10"
      ry="10"
      :fill="item.fill"
      :stroke="item.stroke"
      :stroke-width="item.strokeWidth"
    />
    
    <!-- 顶部和底部椭圆 -->
    <ellipse
      cx="50"
      cy="20"
      rx="50"
      ry="20"
      :fill="item.fill"
      :stroke="item.stroke"
      :stroke-width="item.strokeWidth"
    />
    <ellipse
      cx="50"
      cy="130"
      rx="50"
      ry="20"
      :fill="item.fill"
      :stroke="item.stroke"
      :stroke-width="item.strokeWidth"
    />
    
    <!-- 液位指示 -->
    <rect
      :width="80"
      :height="item.liquidLevel * 110 || 55"
      x="10"
      :y="130 - (item.liquidLevel * 110 || 55)"
      fill="#64b5f6"
      stroke="#1976d2"
      stroke-width="1"
      rx="5"
      ry="5"
    />
    
    <!-- 连接点 -->
    <circle
      v-if="selected"
      cx="0"
      cy="75"
      r="5"
      fill="#3498db"
      @mousedown.stop="$emit('startConnection', 'left')"
    />
    <circle
      v-if="selected"
      cx="100"
      cy="75"
      r="5"
      fill="#3498db"
      @mousedown.stop="$emit('startConnection', 'right')"
    />
    
    <!-- 文本标签 -->
    <text
      v-if="item.text"
      x="50"
      y="165"
      text-anchor="middle"
      :font-size="item.fontSize"
      :fill="item.fontColor"
    >
      {{ item.text }}
    </text>
  </g>
</template>

<script>
export default {
  name: 'ScadaTank',
  props: {
    item: {
      type: Object,
      required: true,
      default: () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 150,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1,
        liquidLevel: 0.5,
        text: '',
        fontSize: 12,
        fontColor: '#000000'
      })
    },
    selected: Boolean
  },
  computed: {
    hasConnectionPoints() {
      return true
    }
  }
}
</script>

<style scoped>
.scada-tank:hover {
  filter: drop-shadow(0 0 3px rgba(142, 68, 173, 0.5));
}
</style>