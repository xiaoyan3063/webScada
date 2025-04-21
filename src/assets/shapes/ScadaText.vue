<template>
    <g 
      class="scada-text"
      :transform="`translate(${item.x}, ${item.y})`"
      @dblclick.stop="handleDoubleClick" 
    >
      <!-- 背景框 -->
      <rect
        :width="item.width"
        :height="item.height"
        :fill="item.backgroundColor"
        rx="3"
      />
      
      <!-- 可编辑状态 -->
      <foreignObject
        v-if="isEditing"
        :width="item.width"
        :height="item.height"
      >
        <textarea
          v-model="editContent"
          class="text-edit-area"
          @blur="saveEdit"
          @keydown.enter="saveEdit"
          autofocus
        />
      </foreignObject>
      
      <!-- 显示状态 -->
      <text
        v-else
        :x="item.width/2"
        :y="item.height/2"
        dominant-baseline="middle"
        text-anchor="middle"
      >
        {{ item.content }}
      </text>
    </g>
  </template>
  
  <script>
  export default {
    name: 'ScadaText',
    props: {
        item: {
            type: Object,
            required: true,
            default: () => ({
                x: 0,
                y: 0,
                width: 120,
                height: 40,
                content: '双击编辑',
                fontSize: 14,
                fontColor: '#000000',
                backgroundColor: 'rgba(240,240,240,0.7)'
            })
        },
        selected: {
            type: Boolean,
            default: false
        }
    },
    data() {
      return {
        isEditing: false,
        editContent: ''
      }
    },
    methods: {
      handleDoubleClick() {
        this.isEditing = true
        this.editContent = this.item.content
        this.$emit('select') // 确保同时选中元素
      },
      saveEdit() {
        this.$emit('update:item', {
          ...this.item,
          content: this.editContent
        })
        this.isEditing = false
      }
    }
  }
  </script>
  
  <style scoped>
  .scada-text {
    cursor: text;
    user-select: none;
  }
  
  .text-edit-area {
    width: 100%;
    height: 100%;
    padding: 5px;
    border: 2px solid #3498db;
    border-radius: 3px;
    resize: none;
    outline: none;
    font: inherit;
  }
  
  .scada-text text {
    dominant-baseline: middle;
    text-anchor: middle;
    pointer-events: none;
  }
  </style>