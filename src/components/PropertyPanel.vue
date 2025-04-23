<template>
  <div class="property-panel">
    <h3>属性面板</h3>
    
    <div v-if="localItem" class="item-properties">
      <!-- <h4>{{ getTypeName(localItem.type) }} (ID: {{ localItem.id }})</h4> -->
      <h4>{{ getTypeName(localItem.type) }}</h4>
      
      <!-- 矩形属性 -->
      <div v-if="localItem.type === 'rectangle'" class="type-properties">
        <div class="property-group">
          <label>位置 X:</label>
          <input 
            type="number" 
            v-model.number="localItem.x" 
            @change="handlePropertyChange('x', localItem.x)"
          >
        </div>
        
        <div class="property-group">
          <label>位置 Y:</label>
          <input 
            type="number" 
            v-model.number="localItem.y" 
            @change="handlePropertyChange('y', localItem.y)"
          >
        </div>
        
        <div class="property-group">
          <label>宽度:</label>
          <input 
            type="number" 
            v-model.number="localItem.width" 
            @change="handlePropertyChange('width', localItem.width)"
            min="1"
          >
        </div>
        
        <div class="property-group">
          <label>高度:</label>
          <input 
            type="number" 
            v-model.number="localItem.height" 
            @change="handlePropertyChange('height', localItem.height)"
            min="1"
          >
        </div>
        
        <div class="property-group">
          <label>旋转角度:</label>
          <input 
            type="number" 
            v-model.number="localItem.rotation" 
            @change="handlePropertyChange('rotation', localItem.rotation)"
            step="1"
          >
        </div>
      </div>
      
      <!-- 圆形属性 -->
      <div v-else-if="localItem.type === 'circle'" class="type-properties">
        <div class="property-group">
          <label>中心 X:</label>
          <input 
            type="number" 
            v-model.number="localItem.cx" 
            @change="handlePropertyChange('cx', localItem.cx)"
          >
        </div>
        
        <div class="property-group">
          <label>中心 Y:</label>
          <input 
            type="number" 
            v-model.number="localItem.cy" 
            @change="handlePropertyChange('cy', localItem.cy)"
          >
        </div>
        
        <div class="property-group">
          <label>半径:</label>
          <input 
            type="number" 
            v-model.number="localItem.r" 
            @change="handlePropertyChange('r', localItem.r)"
            min="1"
          >
        </div>
      </div>
      
      <!-- 线条属性 -->
      <div v-else-if="localItem.type === 'line'" class="type-properties">
        <div class="property-group">
          <label>起点 X:</label>
          <input 
            type="number" 
            v-model.number="localItem.x1" 
            @change="handlePropertyChange('x1', localItem.x1)"
          >
        </div>
        
        <div class="property-group">
          <label>起点 Y:</label>
          <input 
            type="number" 
            v-model.number="localItem.y1" 
            @change="handlePropertyChange('y1', localItem.y1)"
          >
        </div>
        
        <div class="property-group">
          <label>终点 X:</label>
          <input 
            type="number" 
            v-model.number="localItem.x2" 
            @change="handlePropertyChange('x2', localItem.x2)"
          >
        </div>
        
        <div class="property-group">
          <label>终点 Y:</label>
          <input 
            type="number" 
            v-model.number="localItem.y2" 
            @change="handlePropertyChange('y2', localItem.y2)"
          >
        </div>
      </div>
      
      <!-- 文本属性 -->
      <div v-else-if="localItem.type === 'text'" class="type-properties">
        <div class="property-group">
          <label>位置 X:</label>
          <input 
            type="number" 
            v-model.number="localItem.x" 
            @change="handlePropertyChange('x', localItem.x)"
          >
        </div>
        
        <div class="property-group">
          <label>位置 Y:</label>
          <input 
            type="number" 
            v-model.number="localItem.y" 
            @change="handlePropertyChange('y', localItem.y)"
          >
        </div>
        
        <div class="property-group">
          <label>内容:</label>
          <input 
            type="text" 
            v-model="localItem.content" 
            @change="handlePropertyChange('content', localItem.content)"
          >
        </div>
        
        <div class="property-group">
          <label>字体大小:</label>
          <input 
            type="number" 
            v-model.number="localItem.fontSize" 
            @change="handlePropertyChange('fontSize', localItem.fontSize)"
            min="1"
          >
        </div>
        
        <div class="property-group">
          <label>字体:</label>
          <select 
            v-model="localItem.fontFamily" 
            @change="handlePropertyChange('fontFamily', localItem.fontFamily)"
          >
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Microsoft YaHei">微软雅黑</option>
            <option value="SimSun">宋体</option>
          </select>
        </div>
        
        <div class="property-group">
          <label>对齐方式:</label>
          <select 
            v-model="localItem.textAnchor" 
            @change="handlePropertyChange('textAnchor', localItem.textAnchor)"
          >
            <option value="start">左对齐</option>
            <option value="middle">居中</option>
            <option value="end">右对齐</option>
          </select>
        </div>
      </div>
      
      <!-- 图片属性 -->
      <div v-else-if="localItem.type === 'image'" class="type-properties">
        <div class="property-group">
          <label>位置 X:</label>
          <input 
            type="number" 
            v-model.number="localItem.x" 
            @change="handlePropertyChange('x', localItem.x)"
          >
        </div>
        
        <div class="property-group">
          <label>位置 Y:</label>
          <input 
            type="number" 
            v-model.number="localItem.y" 
            @change="handlePropertyChange('y', localItem.y)"
          >
        </div>
        
        <div class="property-group">
          <label>宽度:</label>
          <input 
            type="number" 
            v-model.number="localItem.width" 
            @change="handlePropertyChange('width', localItem.width)"
            min="1"
          >
        </div>
        
        <div class="property-group">
          <label>高度:</label>
          <input 
            type="number" 
            v-model.number="localItem.height" 
            @change="handlePropertyChange('height', localItem.height)"
            min="1"
          >
        </div>
        
        <div class="property-group">
          <label>图片源:</label>
          <div class="image-preview">
            <img :src="localItem.src" :alt="'图片'+localItem.id" v-if="localItem.src">
            <button @click="changeImage">更换图片</button>
            <input 
              type="file" 
              ref="imageInput" 
              accept="image/*" 
              style="display: none" 
              @change="handleImageChange"
            >
          </div>
        </div>
      </div>
      
      <!-- 公共属性 -->
      <div class="common-properties">
        <h4>通用属性</h4>
        
        <div class="property-group">
          <label>填充颜色:</label>
          <input 
            type="color" 
            v-model="localItem.fill" 
            @change="handlePropertyChange('fill', localItem.fill)"
            v-if="hasProperty(localItem, 'fill')"
          >
          <span v-else>无填充</span>
        </div>
        
        <div class="property-group">
          <label>边框颜色:</label>
          <input 
            type="color" 
            v-model="localItem.stroke" 
            @change="handlePropertyChange('stroke', localItem.stroke)"
            v-if="hasProperty(localItem, 'stroke')"
          >
          <span v-else>无边框</span>
        </div>
        
        <div class="property-group">
          <label>边框宽度:</label>
          <input 
            type="number" 
            v-model.number="localItem.strokeWidth" 
            @change="handlePropertyChange('strokeWidth', localItem.strokeWidth)"
            min="0"
            v-if="hasProperty(localItem, 'strokeWidth')"
          >
          <span v-else>无边框</span>
        </div>
        
        <div class="property-group">
          <label>透明度:</label>
          <input 
            type="range" 
            v-model.number="localItem.opacity" 
            min="0" 
            max="1" 
            step="0.1"
            @change="handlePropertyChange('opacity', localItem.opacity)"
          >
          <span>{{ localItem.opacity.toFixed(1) }}</span>
        </div>
      </div>
      
      <!-- 变量绑定 -->
      <div class="binding-section" v-if="bindableProperties.length > 0">
        <h4>变量绑定</h4>
        
        <div class="binding-group" v-for="prop in bindableProperties" :key="prop">
          <label>{{ getPropertyLabel(prop) }}:</label>
          <select 
            v-model="bindingVariables[prop]" 
            @change="updateBinding(prop, bindingVariables[prop])"
          >
            <option value="">无绑定</option>
            <option 
              v-for="variable in variables" 
              :key="variable.id" 
              :value="variable.id"
            >
              {{ variable.name }} (当前值: {{ variable.value }})
            </option>
          </select>
          
          <div v-if="localItem.bindings && localItem.bindings[prop]" class="transform-fn">
            <label>转换函数:</label>
            <input 
              type="text" 
              v-model="localItem.bindings[prop].transformFn" 
              placeholder="例如: value * 2"
              @change="updateBinding(prop, bindingVariables[prop])"
            >
            <span class="hint">可用参数: value, min, max</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-selection">
      <p>未选中任何对象或选中了多个对象</p>
      <p>请单选一个对象以编辑其属性</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: Object,
    variables: {
      type: Array,
      required: true
    }
  },
  
  data() {
    return {
      bindingVariables: {},
      localItem: null
    }
  },
  created() {
    this.$watch(
      () => this.item,
      (newVal) => {
        if (newVal) {
          // 仅当ID不同时才重新初始化
          if (!this.localItem || this.localItem.id !== newVal.id) {
            this.initLocalItem();
          }
        } else {
          this.localItem = null;
        }
      },
      { deep: true }
    );
  },
  computed: {
    bindableProperties() {
      if (!this.item) return []
      
      const commonProps = ['fill', 'stroke', 'opacity', 'rotation']
      const typeSpecificProps = {
        rectangle: ['x', 'y', 'width', 'height'],
        circle: ['cx', 'cy', 'r'],
        line: ['x1', 'y1', 'x2', 'y2'],
        text: ['x', 'y', 'content', 'fontSize'],
        image: ['x', 'y', 'width', 'height']
      }
      
      return [...commonProps, ...(typeSpecificProps[this.item.type] || [])]
        .filter(prop => this.hasProperty(this.item, prop))
    }
  },
  
  watch: {
    item: {
      immediate: true,
      deep: true,
      handler(newVal) {
        // console.log('属性面板接收到新项目:', newVal); // 调试
        this.localItem = newVal ? JSON.parse(JSON.stringify(newVal)) : null;
        
        if (newVal?.bindings) {
          this.bindingVariables = Object.keys(newVal.bindings).reduce((acc, prop) => {
            acc[prop] = newVal.bindings[prop].variableId;
            return acc;
          }, {});
        } else {
          this.bindingVariables = {};
        }
      }
    }
  },
  
  methods: {
    getTypeName(type) {
      const typeNames = {
        rectangle: '矩形',
        circle: '圆形',
        line: '线条',
        text: '文本',
        image: '图片'
      }
      return typeNames[type] || type
    },
    
    getPropertyLabel(prop) {
      const labels = {
        x: 'X位置',
        y: 'Y位置',
        cx: '中心X',
        cy: '中心Y',
        r: '半径',
        x1: '起点X',
        y1: '起点Y',
        x2: '终点X',
        y2: '终点Y',
        width: '宽度',
        height: '高度',
        content: '内容',
        fontSize: '字体大小',
        fontFamily: '字体',
        textAnchor: '对齐方式',
        fill: '填充色',
        stroke: '边框色',
        strokeWidth: '边框宽度',
        opacity: '透明度',
        rotation: '旋转角度'
      }
      return labels[prop] || prop
    },
    
    hasProperty(item, prop) {
      return prop in item
    },
    initLocalItem() {
      this.localItem = this.item ? JSON.parse(JSON.stringify(this.item)) : null;
      if (this.item?.bindings) {
        this.bindingVariables = Object.entries(this.item.bindings).reduce((acc, [prop, binding]) => {
          acc[prop] = binding.variableId;
          return acc;
        }, {});
      } else {
        this.bindingVariables = {};
      }
    },
    handlePropertyChange(prop, value) {
      // 直接同步到本地和父组件
      this.$set(this.localItem, prop, value);
      
      // 立即提交变更（无延迟）
      this.$emit('update-item', {
        id: this.localItem.id,
        [prop]: value
      });
      
      // 强制更新DOM
      this.$forceUpdate();
    },
    
    updateBinding(property, variableId) {
      if (!this.localItem) return
      
      // 确保有bindings对象
      if (!this.localItem.bindings) {
        this.localItem = { ...this.localItem, bindings: {} };
      }
      
      if (variableId) {
        // 更新或创建绑定
        const bindings = { ...this.localItem.bindings };
        if (!bindings[property]) {
          bindings[property] = { variableId, transformFn: '' };
        } else {
          bindings[property].variableId = variableId;
        }
        this.localItem = { ...this.localItem, bindings };
      } else {
        // 移除绑定
        const bindings = { ...this.localItem.bindings };
        delete bindings[property];
        this.localItem = { ...this.localItem, bindings };
      }
      
      // 通知父组件
      this.$emit('bind-variable', this.localItem.id, property, variableId, 
                this.localItem.bindings[property]?.transformFn);
    },
    
    changeImage() {
      this.$refs.imageInput.click()
    },
    
    handleImageChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.localItem.src = e.target.result;
        this.$emit('update-item', {
          id: this.localItem.id,
          src: e.target.result
        });
      };
      reader.readAsDataURL(file);
      event.target.value = ''; // 重置input
    }
  }
}
</script>

