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
        @add-image="addImage"
      />
      
      <div class="editor-content">
        <VariablePanel 
          v-if="mode === 'edit'"
          :variables="variables"
          @add-variable="addVariable"
          @update-variable="updateVariable"
          @delete-variable="deleteVariable"
          @fetch-variables="fetchVariables"
          style="user-select: none;"
        />
        
        <div 
          class="canvas-container"
          ref="canvasContainer"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          style="user-select: none;"
        >
          <svg class="canvas" :width="canvasWidth" :height="canvasHeight" pointer-events="bounding-box">
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
              <!-- 添加调整大小的控制点 -->
              <rect 
                v-if="selectedItems.includes(item.id) && item.type === 'rectangle'"
                class="resize-handle"
                :x="item.x + item.width - 4"
                :y="item.y + item.height - 4"
                width="8"
                height="8"
                fill="#0078d7"
                @mousedown.stop="handleResizeMouseDown($event, item, 'bottom-right')"
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
              <!-- 圆形调整大小的控制点 -->
              <circle 
                v-if="selectedItems.includes(item.id) && item.type === 'circle'"
                class="resize-handle"
                :cx="item.cx + item.r * Math.cos(Math.PI/4)"
                :cy="item.cy + item.r * Math.sin(Math.PI/4)"
                r="4"
                fill="#0078d7"
                @mousedown.stop="handleResizeMouseDown($event, item, 'radius')"
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
              <!-- 线条起点控制点 -->
                <circle 
                  v-if="selectedItems.includes(item.id) && item.type === 'line'"
                  class="resize-handle line-handle"
                  :cx="item.x1"
                  :cy="item.y1"
                  r="4"
                  fill="#0078d7"
                  @mousedown.stop="handleResizeMouseDown($event, item, 'line-start')"
                />
                <!-- 线条终点控制点 -->
                <circle 
                  v-if="selectedItems.includes(item.id) && item.type === 'line'"
                  class="resize-handle line-handle"
                  :cx="item.x2"
                  :cy="item.y2"
                  r="4"
                  fill="#0078d7"
                  @mousedown.stop="handleResizeMouseDown($event, item, 'line-end')"
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
              <rect 
                v-if="selectedItems.includes(item.id) && item.type === 'image'"
                class="resize-handle"
                :x="item.x + item.width - 4"
                :y="item.y + item.height - 4"
                width="8"
                height="8"
                fill="#0078d7"
                @mousedown.stop="handleResizeMouseDown($event, item, 'bottom-right')"
              />
            </g>
          </svg>
        </div>
        
        <PropertyPanel 
          v-if="mode === 'edit' && selectedItem"
          :item="selectedItem"
          :variables="variables"
          @update-item="updateSingleItem"
          @bind-variable="bindVariable"
          style="user-select: none;"
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
        lastUpdateTime: 0,
        initialItemState: [], // 用于存储拖动前的状态
        resizeHandle: null, // 记录调整大小的控制点
        isManualDragging: false,
        pendingUpdates: new Map(), // 用于暂存未提交的修改
        updateLock: false,
        isUpdating: false,          // 防止更新循环
        lastDragPosition: null,     // 记录最后有效拖拽位置
        validSelection: null,       // 有效选中状态
        animationEnabled: false, // 默认禁用动画
        dragState: {
          active: false,
          startX: 0,
          startY: 0,
          items: []  // 保存拖拽开始时选中项的状态
        },
        isResizing: false,
        resizeItem: null,
        resizeType: null, // 'bottom-right', 'radius' 等
        initialItemState1: null,
        keyPressState: {
          arrowUp: false,
          arrowDown: false,
          arrowLeft: false,
          arrowRight: false,
          shiftKey: false
        },
        moveStep: 1, // 默认移动步长
        keyPressTimer: null
      }
    },
    computed: {
      selectedItem() {
        return this.selectedItems.length === 1 
          ? this.items.find(item => item.id === this.selectedItems[0])
          : null;
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
      this.controlledAnimationLoop();
  
      // 初始化拖拽状态
      this.dragState = null;
    },
    mounted() {
      // 添加键盘事件监听
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    },
    
    beforeDestroy() {
      this.clearDragState();
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }
      // 确保移除所有事件监听
      window.removeEventListener('mousemove', this.handleRealDragMove);
      window.removeEventListener('mouseup', this.handleRealDragEnd);
      // 移除键盘事件监听
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      this.stopContinuousMove();
    },
    
    methods: {
      clearDragState() {
        if (this.dragState.active) {
          window.removeEventListener('mousemove', this.handleRealDragMove);
          window.removeEventListener('mouseup', this.handleRealDragEnd);
        }
        this.dragState = {
          active: false,
          startX: 0,
          startY: 0,
          items: []
        };
      },
      // 键盘事件处理
      handleKeyDown(event) {
        if (this.mode !== 'edit') return;
      
        const ctrlKey = event.ctrlKey || event.metaKey;
        
        // 处理组合键
        if (ctrlKey) {
          switch (event.key.toLowerCase()) {
            case 'a': this.selectAll(); break;
            case 'c': this.copySelected(); break;
            case 'v': this.pasteItems(); break;
            case 's': this.saveCanvas(); break;
          }
          return;
        }
        
        // 处理删除键
        if (event.key === 'Delete') {
          this.deleteSelected();
          return;
        }
        
        // 处理方向键
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'].includes(event.key)) {
          event.preventDefault();
          
          // 更新按键状态
          this.keyPressState.shiftKey = event.shiftKey;
          this.moveStep = event.shiftKey ? 10 : 1; // Shift加速
          
          switch(event.key) {
            case 'ArrowUp': this.keyPressState.arrowUp = true; break;
            case 'ArrowDown': this.keyPressState.arrowDown = true; break;
            case 'ArrowLeft': this.keyPressState.arrowLeft = true; break;
            case 'ArrowRight': this.keyPressState.arrowRight = true; break;
          }
          
          // 开始连续移动
          this.startContinuousMove();
        }
      },
      handleKeyUp(event) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'].includes(event.key)) {
          event.preventDefault();
          
          // 更新按键状态
          switch(event.key) {
            case 'ArrowUp': this.keyPressState.arrowUp = false; break;
            case 'ArrowDown': this.keyPressState.arrowDown = false; break;
            case 'ArrowLeft': this.keyPressState.arrowLeft = false; break;
            case 'ArrowRight': this.keyPressState.arrowRight = false; break;
            case 'Shift': 
              this.keyPressState.shiftKey = false;
              this.moveStep = 1;
              break;
          }
          
          // 如果没有方向键按下，停止连续移动
          if (!this.keyPressState.arrowUp && !this.keyPressState.arrowDown && 
              !this.keyPressState.arrowLeft && !this.keyPressState.arrowRight) {
            this.stopContinuousMove();
          }
        }
      },
      
      startContinuousMove() {
        // 如果已经有定时器在运行，则不再创建新的
        if (this.keyPressTimer) return;
        
        // 初始移动
        this.moveSelectedItems();
        
        // 设置定时器连续移动
        this.keyPressTimer = setInterval(() => {
          this.moveSelectedItems();
        }, 50); // 50毫秒间隔
      },
      
      stopContinuousMove() {
        if (this.keyPressTimer) {
          clearInterval(this.keyPressTimer);
          this.keyPressTimer = null;
        }
        
        // 将移动操作添加到历史记录
        if (this.selectedItems.length > 0) {
          this.history.push(JSON.parse(JSON.stringify(this.items)));
        }
      },
      
      moveSelectedItems() {
        if (this.selectedItems.length === 0) return;
        
        // 计算移动距离
        let dx = 0, dy = 0;
        
        if (this.keyPressState.arrowUp) dy -= this.moveStep;
        if (this.keyPressState.arrowDown) dy += this.moveStep;
        if (this.keyPressState.arrowLeft) dx -= this.moveStep;
        if (this.keyPressState.arrowRight) dx += this.moveStep;
        
        if (dx === 0 && dy === 0) return;
        
        // 移动选中的项目
        this.items = this.items.map(item => {
          if (!this.selectedItems.includes(item.id)) return item;
          
          const newItem = {...item};
          
          switch(item.type) {
            case 'circle':
              newItem.cx += dx;
              newItem.cy += dy;
              break;
            case 'line':
              newItem.x1 += dx;
              newItem.y1 += dy;
              newItem.x2 += dx;
              newItem.y2 += dy;
              break;
            default: // rectangle, text, image
              newItem.x += dx;
              newItem.y += dy;
          }
          
          return newItem;
        });
      },
      // 复制选中的项目
      copySelected() {
        if (this.selectedItems.length === 0) return;
        
        // 复制选中的项目到剪贴板
        const itemsToCopy = this.items.filter(item => 
          this.selectedItems.includes(item.id)
        );
        
        // 为复制的项目生成新的ID
        const idMap = {};
        const copiedItems = itemsToCopy.map(item => {
          const newId = generateId();
          idMap[item.id] = newId;
          
          // 创建新项目，替换ID
          return { ...item, id: newId };
        });
        
        // 存储到剪贴板
        this.$clipboard = {
          items: copiedItems,
          idMap,
          originalIds: itemsToCopy.map(item => item.id)
        };
        
        console.log('已复制', copiedItems.length, '个项目');
      },
      
      // 粘贴项目
      pasteItems() {
        if (!this.$clipboard || !this.$clipboard.items) return;
        
        // 计算粘贴位置偏移量（向右下方偏移20px）
        const offset = 20;
        
        // 粘贴项目并添加到画布
        const pastedItems = this.$clipboard.items.map(item => {
          const newItem = { ...item };
          
          // 根据类型调整位置
          switch (newItem.type) {
            case 'rectangle':
            case 'text':
            case 'image':
              newItem.x += offset;
              newItem.y += offset;
              break;
            case 'circle':
              newItem.cx += offset;
              newItem.cy += offset;
              break;
            case 'line':
              newItem.x1 += offset;
              newItem.y1 += offset;
              newItem.x2 += offset;
              newItem.y2 += offset;
              break;
          }
          
          return newItem;
        });
        
        // 添加到画布
        this.items = [...this.items, ...pastedItems];
        
        // 选中粘贴的项目
        this.selectedItems = pastedItems.map(item => item.id);
        
        // 添加到历史记录
        this.history.push(JSON.parse(JSON.stringify(this.items)));
        
        console.log('已粘贴', pastedItems.length, '个项目');
      },
      // 模式切换
      changeMode(mode) {
        this.mode = mode;
        this.animationEnabled = mode === 'run'; // 仅运行模式启用动画
        this.selectedItems = [];
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
        if (this.mode !== 'edit') return;
  
        if (!isMultiSelect || !event.ctrlKey) {
          this.selectedItems = [id];
        } else if (!this.selectedItems.includes(id)) {
          this.selectedItems = [...this.selectedItems, id]; // 使用扩展运算符创建新数组
        } else {
          this.selectedItems = this.selectedItems.filter(itemId => itemId !== id);
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
        
        // 更严格的选择过滤
        this.selectedItems = this.items
          .filter(item => {
            const validTypes = ['rectangle', 'circle', 'line', 'text', 'image'];
            return validTypes.includes(item.type);
          })
          .map(item => item.id);
        
        // 添加视觉反馈
        this.$nextTick(() => {
          this.$refs.canvasContainer.querySelectorAll('.selected')
            .forEach(el => el.classList.add('select-feedback'));
          
          setTimeout(() => {
            this.$refs.canvasContainer.querySelectorAll('.select-feedback')
              .forEach(el => el.classList.remove('select-feedback'));
          }, 300);
        });
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
        if (this.mode !== 'edit') return;

        const rect = this.$refs.canvasContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.currentMousePos = { x, y };
        
        // 检查是否点击了空白区域
        if (event.target.tagName === 'svg' || 
            (event.target.tagName === 'rect' && event.target.getAttribute('fill') === 'url(#grid)')) {
          this.isSelecting = true;
          this.selectionStart = { x, y };
          
          // 如果没有按住Ctrl键，清空当前选择
          if (!event.ctrlKey && !event.metaKey) {
            this.selectedItems = [];
          }
          
          // 如果是多选状态，准备拖拽所有已选中的项目
          if (this.selectedItems.length > 0) {
            this.prepareDrag(x, y);
          }
        }
      },
      
      handleCanvasMouseMove(event) {
        const rect = this.$refs.canvasContainer.getBoundingClientRect();
        this.currentMousePos = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
        
        if (this.isSelecting) return;
        if (!this.isDragging || this.selectedItems.length === 0) return;

        event.preventDefault();
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const dx = x - this.dragStartPos.x;
        const dy = y - this.dragStartPos.y;

        // 移动所有选中的项目
        this.items = this.items.map(item => {
          if (!this.selectedItems.includes(item.id)) return item;
          
          const newItem = {...item};
          const initialItem = this.initialItemState.find(i => i.id === item.id);
          
          if (this.isResizing) {
            this.resizeItem(newItem, x, y);
          } else {
            switch(item.type) {
              case 'circle':
                newItem.cx = initialItem.cx + dx;
                newItem.cy = initialItem.cy + dy;
                break;
              case 'line':
                newItem.x1 = initialItem.x1 + dx;
                newItem.y1 = initialItem.y1 + dy;
                newItem.x2 = initialItem.x2 + dx;
                newItem.y2 = initialItem.y2 + dy;
                break;
              default:
                newItem.x = initialItem.x + dx;
                newItem.y = initialItem.y + dy;
            }
          }
          
          return newItem;
        });
        
        this.dragStartPos = { x, y };
      },
      // 移动项目
      moveItem(item, dx, dy) {
        this.items = this.items.map(i => {
          if (i.id === item.id) {
            if (i.type === 'circle') {
              return { ...i, cx: this.initialItemState.cx + dx, cy: this.initialItemState.cy + dy };
            } else if (i.type === 'line') {
              return {
                ...i,
                x1: this.initialItemState.x1 + dx,
                y1: this.initialItemState.y1 + dy,
                x2: this.initialItemState.x2 + dx,
                y2: this.initialItemState.y2 + dy
              };
            } else {
              return {
                ...i,
                x: this.initialItemState.x + dx,
                y: this.initialItemState.y + dy
              };
            }
          }
          return i;
        });
      },
      // 添加调整大小的事件处理
      handleResizeMouseDown(event, item, resizeType) {
        if (this.mode !== 'edit') return;
        
        event.stopPropagation();
        this.isResizing = true;
        this.resizeItem = item;
        this.resizeType = resizeType;
        this.initialItemState1 = JSON.parse(JSON.stringify(item));
        
        // 添加全局事件监听
        window.addEventListener('mousemove', this.handleResizeMouseMove);
        window.addEventListener('mouseup', this.handleResizeMouseUp);
      },
      
      handleResizeMouseMove(event) {
        if (!this.isResizing || !this.resizeItem) return;
        
        const rect = this.$refs.canvasContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const item = this.resizeItem;
        const initial = this.initialItemState1;
        let dx,dy;
        switch (this.resizeType) {
          case 'bottom-right': // 矩形右下角调整
            item.width = Math.max(10, mouseX - initial.x);
            item.height = Math.max(10, mouseY - initial.y);
            break;
            
          case 'radius': // 圆形半径调整
            dx = mouseX - item.cx;
            dy = mouseY - item.cy;
            item.r = Math.max(5, Math.sqrt(dx * dx + dy * dy));
            break;
          case 'line-start':
            item.x1 = mouseX;
            item.y1 = mouseY;
            break;
            
          case 'line-end':
            item.x2 = mouseX;
            item.y2 = mouseY;
            break;
          // 可以添加其他调整类型的处理
        }
        
        // 更新视图
        this.items = [...this.items];
      },
      
      handleResizeMouseUp() {
        if (this.isResizing) {
          this.history.push(JSON.parse(JSON.stringify(this.items)));
        }
        
        this.isResizing = false;
        this.resizeItem = null;
        this.resizeType = null;
        this.initialItemState1 = null;
        
        // 移除事件监听
        window.removeEventListener('mousemove', this.handleResizeMouseMove);
        window.removeEventListener('mouseup', this.handleResizeMouseUp);
      },
      
      handleCanvasMouseUp() {
        if (this.isSelecting) {
          this.finalizeSelection();
          this.isSelecting = false;
        }
        
        this.isDragging = false;
      },
      finalizeSelection() {
        const minX = Math.min(this.selectionStart.x, this.currentMousePos.x);
        const maxX = Math.max(this.selectionStart.x, this.currentMousePos.x);
        const minY = Math.min(this.selectionStart.y, this.currentMousePos.y);
        const maxY = Math.max(this.selectionStart.y, this.currentMousePos.y);
        
        const newSelection = [];
        
        this.items.forEach(item => {
          let isInside = false;
          
          if (item.type === 'rectangle') {
            isInside = item.x < maxX && 
                      item.x + item.width > minX && 
                      item.y < maxY && 
                      item.y + item.height > minY;
          } else if (item.type === 'circle') {
            // 更精确的圆选择检测
            const closestX = Math.max(minX, Math.min(item.cx, maxX));
            const closestY = Math.max(minY, Math.min(item.cy, maxY));
            const distance = Math.sqrt(
              Math.pow(item.cx - closestX, 2) + 
              Math.pow(item.cy - closestY, 2)
            );
            isInside = distance <= item.r;
          } else if (item.type === 'line') {
            // 检查线段的起点或终点是否在选择框内
            isInside = (item.x1 >= minX && item.x1 <= maxX && item.y1 >= minY && item.y1 <= maxY) ||
                      (item.x2 >= minX && item.x2 <= maxX && item.y2 >= minY && item.y2 <= maxY);
          } else {
            // 文本和图片的简单检测
            isInside = item.x >= minX && 
                      item.x <= maxX && 
                      item.y >= minY && 
                      item.y <= maxY;
          }
          
          if (isInside) {
            newSelection.push(item.id);
          }
        });
        
        if (event.ctrlKey || event.metaKey) {
          // 多选模式，合并选择
          this.selectedItems = [...new Set([...this.selectedItems, ...newSelection])];
        } else {
          this.selectedItems = newSelection;
        }
      },
      // 项目鼠标事件
      handleItemMouseDown(event, item) {
        if (this.mode !== 'edit') return;

        const rect = this.$refs.canvasContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // 检查是否按下了Ctrl键（Mac上是metaKey）
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        
        if (isCtrlPressed) {
          // Ctrl+点击：只切换选中状态，不初始化拖拽
          this.toggleItemSelection(item.id);
          event.preventDefault();
          return;
        }

        // 检查当前点击的项目是否已被选中
        const isAlreadySelected = this.selectedItems.includes(item.id);
        
        if (!isAlreadySelected) {
          // 如果点击了未选中的项目，且没有按Ctrl键，则单选该项目
          this.selectItem(item.id, false);
        }

        // 准备拖拽所有选中项目（包括刚刚点击的项目）
        this.prepareDrag(mouseX, mouseY);
        
        event.preventDefault();
      },
      
      // 新增方法：准备拖拽所有选中项目
      prepareDrag(startX, startY) {
        this.dragState = {
          active: true,
          startX,
          startY,
          items: this.items
            .filter(item => this.selectedItems.includes(item.id))
            .map(item => ({
              ...item,
              origX: item.type === 'circle' ? item.cx : item.x,
              origY: item.type === 'circle' ? item.cy : item.y
            }))
        };
        
        // 添加全局事件监听
        window.addEventListener('mousemove', this.handleRealDragMove);
        window.addEventListener('mouseup', this.handleRealDragEnd);
      },
      // 新增方法：切换项目选中状态
      toggleItemSelection(itemId) {
        if (this.selectedItems.includes(itemId)) {
          // 如果已选中，则从选中列表中移除（反选）
          this.selectedItems = this.selectedItems.filter(id => id !== itemId);
        } else {
          // 如果未选中，则添加到选中列表（多选）
          this.selectedItems = [...this.selectedItems, itemId];
        }
      },
      handleRealDragMove(event) {
        // console.log('MouseMove:', event.clientX, event.clientY);
        if (!this.dragState.active) return;

        const rect = this.$refs.canvasContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const deltaX = mouseX - this.dragState.startX;
        const deltaY = mouseY - this.dragState.startY;

        // 移动所有拖拽状态中的项目
        this.items = this.items.map(item => {
          const original = this.dragState.items.find(i => i.id === item.id);
          if (!original) return item;

          const newItem = { ...item };
          switch(item.type) {
            case 'circle':
              newItem.cx = original.origX + deltaX;
              newItem.cy = original.origY + deltaY;
              break;
            case 'line':
              newItem.x1 = original.x1 + deltaX;
              newItem.y1 = original.y1 + deltaY;
              newItem.x2 = original.x2 + deltaX;
              newItem.y2 = original.y2 + deltaY;
              break;
            default: // rectangle/text/image
              newItem.x = original.origX + deltaX;
              newItem.y = original.origY + deltaY;
          }
          return newItem;
        });

        event.preventDefault();
      },

      handleRealDragEnd() {
        if (this.dragState.active) {
          // 保存到历史记录
          this.history.push(JSON.parse(JSON.stringify(this.items)));
          this.dragState.active = false;
        }
        window.removeEventListener('mousemove', this.handleRealDragMove);
        window.removeEventListener('mouseup', this.handleRealDragEnd);
      },    

      controlledAnimationLoop(timestamp) {
        if (!this.animationEnabled || this.mode !== 'run') {
          this.animationFrame = requestAnimationFrame(this.controlledAnimationLoop);
          return;
        }

        if (timestamp - this.lastUpdateTime > 100) {
          this.updateBindings();
          this.lastUpdateTime = timestamp;
        }
        this.animationFrame = requestAnimationFrame(this.controlledAnimationLoop);
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
      },
      //只更新单个项目
      updateSingleItem(updates) {
        // 跳过动画循环期间的更新
        if (this.isAnimating) return;
        
        // 深度合并更新
        const index = this.items.findIndex(i => i.id === updates.id);
        if (index === -1) return;
        
        // 保留绑定关系
        const bindings = this.items[index].bindings || {};
        
        // 创建新对象确保响应性
        const newItem = {
          ...this.items[index],
          ...updates,
          bindings
        };
        
        // 替换数组元素
        this.items = [
          ...this.items.slice(0, index),
          newItem,
          ...this.items.slice(index + 1)
        ];
      },
      addImage(payload) {
        console.log('接收到添加图片请求:', payload); // 调试
        const newItem = {
          id: payload.id,
          type: 'image',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          src: payload.src,
          opacity: 1,
          bindings: {}
        };
        console.log('图片添加111:', newItem);
        // 确保响应性
        this.items = [...this.items, newItem];
        this.selectItem(newItem.id, false);
        this.history.push(JSON.parse(JSON.stringify(this.items)));
        
        console.log('当前所有项目:', this.items); // 调试
      },
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
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    position: relative;
  }
  svg {
    pointer-events: bounding-box;
    display: block; /* 消除SVG默认的inline间隙 */
    user-select: none;
  }
  svg * {
    pointer-events: visible;
  }
  /* 所有图形元素响应指针事件 */
  svg > g > * {
    pointer-events: all;
    cursor: move;
  }
  .canvas {
    display: block;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .selected {
    outline: 2px dashed #0078d7;
    outline-offset: 2px;
    position: relative;
    will-change: transform;
    transition: none !important; /* 拖拽时禁用动画 */
    cursor: move;
  }
  /* .selected::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: #0078d7;
    right: -4px;
    bottom: -4px;
    cursor: nwse-resize;
  } */
  /* 添加拖拽相关样式 */
  .dragging {
    cursor: grabbing !important;
    opacity: 0.9;
    z-index: 1000;
    transition: none !important;
    pointer-events: none;
  }

  .canvas-container {
    user-select: none; /* 防止文本选中干扰拖拽 */
  }
  .resize-handle {
    cursor: nwse-resize;
    pointer-events: all;
  }
  /* 添加操作反馈样式 */
  .operating {
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  /* 复制粘贴时的动画 */
  @keyframes pasteAnimation {
    0% { opacity: 0.5; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }

  .pasted-item {
    animation: pasteAnimation 0.3s ease-out;
  }
  /* 添加移动时的视觉反馈 */
  .moving {
    opacity: 0.9;
    transition: none; /* 移动时禁用过渡效果 */
  }

  /* 添加快捷键提示样式 */
  .shortcut-hint {
    margin-left: 10px;
    font-size: 12px;
    color: #666;
    padding: 4px 8px;
    background: #f0f0f0;
    border-radius: 4px;
  }
  /* 选中反馈动画 */
  @keyframes selectFlash {
    0% { opacity: 0.5; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
  }

  .select-feedback {
    animation: selectFlash 0.3s ease;
  }
  /* 被反选的项目临时效果 */
  .deselecting {
    animation: pulse 0.3s ease;
  }

  @keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
  </style>