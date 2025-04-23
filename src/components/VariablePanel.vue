<template>
    <div class="variable-panel">
      <h3>变量管理</h3>
      
      <button @click="showAddVariableDialog = true">添加变量</button>
      <button @click="$emit('fetch-variables')">从API获取变量</button>
      
      <div class="variable-list">
        <div v-for="variable in variables" :key="variable.id" class="variable-item">
          <div class="variable-info">
            <strong>{{ variable.name }}</strong>
            <span>值: {{ variable.value }}</span>
            <span>范围: {{ variable.min }} ~ {{ variable.max }}</span>
          </div>
          
          <div class="variable-actions">
            <button @click="editVariable(variable)">编辑</button>
            <button @click="$emit('delete-variable', variable.id)">删除</button>
          </div>
        </div>
      </div>
      
      <!-- 添加/编辑变量对话框 -->
      <div v-if="showAddVariableDialog" class="dialog-overlay">
        <div class="dialog">
          <h3>{{ editingVariable ? '编辑变量' : '添加变量' }}</h3>
          
          <div class="form-group">
            <label>名称:</label>
            <input type="text" v-model="currentVariable.name">
          </div>
          
          <div class="form-group">
            <label>初始值:</label>
            <input type="number" v-model.number="currentVariable.value">
          </div>
          
          <div class="form-group">
            <label>最小值:</label>
            <input type="number" v-model.number="currentVariable.min">
          </div>
          
          <div class="form-group">
            <label>最大值:</label>
            <input type="number" v-model.number="currentVariable.max">
          </div>
          
          <div class="dialog-actions">
            <button @click="saveVariable">保存</button>
            <button @click="showAddVariableDialog = false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      variables: {
        type: Array,
        required: true
      }
    },
    
    data() {
      return {
        showAddVariableDialog: false,
        editingVariable: null,
        currentVariable: {
          name: '',
          value: 0,
          min: 0,
          max: 100
        }
      }
    },
    
    methods: {
      editVariable(variable) {
        this.editingVariable = variable
        this.currentVariable = { ...variable }
        this.showAddVariableDialog = true
      },
      
      saveVariable() {
        if (this.editingVariable) {
          // 更新现有变量
          this.$emit('update-variable', this.editingVariable.id, this.currentVariable)
        } else {
          // 添加新变量
          this.$emit('add-variable', { ...this.currentVariable })
        }
        
        this.showAddVariableDialog = false
        this.editingVariable = null
        this.currentVariable = {
          name: '',
          value: 0,
          min: 0,
          max: 100
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .variable-panel {
    width: 250px;
    padding: 10px;
    background: #f5f5f5;
    border-right: 1px solid #ddd;
    overflow-y: auto;
  }
  
  .variable-panel button {
    margin-bottom: 10px;
    padding: 4px 8px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .variable-panel button:hover {
    background: #e6e6e6;
  }
  
  .variable-list {
    margin-top: 10px;
  }
  
  .variable-item {
    padding: 8px;
    margin-bottom: 8px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .variable-info {
    margin-bottom: 5px;
  }
  
  .variable-info span {
    display: block;
    font-size: 12px;
    color: #666;
  }
  
  .variable-actions button {
    margin-right: 5px;
    padding: 2px 5px;
    font-size: 12px;
  }
  
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .dialog {
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
  }
  
  .form-group {
    margin-bottom: 10px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
  }
  
  .form-group input {
    width: 100%;
    padding: 5px;
  }
  
  .dialog-actions {
    margin-top: 15px;
    text-align: right;
  }
  
  .dialog-actions button {
    margin-left: 10px;
    padding: 5px 10px;
  }
  </style>