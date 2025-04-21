<template>
  <g 
    class="scada-component scada-valve"
    :transform="`translate(${item.x}, ${item.y})`"
  >
    <!-- 阀门主体 -->
    <rect
      width="60"
      height="60"
      rx="5"
      :fill="item.fill"
      :stroke="item.stroke"
      :stroke-width="item.strokeWidth"
    />
    
    <!-- 阀门图标 -->
    <circle
      cx="30"
      cy="30"
      r="20"
      fill="#fff"
      :stroke="item.stroke"
      stroke-width="2"
    />
    <line
      x1="30" y1="10"
      x2="30" y2="50"
      :stroke="item.stroke"
      stroke-width="2"
    />
    <line
      x1="10" y1="30"
      x2="50" y2="30"
      :stroke="item.stroke"
      stroke-width="2"
    />
    
    <!-- 连接点 -->
    <circle
      v-if="selected"
      cx="0"
      cy="30"
      r="5"
      fill="#3498db"
      @mousedown.stop="$emit('startConnection', 'left')"
    />
    <circle
      v-if="selected"
      cx="60"
      cy="30"
      r="5"
      fill="#3498db"
      @mousedown.stop="$emit('startConnection', 'right')"
    />
    
    <!-- 文本标签 -->
    <text
      v-if="item.text"
      x="30"
      y="75"
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
  name: 'ScadaValve',
  props: {
    item: {
      type: Object,
      required: true,
      default: () => ({
        x: 0,
        y: 0,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1,
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
.scada-valve:hover {
  filter: drop-shadow(0 0 3px rgba(52, 152, 219, 0.5));
}
</style>