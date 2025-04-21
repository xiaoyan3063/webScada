<template>
    <div class="editor-container">
      <!-- 模式切换按钮 -->
      <!-- <div class="mode-switcher">
        <button @click="toggleMode" :class="{ 'active': !isEditMode }">
          {{ isEditMode ? '进入运行模式' : '返回编辑模式' }}
        </button>
      </div> -->
      
      <div 
        class="editor-canvas" 
        ref="canvas"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @click="handleCanvasClick"
        @dragover.prevent
        @drop="handleDrop"
        :class="{ 'edit-mode': isEditMode, 'run-mode': !isEditMode }"
      >
        <svg 
          width="100%"
          height="100%"
          viewBox="0 0 2000 2000"
          preserveAspectRatio="xMinYMin meet"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <!-- 网格背景 -->
          <pattern 
            id="grid" 
            width="20" 
            height="20" 
            patternUnits="userSpaceOnUse"
          >
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ddd" stroke-width="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          
          <!-- 绘制所有图形 -->
          <g v-for="item in canvasItems" :key="item.id">
            <component 
              v-if="registeredComponents.includes(item.type)"
              :is="item.type" 
              :item="item"
              :ref="`textComponents.${item.id}`"
              :selected="isEditMode && selectedItemId === item.id"
              :editable="isEditMode"
              @select="selectItem"
              @startDrag="startDrag"
              @startConnection="handleStartConnection"
            />
            <g v-else-if="isEditMode" class="invalid-component">
                <rect 
                    :x="item.x" :y="item.y"
                    width="80" height="40"
                    fill="#ffeb3b"
                    stroke="#f44336"
                />
                <text 
                    :x="item.x + 40" :y="item.y + 25"
                    text-anchor="middle"
                    fill="#f44336"
                >
                    Invalid: {{ item.type }}
                </text>
            </g>
          </g>
          
          <!-- 连接线 -->
          <g v-for="conn in connections" :key="conn.id">
            <path 
              :d="conn.path" 
              :stroke="conn.color || '#3498db'" 
              :stroke-width="conn.width || 2" 
              fill="none"
              marker-end="url(#arrowhead)"
            />
          </g>
          
          <!-- 临时连接线预览 -->
          <path 
            v-if="isEditMode && tempConnection" 
            :d="tempConnection.path" 
            stroke="#3498db" 
            stroke-width="2" 
            stroke-dasharray="5,5"
            fill="none"
          />
          
          <!-- 箭头标记 -->
          <defs>
            <marker 
              id="arrowhead" 
              markerWidth="10" 
              markerHeight="7" 
              refX="9" 
              refY="3.5" 
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3498db"/>
            </marker>
          </defs>
        </svg>
      </div>
      <ImageSelector
            v-if="showImageSelector"
            :images="availableImages"
            @select="handleImageSelect"
            @close="showImageSelector = false"
      />
    </div>
  </template>
  
  <script>
  import { mapState, mapActions, mapGetters } from 'vuex'
  import { createConnectionPath } from '../utils/connection'
  import ImageSelector from './ImageSelector.vue'
  import { 
    ScadaRectangle, 
    ScadaCircle, 
    ScadaTriangle, 
    ScadaValve, 
    ScadaPump, 
    ScadaTank,
    ScadaText,
    ScadaImage 
  } from '../assets/shapes'
  
  export default {
    components: {
      ScadaRectangle,
      ScadaCircle,
      ScadaTriangle,
      ScadaValve,
      ScadaPump,
      ScadaTank,
      ScadaText,
      ScadaImage,
      ImageSelector
    },
    data() {
      return {
        canvasWidth: 2000,
        canvasHeight: 2000,
        isDrawing: false,
        isDragging: false,
        currentTool: null,
        dragStartPos: null,
        connectionStart: null,
        tempConnection: null,
        draggedItemId: null,
        dragOffset: { x: 0, y: 0 },
        showImageSelector: false,
        pendingImageItem: null
      }
    },
    computed: {
      ...mapState('editor', [
        'canvasItems',
        'selectedItemId',
        'connections',
        'isEditMode'
      ]),
      ...mapState('animation', [
        'animations'
      ]),
      ...mapGetters('editor', [
        'getSelectedItem'
      ]),
      registeredComponents() {
        return Object.keys(this.$options.components)
      },
      selectedItem() {
        return this.getSelectedItem
      },
      availableImages() {
        return this.$store.state.editor.availableImages
      }
    },
    mounted() {
        window.addEventListener('keydown', this.handleKeyDown)
        this.$store.dispatch('editor/loadAvailableImages')
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyDown)
    },
    methods: {
      ...mapActions('editor', [
        'addItem',
        'selectItem',
        'updateItem',
        'moveItem',
        'addConnection',
        'deleteItem',
        'toggleEditMode',
        'saveCanvasState'
      ]),
      
    //   toggleMode() {
    //     if (this.isEditMode) {
    //       // 切换到运行模式前保存当前状态
    //       this.saveCanvasState()
    //     }
    //     this.toggleEditMode()
    //   },
      handleKeyDown(e) {
        if (!this.isEditMode) return
        
        // 删除键
        if (e.key === 'Delete' && this.selectedItemId) {
            this.$store.dispatch('editor/deleteSelectedItem')
        }
        
        // Ctrl+Z 撤销
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault()
            this.$store.commit('editor/UNDO')
        }
        
        // Ctrl+Shift+Z 或 Ctrl+Y 恢复
        if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
            e.preventDefault()
            this.$store.commit('editor/REDO')
        }
      },
      handleMouseDown(e) {
        if (!this.isEditMode) return
        
        const pos = this.getCanvasPosition(e)
        
        if (this.currentTool === 'connection') {
          const item = this.findItemAtPosition(pos)
          if (item && item.hasConnectionPoints) {
            this.connectionStart = { 
              itemId: item.id, 
              pos,
              pointIndex: this.findClosestConnectionPoint(item, pos)
            }
          }
        } else if (this.currentTool) {
          // 创建新图形
          this.isDrawing = true
          this.dragStartPos = pos
          
          const newItem = {
            id: Date.now().toString(),
            type: this.currentTool,
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            rotation: 0,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 1,
            zIndex: this.canvasItems.length,
            text: '',
            fontSize: 12,
            fontColor: '#000000',
            hasConnectionPoints: ['ScadaValve', 'ScadaPump', 'ScadaTank'].includes(this.currentTool)
          }
          
          this.addItem(newItem)
          this.selectItem(newItem.id)
        } else {
          // 选择或拖动现有项目
          const item = this.findItemAtPosition(pos)
          if (item) {
            this.selectItem(item.id)
            this.startDrag(item.id, pos)
          } else {
            this.selectItem(null)
          }
        }
  
        // 双击文本进入编辑
        if (this.selectedItem && this.selectedItem.type === 'ScadaText' && e.detail === 2) {
          this.$refs[`textComponents.${this.selectedItem.id}`][0].startEdit()
        }
      },
      
      handleMouseMove(e) {
        if (!this.isEditMode) return
        
        const pos = this.getCanvasPosition(e)
        
        if (this.isDrawing && this.selectedItemId) {
          // 调整新图形大小
          const item = this.canvasItems.find(i => i.id === this.selectedItemId)
          if (item) {
            const width = pos.x - this.dragStartPos.x
            const height = pos.y - this.dragStartPos.y
            
            this.updateItem({
              id: item.id,
              x: width < 0 ? pos.x : item.x,
              y: height < 0 ? pos.y : item.y,
              width: Math.abs(width),
              height: Math.abs(height)
            })
          }
        } else if (this.isDragging && this.draggedItemId) {
          // 拖动现有图形
          const item = this.canvasItems.find(i => i.id === this.draggedItemId)
          if (item) {
            this.moveItem({
              id: item.id,
              x: pos.x - this.dragOffset.x,
              y: pos.y - this.dragOffset.y
            })
          }
        } else if (this.connectionStart) {
          // 绘制临时连接线
          const startItem = this.canvasItems.find(i => i.id === this.connectionStart.itemId)
          if (startItem) {
            this.tempConnection = {
              path: createConnectionPath(
                startItem, 
                { 
                  x: pos.x, 
                  y: pos.y,
                  width: 0,
                  height: 0
                },
                this.connectionStart.pointIndex,
                0
              )
            }
          }
        }
      },
      
      handleMouseUp(e) {
        if (!this.isEditMode) return
        
        const pos = this.getCanvasPosition(e)
        
        if (this.connectionStart) {
          const endItem = this.findItemAtPosition(pos)
          if (endItem && endItem.hasConnectionPoints && endItem.id !== this.connectionStart.itemId) {
            const startItem = this.canvasItems.find(i => i.id === this.connectionStart.itemId)
            
            const newConnection = {
              id: Date.now().toString(),
              start: {
                itemId: startItem.id,
                pointIndex: this.connectionStart.pointIndex
              },
              end: {
                itemId: endItem.id,
                pointIndex: this.findClosestConnectionPoint(endItem, pos)
              },
              path: createConnectionPath(startItem, endItem)
            }
            
            this.addConnection(newConnection)
          }
          this.connectionStart = null
          this.tempConnection = null
        }
        
        this.isDrawing = false
        this.isDragging = false
        this.dragStartPos = null
        this.draggedItemId = null
      },
      
      handleDrop(e) {
        if (!this.isEditMode) return
    
        e.preventDefault()
        
        let data
        try {
            data = JSON.parse(e.dataTransfer.getData('application/json'))
            if (!data.type) throw new Error('Invalid data')
        } catch (err) {
            console.error('拖拽数据无效:', err)
            return
        }

        const svg = this.$el.querySelector('svg')
        const pt = svg.createSVGPoint()
        pt.x = e.clientX
        pt.y = e.clientY
        const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse())

        if (data.type === 'ScadaImage') {
            // 直接创建图片项，不再使用pendingImageItem
            this.$store.dispatch('editor/addItem', {
                id: `img-${Date.now()}`,
                type: 'ScadaImage',
                x: cursorPt.x,
                y: cursorPt.y,
                width: 100,
                height: 100,
                src: '/images/default.png', // 默认图片
                keepAspectRatio: true,
                visible: true
            })
            
            // 仍然显示图片选择器让用户更换图片
            this.showImageSelector = true
        } else {
            this.createNewItem(data.type, cursorPt, data)
        }
      },
      createNewItem(type, position, data = {}) {
        const baseItem = {
            id: `item-${Date.now()}`,
            type: type,
            x: position.x,
            y: position.y,
            visible: true
        }

        const typeSpecificProps = {
            ScadaText: {
                width: 120,
                height: 40,
                content: '双击编辑',
                fontSize: 14,
                fontColor: '#000000',
                backgroundColor: 'rgba(240,240,240,0.7)'
            },
            default: {
                width: data.width || 100,
                height: data.height || 80,
                fill: data.fill || '#3a7bd5',
                stroke: data.stroke || '#2c3e50',
                strokeWidth: 2
            }
        }

        const newItem = {
            ...baseItem,
            ...(typeSpecificProps[type] || typeSpecificProps.default)
        }

        this.addItem(newItem)
      },
        
      handleImageSelect(image) {
        const imgItem = {
            id: `img-${Date.now()}`,
            type: 'ScadaImage',
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            src: image.src,
            keepAspectRatio: true
            }
            
            // 预加载图片
            const img = new Image()
            img.onload = () => {
            console.log('图片预加载成功，添加到画布')
            this.$store.dispatch('editor/addItem', imgItem)
            
            // 强制更新视图
            this.$nextTick(() => {
                const svgImage = this.$el.querySelector(`[id="${imgItem.id}"] image`)
                if(svgImage) {
                svgImage.setAttribute('href', `${image.src}?t=${Date.now()}`)
                }
            })
            }
            img.onerror = () => console.error('图片预加载失败')
            img.src = image.src
      },
      startDrag(itemId, startPos) {
        if (!this.isEditMode) return
        
        const item = this.canvasItems.find(i => i.id === itemId)
        if (item) {
          this.isDragging = true
          this.draggedItemId = itemId
          this.dragOffset = {
            x: startPos.x - item.x,
            y: startPos.y - item.y
          }
        }
      },
      
      handleStartConnection(itemId, pointIndex) {
        if (!this.isEditMode) return
        
        const item = this.canvasItems.find(i => i.id === itemId)
        if (item) {
          this.connectionStart = {
            itemId,
            pointIndex,
            pos: this.getConnectionPointPosition(item, pointIndex)
          }
        }
      },
      
      getCanvasPosition(e) {
        const svg = this.$el.querySelector('svg')
        const pt = svg.createSVGPoint()
        pt.x = e.clientX
        pt.y = e.clientY
        return pt.matrixTransform(svg.getScreenCTM().inverse())
      },
      
      findItemAtPosition(pos) {
        const items = [...this.canvasItems].sort((a, b) => b.zIndex - a.zIndex)
        return items.find(item => this.isPointInItem(pos, item))
      },
      
      isPointInItem(pos, item) {
        if (!item.visible) return false
        
        // 简化的边界框检测
        return pos.x >= item.x && 
               pos.x <= item.x + item.width && 
               pos.y >= item.y && 
               pos.y <= item.y + item.height
      },
      
      findClosestConnectionPoint(item, pos) {
        if (!item.hasConnectionPoints) return 0
        
        const points = this.getConnectionPoints(item)
        let closestIndex = 0
        let minDistance = Infinity
        
        points.forEach((point, index) => {
          const dx = point.x - pos.x
          const dy = point.y - pos.y
          const distance = dx * dx + dy * dy
          
          if (distance < minDistance) {
            minDistance = distance
            closestIndex = index
          }
        })
        
        return closestIndex
      },
      
      getConnectionPoints(item) {
        const points = []
        if (item.hasConnectionPoints) {
          // 标准连接点位置
          points.push({ x: item.x, y: item.y + item.height/2 }) // 左
          points.push({ x: item.x + item.width, y: item.y + item.height/2 }) // 右
          points.push({ x: item.x + item.width/2, y: item.y }) // 上
          points.push({ x: item.x + item.width/2, y: item.y + item.height }) // 下
        }
        return points
      },
      
      getConnectionPointPosition(item, pointIndex) {
        const points = this.getConnectionPoints(item)
        return points[pointIndex] || { x: item.x + item.width/2, y: item.y + item.height/2 }
      },
      
      handleCanvasClick(e) {
        if (!this.isEditMode) return
        
        if (!this.currentTool && !this.selectedItemId) {
          this.selectItem(null)
        }
        if (this.selectedItem && this.selectedItem.type === 'ScadaText') {
          this.$refs[`textComponents.${this.selectedItem.id}`][0]?.endEdit()
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .editor-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: #f0f0f0;
  }
  
  .editor-canvas {
    width: 2000px;
    height: 2000px;
    background-color: #f9f9f9;
    position: relative;
  }
  
  /* 模式切换按钮 */
  .mode-switcher {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
  }
  
  .mode-switcher button {
    padding: 8px 16px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
  }
  
  .mode-switcher button:hover {
    background-color: #e0e0e0;
  }
  
  .mode-switcher button.active {
    background-color: #4CAF50;
    color: white;
    border-color: #388E3C;
  }
  
  /* 编辑模式和运行模式样式 */
  .edit-mode {
    cursor: default;
  }
  
  .run-mode {
    cursor: default;
  }
  
  .run-mode .shape-element {
    cursor: pointer;
  }
  
  /* SVG元素样式 */
  svg {
    display: block;
    overflow: visible;
    background-color: rgba(200,200,200,0.1);
  }
  
  /* 无效组件样式 */
  .invalid-component {
    pointer-events: none;
  }
  
  /* 调试样式 */
  .debug-outline * {
    outline: 1px solid rgba(255,0,0,0.3);
  }
  svg image {
    display: inline !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  </style>