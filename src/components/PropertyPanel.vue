<template>
    <div class="property-panel">
      <div class="panel-header">属性</div>      
      <div class="panel-content" v-if="selectedItem">
        <button 
            v-if="selectedItem" 
            @click="deleteSelected"
            class="delete-button"
        >
        删除选中组件
        </button>
        <div class="property-group">
          <div class="group-title">基本属性</div>
          <div class="property-item">
            <label>X坐标</label>
            <input type="number" v-model.number="selectedItem.x" @change="updateItem">
          </div>
          <div class="property-item">
            <label>Y坐标</label>
            <input type="number" v-model.number="selectedItem.y" @change="updateItem">
          </div>
          <div class="property-item">
            <label>宽度</label>
            <input type="number" v-model.number="selectedItem.width" @change="updateItem">
          </div>
          <div class="property-item">
            <label>高度</label>
            <input type="number" v-model.number="selectedItem.height" @change="updateItem">
          </div>
          <div class="property-item">
            <label>旋转</label>
            <input type="number" v-model.number="selectedItem.rotation" @change="updateItem">
          </div>
        </div>
        <div v-if="selectedItem && selectedItem.type === 'ScadaImage'">
            <h3>图片属性</h3>
            <div class="property-group">
                <label>图片源</label>
                <input v-model="selectedItem.src" @change="updateItem">
            </div>
            <div class="property-group">
                <label>保持宽高比</label>
                <input type="checkbox" v-model="selectedItem.keepAspectRatio" @change="updateItem">
            </div>
        </div>
        <div class="property-group" v-else-if="selectedItem.type === 'text'">
          <div class="group-title">文本属性</div>
          <div class="property-item">
            <label>文本内容</label>
            <input type="text" v-model="selectedItem.text" @change="updateItem">
          </div>
          <div class="property-item">
            <label>字体大小</label>
            <input type="number" v-model.number="selectedItem.fontSize" @change="updateItem">
          </div>
          <div class="property-item">
            <label>字体颜色</label>
            <input type="color" v-model="selectedItem.fontColor" @change="updateItem">
          </div>
        </div> 
        <div class="property-group" v-else>
          <div class="group-title">填充与边框</div>
          <div class="property-item">
            <label>填充颜色</label>
            <input type="color" v-model="selectedItem.fill" @change="updateItem">
          </div>
          <div class="property-item">
            <label>边框颜色</label>
            <input type="color" v-model="selectedItem.stroke" @change="updateItem">
          </div>
          <div class="property-item">
            <label>边框宽度</label>
            <input type="number" v-model.number="selectedItem.strokeWidth" @change="updateItem">
          </div>
        </div>  
        
        <div class="property-group">
          <div class="group-title">动画设置</div>
          <button @click="openAnimationConfig">添加动画</button>
          <div v-for="anim in itemAnimations" :key="anim.id" class="animation-item">
            {{ anim.type }} - {{ anim.property }}
            <button @click="removeAnimation(anim.id)">删除</button>
          </div>
        </div>
      </div>
      <div class="panel-empty" v-else>
        请选择一个对象
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  
  export default {
    computed: {
      ...mapState('editor', {
        selectedItemId: state => state.selectedItemId,
        canvasItems: state => state.canvasItems
      }),
      ...mapState('animation', {
        animations: state => state.animations
      }),
      
      selectedItem() {
        if (!this.selectedItemId) return null
        return this.canvasItems.find(item => item.id === this.selectedItemId)
      },
      
      itemAnimations() {
        if (!this.selectedItemId) return []
        return this.animations.filter(anim => anim.itemId === this.selectedItemId)
      }
    },
    methods: {
      ...mapActions('editor', ['updateItem']),
      ...mapActions('animation', ['removeAnimation']),
      
      openAnimationConfig() {
        this.$emit('open-animation-config', this.selectedItemId)
      },
      deleteSelected() {
        this.$store.dispatch('editor/deleteSelectedItem')
      }
    }
  }
  </script>
  
  <style scoped>
  .property-panel {
    width: 300px;
    background: #f5f5f5;
    border-left: 1px solid #ddd;
    height: 100%;
    overflow-y: auto;
  }
  
  .panel-header {
    padding: 10px;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
  }
  
  .panel-content {
    padding: 10px;
  }
  
  .panel-empty {
    padding: 20px;
    text-align: center;
    color: #999;
  }
  
  .property-group {
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  
  .group-title {
    font-weight: bold;
    margin-bottom: 10px;
    color: #555;
  }
  
  .property-item {
    margin-bottom: 10px;
  }
  
  .property-item label {
    display: block;
    margin-bottom: 5px;
    font-size: 12px;
    color: #666;
  }
  
  .property-item input {
    width: 100%;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 3px;
  }
  
  .animation-item {
    padding: 5px;
    margin: 5px 0;
    background: #eee;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
  }
  
  .animation-item button {
    font-size: 12px;
    padding: 2px 5px;
  }
  .delete-button {
    background-color: #ff5252;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 15px;
    width: 100%;
  }

    .delete-button:hover {
        background-color: #ff1744;
    }
  </style>