<template>
    <g class="scada-image" @click.stop="$emit('select')">
      <!-- 使用完整的 SVG image 元素，确保所有属性正确 -->
      <image
        v-if="item.src"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        :xlink:href="absolutePath"
        :href="absolutePath"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        preserveAspectRatio="xMidYMid meet"
        style="pointer-events: none;"
      />
      
      <!-- 调试元素（始终显示） -->
      <rect
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        fill="rgba(255,0,0,0.2)"
        stroke="green"
        stroke-width="1"
      />
    </g>
  </template>
  
  <script>
  export default {
    props: {
      item: Object,
      selected: Boolean
    },
    computed: {
      absolutePath() {
        // 确保路径包含协议和域名
        if(this.item.src.startsWith('http')) return this.item.src
        return `${window.location.origin}${this.item.src.startsWith('/') ? '' : '/'}${this.item.src}`
      }
    },
    mounted() {
      console.log('图片组件渲染详情:', {
        element: this.$el,
        imageElement: this.$el.querySelector('image'),
        computedPath: this.absolutePath
      })
      this.$nextTick(() => {
        const imgEl = this.$el.querySelector('image')
        if(imgEl) {
            console.log('图片元素实际尺寸:', {
            width: imgEl.width.baseVal.value,
            height: imgEl.height.baseVal.value,
            viewBox: imgEl.viewportElement.viewBox.baseVal
            })
            
            // 强制重绘
            imgEl.setAttribute('href', this.absolutePath + '#' + Date.now())
        }
      })
    }
  }
  </script>