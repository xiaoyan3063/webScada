<template>
  <g
    class="scada-component scada-pump"
    :transform="`translate(${item.x}, ${item.y})`"
  >
    <!-- 泵体 -->
    <rect
      width="80"
      height="60"
      rx="5"
      :fill="item.fill"
      :stroke="item.stroke"
      :stroke-width="item.strokeWidth"
    />
    
    <!-- 叶轮 -->
    <circle
      cx="40"
      cy="30"
      r="20"
      fill="#fff"
      :stroke="item.stroke"
      stroke-width="2"
    />
    <path
      d="M40,10 A20,20 0 1,1 40,50 A20,20 0 1,1 40,10"
      fill="none"
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
      @mousedown.stop="$emit('startConnection', 'inlet')"
    />
    <circle
      v-if="selected"
      cx="80"
      cy="30"
      r="5"
      fill="#3498db"
      @mousedown.stop="$emit('startConnection', 'outlet')"
    />
    
    <!-- 文本标签 -->
    <text
      v-if="item.text"
      x="40"
      y="85"
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
  name: 'ScadaPump',
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
.scada-pump:hover {
  filter: drop-shadow(0 0 3px rgba(41, 128, 185, 0.5));
}
</style>