<style scoped>
.property-panel {
  width: 300px;
  padding: 15px;
  background: #f5f5f5;
  border-left: 1px solid #ddd;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

h3, h4 {
  margin: 0 0 15px 0;
  color: #333;
}

h4 {
  margin-bottom: 10px;
  font-size: 14px;
  color: #444;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.item-properties {
  margin-bottom: 20px;
}

.type-properties,
.common-properties,
.binding-section {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
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
  color: #666;
}

.property-group input[type="number"],
.property-group input[type="text"] {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.property-group input[type="color"] {
  width: 30px;
  height: 30px;
  padding: 2px;
  border: 1px solid #ccc;
}

.property-group input[type="range"] {
  flex: 1;
  margin-right: 5px;
}

.property-group select {
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 3px;
  min-width: 120px;
}

.no-selection {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

.image-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.image-preview img {
  max-width: 100%;
  max-height: 100px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
}

.image-preview button {
  padding: 4px 8px;
  font-size: 12px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
}

.binding-group {
  margin-bottom: 10px;
}

.binding-group label {
  display: block;
  font-size: 12px;
  margin-bottom: 3px;
  color: #666;
}

.binding-group select {
  width: 100%;
  padding: 4px;
  font-size: 12px;
  margin-bottom: 5px;
}

.transform-fn {
  margin-top: 5px;
}

.transform-fn input {
  width: 100%;
  padding: 4px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.hint {
  display: block;
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}
</style>