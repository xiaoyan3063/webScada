  <template>
    <div class="toolbox">
      <div class="toolbox-header">工具箱</div>
      <div class="tool-list">
        <div 
          v-for="tool in tools" 
          :key="tool.type"
          draggable="true"
          @dragstart="handleDragStart($event, tool)"
          class="tool-item"
          :title="getToolTitle(tool.type)"
          @click="selectTool(tool.type)"
        >
          <span class="tool-icon">{{ getToolIcon(tool.type) }}</span>
          <span class="tool-name">{{ tool.name }}</span>
        </div>
      </div>

      <div 
        class="toolbox-item image-tool"
        draggable="true"
        @dragstart="dragImage"
        title="添加图片"
        >
        <img src="@/assets/image-icon.png" alt="图片">
        <span>图片</span>
      </div>

    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        // tools: [
        // //   { type: 'select', name: '选择工具', icon: 'icon-cursor' },
        //   { type: 'rectangle', name: '矩形', icon: 'icon-square' },
        //   { type: 'circle', name: '圆形', icon: 'icon-circle' },
        //   { type: 'triangle', name: '三角形', icon: 'icon-triangle' },
        // //   { type: 'line', name: '直线', icon: 'icon-line' },
        // //   { type: 'text', name: '文本', icon: 'icon-text' },
        //   { type: 'valve', name: '阀门', icon: 'icon-valve' },
        //   { type: 'pump', name: '泵', icon: 'icon-pump' },
        //   { type: 'tank', name: '储罐', icon: 'icon-tank' },
        // //   { type: 'connection', name: '连接线', icon: 'icon-connection' }
        // ]
        tools: [
            // { type: 'select', name: '选择工具' },
            { type: 'rectangle', name: '矩形' },
            { type: 'circle', name: '圆形' },
            { type: 'triangle', name: '三角形' },
            { type: 'line', name: '直线' },
            { type: 'text', name: '文本' },
            { type: 'valve', name: '阀门' },
            { type: 'pump', name: '泵' },
            { type: 'tank', name: '储罐' },
            // { type: 'connection', name: '连接线' }
        ]
      }
    },
    computed: {
      currentTool() {        
        return this.$store.state.editor.currentTool
      }
    },
    methods: {
        dragImage(e) {
            e.dataTransfer.setData('application/json', JSON.stringify({
                type: 'ScadaImage'
            }))
        },
        getToolIcon(type) {
            const icons = {
                // select: '\u{1F5B1}\u{FE0F}', // 🖱️
                rectangle: '\u{2B1C}',       // ⬜
                circle: '\u{26AA}',         // ⚪
                triangle: '\u{25B2}',       // ▲
                line: '\u{2500}',           // ─
                valve: '\u{2699}\u{FE0F}',  // ⚙️
                pump: '\u{1F527}',          // 🔧
                tank: '\u{1F6E2}',          // 🛢️
                // connection: '\u{1F517}'     // 🔗
            }
            return icons[type] || '?'
        },
        getToolTitle(type) {
            return `${this.getToolIcon(type)} ${this.tools.find(t => t.type === type)?.name || ''}`
        },
        selectTool(toolType) {
            console.log('选中工具:', toolType); // 调试日志
            if (this.$store) {
                this.$store.commit('editor/SET_CURRENT_TOOL', toolType)
            }
        },
        handleDragStart(e, tool) {
            // 统一添加Scada前缀并首字母大写
            const componentType = 'Scada' + 
                tool.type.charAt(0).toUpperCase() + 
                tool.type.slice(1)
            
            const defaultSizes = {
                rectangle: { width: 100, height: 80 },
                circle: { width: 80, height: 80 },
                triangle: { width: 80, height: 80 },
                valve: { width: 60, height: 60 },
                pump: { width: 80, height: 60 },
                tank: { width: 100, height: 150 }
            }
            if(componentType === "ScadaText"){
                e.dataTransfer.setData('application/json', JSON.stringify({
                    type: componentType, // 例如: ScadaRectangle
                    ...defaultSizes[tool.type],
                    x: 0,  // 会在drop时修正
                    y: 0,  // 会在drop时修正
                    width: 120,
                    height: 40,
                    content: '新建文本',
                    fontSize: 14,
                    fontColor: '#000000',
                    backgroundColor: 'rgba(240,240,240,0.7)',
                }))
            }else{
                e.dataTransfer.setData('application/json', JSON.stringify({
                    type: componentType, // 例如: ScadaRectangle
                    ...defaultSizes[tool.type],
                    fill: '#3a7bd5',
                    stroke: '#2c3e50'
                }))
            }
            
        }
    }
  }
  </script>
  
  <style scoped>
  .toolbox {
    width: 180px;
    background: #f5f5f5;
    border-right: 1px solid #ddd;
    user-select: none;
  }
  
  .toolbox-header {
    padding: 10px;
    text-align: center;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
  }
  
  .tool-list {
    padding: 10px 0;
  }
  
  .tool-item {
    padding: 8px;
    text-align: center;
    cursor: pointer;
    margin: 5px;
    border-radius: 4px;
  }
  
  .tool-item:hover {
    background: #e0e0e0;
  }
  
  .tool-item.active {
    background: #2196F3;
    color: white;
  }

  .tool-item {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
  }
  .tool-icon {
    font-size: 18px;
    margin-right: 8px;
  }
  .image-tool img {
    width: 24px;
    height: 24px;
    object-fit: contain;
   }
  </style>