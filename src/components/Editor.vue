<template>
    <div class="editor-container">
      <Toolbar 
        :mode="mode"
        @change-mode="changeMode"
        @add-shape="addShape"
        @delete-selected="deleteSelected"
        @undo="undo"
        @redo="redo"
        @select-all="selectAll"
        @invert-selection="invertSelection"
        @save="saveCanvas"
        @load="loadCanvas"
      />
      
      <div class="editor-content">
        <VariablePanel 
          v-if="mode === 'edit'"
          :variables="variables"
          @add-variable="addVariable"
          @update-variable="updateVariable"
          @delete-variable="deleteVariable"
          @fetch-variables="fetchVariables"
        />
        
        <div 
          class="canvas-container"
          ref="canvasContainer"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
        >
          <svg class="canvas" :width="canvasWidth" :height="canvasHeight">
            <!-- 网格背景 -->
            <pattern 
              id="grid" 
              width="20" 
              height="20" 
              patternUnits="userSpaceOnUse"
            >
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" stroke-width="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- 选择框 -->
            <rect 
              v-if="isSelecting"
              :x="Math.min(selectionStart.x, currentMousePos.x)"
              :y="Math.min(selectionStart.y, currentMousePos.y)"
              :width="Math.abs(currentMousePos.x - selectionStart.x)"
              :height="Math.abs(currentMousePos.y - selectionStart.y)"
              fill="rgba(0, 120, 215, 0.1)"
              stroke="rgba(0, 120, 215, 0.8)"
              stroke-width="1"
            />
            
            <!-- 图形元素 -->
            <g v-for="item in items" :key="item.id">
              <rect 
                v-if="item.type === 'rectangle'"
                :x="item.x"
                :y="item.y"
                :width="item.width"
                :height="item.height"
                :fill="item.fill"
                :stroke="item.stroke"
                :stroke-width="item.strokeWidth"
                :opacity="item.opacity"
                :transform="`rotate(${item.rotation}, ${item.x + item.width/2}, ${item.y + item.height/2})`"
                @mousedown.stop="handleItemMouseDown($event, item)"
                :class="{ 'selected': selectedItems.includes(item.id) }"
              />
              
              <circle 
                v-if="item.type === 'circle'"
                :cx="item.cx"
                :cy="item.cy"
                :r="item.r"
                :fill="item.fill"
                :stroke="item.stroke"
                :stroke-width="item.strokeWidth"
                :opacity="item.opacity"
                @mousedown.stop="handleItemMouseDown($event, item)"
                :class="{ 'selected': selectedItems.includes(item.id) }"
              />
              
              <line 
                v-if="item.type === 'line'"
                :x1="item.x1"
                :y1="item.y1"
                :x2="item.x2"
                :y2="item.y2"
                :stroke="item.stroke"
                :stroke-width="item.strokeWidth"
                :opacity="item.opacity"
                @mousedown.stop="handleItemMouseDown($event, item)"
                :class="{ 'selected': selectedItems.includes(item.id) }"
              />
              
              <text 
                v-if="item.type === 'text'"
                :x="item.x"
                :y="item.y"
                :fill="item.fill"
                :font-size="item.fontSize"
                :font-family="item.fontFamily"
                :text-anchor="item.textAnchor"
                :opacity="item.opacity"
                @mousedown.stop="handleItemMouseDown($event, item)"
                :class="{ 'selected': selectedItems.includes(item.id) }"
              >{{ item.content }}</text>
              
              <image 
                v-if="item.type === 'image'"
                :x="item.x"
                :y="item.y"
                :width="item.width"
                :height="item.height"
                :opacity="item.opacity"
                :href="item.src"
                @mousedown.stop="handleItemMouseDown($event, item)"
                :class="{ 'selected': selectedItems.includes(item.id) }"
              />
            </g>
          </svg>
        </div>
        
        <PropertyPanel 
          v-if="mode === 'edit' && selectedItems.length > 0"
          :items="items"
          :selected-items="selectedItems"
          :variables="variables"
          @update-item="updateItem"
          @bind-variable="bindVariable"
        />
      </div>
    </div>
  </template>
  
  <script>
  import Toolbar from './Toolbar.vue'
  import PropertyPanel from './PropertyPanel.vue'
  import VariablePanel from './VariablePanel.vue'
  import History from '../utils/history'
  import { serialize, deserialize } from '../utils/serializer'
  import { generateId } from '../utils/utils'
  
  export default {
    components: {
      Toolbar,
      PropertyPanel,
      VariablePanel
    },
    
    data() {
      return {
        mode: 'edit', // 'edit' or 'run'
        items: [],
        selectedItems: [],
        variables: [],
        canvasWidth: 2000,
        canvasHeight: 2000,
        isDragging: false,
        dragStartPos: { x: 0, y: 0 },
        isSelecting: false,
        selectionStart: { x: 0, y: 0 },
        currentMousePos: { x: 0, y: 0 },
        history: new History(),
        animationFrame: null,
        lastUpdateTime: 0
      }
    },
    
    created() {
      // 初始化一些示例变量
      this.variables = [
        { id: 'var1', name: '温度', value: 25, min: 0, max: 100 },
        { id: 'var2', name: '压力', value: 1.2, min: 0, max: 10 },
        { id: 'var3', name: '液位', value: 50, min: 0, max: 100 }
      ]
      
      // 启动动画循环
      this.animationLoop()
    },
    
    beforeDestroy() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }
    },
    
    methods: {
      // 模式切换
      changeMode(mode) {
        this.mode = mode
        this.selectedItems = [] // 切换到运行模式时清空选择
      },
      
      // 添加形状
      addShape(type) {
        const newItem = {
          id: generateId(),
          type,
          x: 100,
          y: 100,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 1,
          opacity: 1,
          rotation: 0,
          bindings: {}
        }
        
        // 设置默认属性
        switch (type) {
          case 'rectangle':
            newItem.width = 100
            newItem.height = 60
            break
          case 'circle':
            newItem.cx = 150
            newItem.cy = 150
            newItem.r = 50
            break
          case 'line':
            newItem.x1 = 200
            newItem.y1 = 200
            newItem.x2 = 300
            newItem.y2 = 300
            break
          case 'text':
            newItem.content = '文本'
            newItem.fontSize = 16
            newItem.fontFamily = 'Arial'
            newItem.textAnchor = 'start'
            break
          case 'image':
            newItem.src = 'https://via.placeholder.com/100'
            newItem.width = 100
            newItem.height = 100
            break
        }
        
        this.items.push(newItem)
        this.selectItem(newItem.id, false)
        this.history.push(this.items)
      },
      
      // 添加外部图片
      addExternalImage(file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newItem = {
            id: generateId(),
            type: 'image',
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            src: e.target.result,
            opacity: 1,
            bindings: {}
          }
          this.items.push(newItem)
          this.selectItem(newItem.id, false)
          this.history.push(this.items)
        }
        reader.readAsDataURL(file)
      },
      
      // 选择项目
      selectItem(id, isMultiSelect = false) {
        if (this.mode !== 'edit') return
        
        if (!isMultiSelect || !event.ctrlKey) {
          this.selectedItems = [id]
        } else if (!this.selectedItems.includes(id)) {
          this.selectedItems.push(id)
        } else {
          this.selectedItems = this.selectedItems.filter(itemId => itemId !== id)
        }
      },
      
      // 删除选中项
      deleteSelected() {
        if (this.mode !== 'edit') return
        
        this.items = this.items.filter(item => !this.selectedItems.includes(item.id))
        this.selectedItems = []
        this.history.push(this.items)
      },
      
      // 撤销
      undo() {
        if (this.mode !== 'edit') return
        
        const prevState = this.history.undo()
        if (prevState) {
          this.items = JSON.parse(JSON.stringify(prevState))
        }
      },
      
      // 恢复
      redo() {
        if (this.mode !== 'edit') return
        
        const nextState = this.history.redo()
        if (nextState) {
          this.items = JSON.parse(JSON.stringify(nextState))
        }
      },
      
      // 全选
      selectAll() {
        if (this.mode !== 'edit') return
        
        this.selectedItems = this.items.map(item => item.id)
      },
      
      // 反选
      invertSelection() {
        if (this.mode !== 'edit') return
        
        const allIds = this.items.map(item => item.id)
        this.selectedItems = allIds.filter(id => !this.selectedItems.includes(id))
      },
      
      // 更新项目属性
      updateItem(updates) {
        if (this.mode !== 'edit') return
        
        this.items = this.items.map(item => {
          if (this.selectedItems.includes(item.id)) {
            return { ...item, ...updates }
          }
          return item
        })
        this.history.push(this.items)
      },
      
      // 绑定变量
      bindVariable(itemId, property, variableId, transformFn = null) {
        const item = this.items.find(i => i.id === itemId)
        if (item) {
          if (!item.bindings) item.bindings = {}
          item.bindings[property] = { variableId, transformFn }
        }
      },
      
      // 添加变量
      addVariable(variable) {
        this.variables.push({
          id: generateId(),
          ...variable
        })
      },
      
      // 更新变量
      updateVariable(id, updates) {
        this.variables = this.variables.map(v => 
          v.id === id ? { ...v, ...updates } : v
        )
      },
      
      // 删除变量
      deleteVariable(id) {
        this.variables = this.variables.filter(v => v.id !== id)
        
        // 移除相关绑定
        this.items.forEach(item => {
          if (item.bindings) {
            Object.keys(item.bindings).forEach(prop => {
              if (item.bindings[prop].variableId === id) {
                delete item.bindings[prop]
              }
            })
          }
        })
      },
      
      // 从API获取变量
      async fetchVariables() {
        // 模拟API调用
        try {
          // 这里应该是实际的API调用
          // const response = await fetch('/api/variables')
          // const data = await response.json()
          
          // 模拟数据
          const data = [
            { id: 'api-var1', name: 'API温度', value: 30, min: -20, max: 100 },
            { id: 'api-var2', name: 'API流量', value: 2.5, min: 0, max: 10 }
          ]
          
          this.variables = [...this.variables, ...data]
        } catch (error) {
          console.error('Failed to fetch variables:', error)
        }
      },
      
      // 保存画布
      saveCanvas() {
        const data = serialize(this.items, this.variables)
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'canvas-config.json'
        a.click()
        URL.revokeObjectURL(url)
      },
      
      // 加载画布
      loadCanvas(event) {
        const file = event.target.files[0]
        if (!file) return
        
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result)
            const { items, variables } = deserialize(data)
            this.items = items
            this.variables = variables
            this.history.push(this.items)
          } catch (error) {
            console.error('Failed to parse file:', error)
            alert('文件解析失败，请检查文件格式')
          }
        }
        reader.readAsText(file)
      },
      
      // 画布鼠标事件
      handleCanvasMouseDown(event) {
        if (this.mode !== 'edit') return
        
        const rect = this.$refs.canvasContainer.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        this.currentMousePos = { x, y }
        
        // 如果没有点击到任何项目，开始框选
        if (event.target.tagName === 'svg' || event.target.tagName === 'rect' && event.target.getAttribute('fill') === 'url(#grid)') {
          this.isSelecting = true
          this.selectionStart = { x, y }
          if (!event.ctrlKey) {
            this.selectedItems = []
          }
        }
      },
      
      handleCanvasMouseMove(event) {
        const rect = this.$refs.canvasContainer.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        this.currentMousePos = { x, y }
        
        if (this.isDragging && this.selectedItems.length > 0) {
          const dx = x - this.dragStartPos.x
          const dy = y - this.dragStartPos.y
          
          this.items = this.items.map(item => {
            if (this.selectedItems.includes(item.id)) {
              if (item.type === 'circle') {
                return { ...item, cx: item.cx + dx, cy: item.cy + dy }
              } else if (item.type === 'line') {
                return { 
                  ...item, 
                  x1: item.x1 + dx, 
                  y1: item.y1 + dy,
                  x2: item.x2 + dx,
                  y2: item.y2 + dy
                }
              } else {
                return { ...item, x: item.x + dx, y: item.y + dy }
              }
            }
            return item
          })
          
          this.dragStartPos = { x, y }
        }
      },
      
      handleCanvasMouseUp() {
        if (this.isSelecting) {
          // 框选结束，选择框内的项目
          const minX = Math.min(this.selectionStart.x, this.currentMousePos.x)
          const maxX = Math.max(this.selectionStart.x, this.currentMousePos.x)
          const minY = Math.min(this.selectionStart.y, this.currentMousePos.y)
          const maxY = Math.max(this.selectionStart.y, this.currentMousePos.y)
          
          this.items.forEach(item => {
            let isInside = false
            
            if (item.type === 'rectangle') {
              isInside = item.x < maxX && 
                        item.x + item.width > minX && 
                        item.y < maxY && 
                        item.y + item.height > minY
            } else if (item.type === 'circle') {
              // 简化的圆选择检测
              isInside = item.cx > minX && 
                        item.cx < maxX && 
                        item.cy > minY && 
                        item.cy < maxY
            } else if (item.type === 'line') {
              // 简化的线选择检测
              isInside = (item.x1 > minX && item.x1 < maxX && item.y1 > minY && item.y1 < maxY) ||
                        (item.x2 > minX && item.x2 < maxX && item.y2 > minY && item.y2 < maxY)
            } else if (item.type === 'text' || item.type === 'image') {
              // 简化的文本和图片选择检测
              isInside = item.x > minX && 
                        item.x < maxX && 
                        item.y > minY && 
                        item.y < maxY
            }
            
            if (isInside && !this.selectedItems.includes(item.id)) {
              this.selectedItems.push(item.id)
            }
          })
          
          this.isSelecting = false
          this.history.push(this.items)
        }
        
        this.isDragging = false
      },
      
      // 项目鼠标事件
      handleItemMouseDown(event, item) {
        if (this.mode !== 'edit') return
        
        const rect = this.$refs.canvasContainer.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        this.dragStartPos = { x, y }
        this.isDragging = true
        
        this.selectItem(item.id, event.ctrlKey || event.metaKey)
      },
      
      // 动画循环
      animationLoop(timestamp) {
        // 限制更新频率
        if (timestamp - this.lastUpdateTime > 100) {
          this.updateBindings()
          this.lastUpdateTime = timestamp
        }
        
        this.animationFrame = requestAnimationFrame(this.animationLoop)
      },
      
      // 更新绑定变量
      updateBindings() {
        this.items = this.items.map(item => {
          if (!item.bindings) return item
          
          const updatedItem = { ...item }
          
          Object.keys(item.bindings).forEach(property => {
            const binding = item.bindings[property]
            const variable = this.variables.find(v => v.id === binding.variableId)
            
            if (variable) {
              let value = variable.value
              
              // 应用转换函数
              if (binding.transformFn) {
                try {
                  // 安全地执行转换函数
                  const fn = new Function('value', 'min', 'max', `return ${binding.transformFn}`)
                  value = fn(value, variable.min, variable.max)
                } catch (e) {
                  console.error('Error executing transform function:', e)
                }
              }
              
              // 更新属性
              updatedItem[property] = value
            }
          })
          
          return updatedItem
        })
      }
    }
  }
  </script>
  
  <style scoped>
  .editor-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }
  
  .editor-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .canvas-container {
    flex: 1;
    overflow: auto;
    background-color: #f5f5f5;
  }
  
  .canvas {
    display: block;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .selected {
    outline: 2px dashed #0078d7;
    outline-offset: 2px;
  }
  </style>