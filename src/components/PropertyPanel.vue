<template>
    <div class="property-panel">
      <h3>属性面板</h3>
      
      <div v-for="item in selectedItemsData" :key="item.id" class="item-properties">
        <h4>{{ item.type }} (ID: {{ item.id }})</h4>
        
        <div class="property-group">
          <label>位置 X:</label>
          <input 
            type="number" 
            v-model.number="item.x" 
            @change="updateSelectedItems({ x: item.x })"
            v-if="hasProperty(item, 'x')"
          >
        </div>
        
        <div class="property-group">
          <label>位置 Y:</label>
          <input 
            type="number" 
            v-model.number="item.y" 
            @change="updateSelectedItems({ y: item.y })"
            v-if="hasProperty(item, 'y')"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'rectangle'">
          <label>宽度:</label>
          <input 
            type="number" 
            v-model.number="item.width" 
            @change="updateSelectedItems({ width: item.width })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'rectangle'">
          <label>高度:</label>
          <input 
            type="number" 
            v-model.number="item.height" 
            @change="updateSelectedItems({ height: item.height })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'circle'">
          <label>半径:</label>
          <input 
            type="number" 
            v-model.number="item.r" 
            @change="updateSelectedItems({ r: item.r })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'line'">
          <label>X1:</label>
          <input 
            type="number" 
            v-model.number="item.x1" 
            @change="updateSelectedItems({ x1: item.x1 })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'line'">
          <label>Y1:</label>
          <input 
            type="number" 
            v-model.number="item.y1" 
            @change="updateSelectedItems({ y1: item.y1 })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'line'">
          <label>X2:</label>
          <input 
            type="number" 
            v-model.number="item.x2" 
            @change="updateSelectedItems({ x2: item.x2 })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'line'">
          <label>Y2:</label>
          <input 
            type="number" 
            v-model.number="item.y2" 
            @change="updateSelectedItems({ y2: item.y2 })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'text'">
          <label>内容:</label>
          <input 
            type="text" 
            v-model="item.content" 
            @change="updateSelectedItems({ content: item.content })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'text'">
          <label>字体大小:</label>
          <input 
            type="number" 
            v-model.number="item.fontSize" 
            @change="updateSelectedItems({ fontSize: item.fontSize })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'image'">
          <label>宽度:</label>
          <input 
            type="number" 
            v-model.number="item.width" 
            @change="updateSelectedItems({ width: item.width })"
          >
        </div>
        
        <div class="property-group" v-if="item.type === 'image'">
          <label>高度:</label>
          <input 
            type="number" 
            v-model.number="item.height" 
            @change="updateSelectedItems({ height: item.height })"
          >
        </div>
        
        <div class="property-group">
          <label>填充颜色:</label>
          <input 
            type="color" 
            v-model="item.fill" 
            @change="updateSelectedItems({ fill: item.fill })"
            v-if="hasProperty(item, 'fill')"
          >
        </div>
        
        <div class="property-group">
          <label>边框颜色:</label>
          <input 
            type="color" 
            v-model="item.stroke" 
            @change="updateSelectedItems({ stroke: item.stroke })"
            v-if="hasProperty(item, 'stroke')"
          >
        </div>
        
        <div class="property-group">
          <label>边框宽度:</label>
          <input 
            type="number" 
            v-model.number="item.strokeWidth" 
            @change="updateSelectedItems({ strokeWidth: item.strokeWidth })"
            v-if="hasProperty(item, 'strokeWidth')"
          >
        </div>
        
        <div class="property-group">
          <label>透明度:</label>
          <input 
            type="range" 
            v-model.number="item.opacity" 
            min="0" 
            max="1" 
            step="0.1"
            @change="updateSelectedItems({ opacity: item.opacity })"
          >
          <span>{{ item.opacity }}</span>
        </div>
        
        <div class="property-group" v-if="hasProperty(item, 'rotation')">
          <label>旋转角度:</label>
          <input 
            type="number" 
            v-model.number="item.rotation" 
            @change="updateSelectedItems({ rotation: item.rotation })"
          >
        </div>
        
        <div class="binding-section" v-if="selectedItems.length === 1">
          <h4>变量绑定</h4>
          
          <div class="binding-group" v-for="prop in bindableProperties(item)" :key="prop">
            <label>{{ prop }}:</label>
            <select v-model="item.bindings[prop].variableId" @change="updateBinding(item.id, prop)">
              <option value="">无</option>
              <option v-for="variable in variables" :key="variable.id" :value="variable.id">
                {{ variable.name }} (当前值: {{ variable.value }})
              </option>
            </select>
            
            <div v-if="item.bindings[prop]" class="transform-fn">
              <label>转换函数 (value, min, max):</label>
              <input 
                type="text" 
                v-model="item.bindings[prop].transformFn" 
                placeholder="例如: value * 2"
                @change="updateBinding(item.id, prop)"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      items: {
        type: Array,
        required: true
      },
      selectedItems: {
        type: Array,
        required: true
      },
      variables: {
        type: Array,
        required: true
      }
    },
    
    computed: {
      selectedItemsData() {
        return this.items.filter(item => this.selectedItems.includes(item.id))
      }
    },
    
    methods: {
      hasProperty(item, prop) {
        return prop in item
      },
      
      bindableProperties(item) {
        // 返回可以绑定变量的属性列表
        const commonProps = ['fill', 'stroke', 'opacity', 'rotation']
        const typeSpecificProps = {
          rectangle: ['width', 'height', 'x', 'y'],
          circle: ['r', 'cx', 'cy'],
          line: ['x1', 'y1', 'x2', 'y2'],
          text: ['content', 'fontSize', 'x', 'y'],
          image: ['width', 'height', 'x', 'y']
        }
        
        return [...commonProps, ...(typeSpecificProps[item.type] || [])].filter(prop => this.hasProperty(item, prop))
      },
      
      updateSelectedItems(updates) {
        this.$emit('update-item', updates)
      },
      
      updateBinding(itemId, property) {
        const item = this.selectedItemsData.find(i => i.id === itemId)
        if (!item) return
        
        const variableId = item.bindings[property]?.variableId
        const transformFn = item.bindings[property]?.transformFn
        
        if (variableId) {
          this.$emit('bind-variable', itemId, property, variableId, transformFn)
        } else {
          // 移除绑定
          if (item.bindings && item.bindings[property]) {
            delete item.bindings[property]
            this.$emit('update-item', {}) // 触发更新
          }
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .property-panel {
    width: 300px;
    padding: 10px;
    background: #f5f5f5;
    border-left: 1px solid #ddd;
    overflow-y: auto;
  }
  
  .item-properties {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
  }
  
  .property-group {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }
  
  .property-group label {
    width: 80px;
    margin-right: 10px;
    font-size: 12px;
  }
  
  .property-group input[type="number"],
  .property-group input[type="text"] {
    width: 60px;
    padding: 2px 5px;
  }
  
  .property-group input[type="range"] {
    flex: 1;
    margin-right: 5px;
  }
  
  .binding-section {
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }
  
  .binding-group {
    margin-bottom: 10px;
  }
  
  .binding-group label {
    display: block;
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  .binding-group select {
    width: 100%;
    padding: 3px;
  }
  
  .transform-fn {
    margin-top: 5px;
  }
  
  .transform-fn input {
    width: 100%;
    padding: 3px;
    font-size: 12px;
  }
  </style>