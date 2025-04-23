<template>
    <div class="toolbar">
      <div class="toolbar-group">
        <button @click="$emit('change-mode', mode === 'edit' ? 'run' : 'edit')">
          {{ mode === 'edit' ? '运行模式' : '编辑模式' }}
        </button>
      </div>
      
      <div class="toolbar-group" v-if="mode === 'edit'">
        <button @click="$emit('add-shape', 'rectangle')">矩形</button>
        <button @click="$emit('add-shape', 'circle')">圆形</button>
        <button @click="$emit('add-shape', 'line')">线条</button>
        <button @click="$emit('add-shape', 'text')">文本</button>
        <button @click="handleImageUpload">图片</button>
        <input 
          type="file" 
          ref="imageInput" 
          accept="image/*" 
          style="display: none" 
          @change="handleImageFile"
        >
      </div>
      
      <div class="toolbar-group" v-if="mode === 'edit'">
        <button @click="$emit('delete-selected')">删除</button>
        <button @click="$emit('undo')">撤销</button>
        <button @click="$emit('redo')">恢复</button>
        <button @click="$emit('select-all')">全选</button>
        <button @click="$emit('invert-selection')">反选</button>
      </div>
      
      <div class="toolbar-group">
        <button @click="$emit('save')">保存</button>
        <button @click="handleLoadClick">加载</button>
        <input 
          type="file" 
          ref="loadInput" 
          accept=".json" 
          style="display: none" 
          @change="$emit('load', $event)"
        >
      </div>
    </div>
  </template>
  
  <script>
  import { generateId } from '../utils/utils';  // 添加这行导入语句
  export default {
    props: {
      mode: {
        type: String,
        default: 'edit'
      }
    },
    
    methods: {
      handleImageUpload() {
        this.$refs.imageInput.click()
      },
      
      handleImageFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('选择了文件:', file.name); // 调试
        
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log('文件读取完成，准备发射事件'); // 调试
          this.$emit('add-image', {
            id: generateId(),
            src: e.target.result,
            type: 'image'
          });
        };
        reader.onerror = (error) => {
          console.error('图片加载失败:', error);
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // 重置input    
      },
      
      handleLoadClick() {
        this.$refs.loadInput.click()
      }
    }
  }
  </script>
  
  <style scoped>
  .toolbar {
    display: flex;
    padding: 8px;
    background: #f0f0f0;
    border-bottom: 1px solid #ddd;
    flex-wrap: wrap;
  }
  
  .toolbar-group {
    display: flex;
    margin-right: 16px;
  }
  
  .toolbar-group button {
    margin-right: 8px;
    padding: 4px 8px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .toolbar-group button:hover {
    background: #e6e6e6;
  }
  </style>