<template>
  <div id="app" :class="{'run-mode': !isEditMode, 'edit-mode': isEditMode}">
    <div class="app-header">
      <h1>工业SCADA图形编辑器</h1>
      <div class="toolbar">
        <button @click="saveProject">保存</button>
        <button @click="loadProject">加载</button>
        <button @click="toggleMode" :class="{ 'active': !isEditMode }">
          {{ isEditMode ? '进入运行模式' : '返回编辑模式' }}
        </button>
        <button @click="undo" :disabled="!canUndo">撤销</button>
        <button @click="redo" :disabled="!canRedo">恢复</button>
        <button @click="deleteSelected" :disabled="!selectedItemId">删除</button>
        <button @click="toggleSimulation" :disabled="isEditMode">
          {{ isSimulating ? '停止模拟' : '开始模拟' }}
        </button>
      </div>
    </div>
    
    <div class="app-content">
      <Toolbox v-show="isEditMode" />
      <EditorCanvas />
      <PropertyPanel 
        v-show="isEditMode" 
        @open-animation-config="openAnimationConfig" 
      />
    </div>
    
    <AnimationConfig 
      v-if="showAnimationConfig" 
      :show="showAnimationConfig" 
      :itemId="animationItemId"
      @close="closeAnimationConfig"
    />
    <!-- 在模板中添加对话框 -->
    <dialog ref="confirmDialog" class="confirm-dialog">
      <p>确定要删除选中的组件吗？</p>
      <div class="dialog-buttons">
        <button @click="confirmDelete(true)">确定</button>
        <button @click="confirmDelete(false)">取消</button>
      </div>
    </dialog>
  </div>
</template>

<script>
import Toolbox from './components/Toolbox'
import EditorCanvas from './components/EditorCanvas'
import PropertyPanel from './components/PropertyPanel'
import AnimationConfig from './components/AnimationConfig'

export default {
  components: {
    Toolbox,
    EditorCanvas,
    PropertyPanel,
    AnimationConfig
  },
  data() {
    return {
      showAnimationConfig: false,
      animationItemId: null,
      isSimulating: false,
      simulationInterval: null,
      autoSaveInterval:null
    }
  },
  computed: {
    isEditMode() {
      return this.$store.state.editor.isEditMode
    },
    canUndo() {
      return this.$store.state.editor.historyIndex > 0
    },
    canRedo() {
      return this.$store.state.editor.historyIndex < this.$store.state.editor.history.length - 1
    },
    selectedItemId() {
      return this.$store.state.editor.selectedItemId
    }
  },
  created() {
    fetch('/images/pump.png')
      .then(res => {
        if(!res.ok) throw new Error('图片加载失败')
        console.log('图片可正常访问')
      })
      .catch(err => {
        console.error('图片访问错误:', err)
        alert(`图片加载失败，请检查public/images目录是否存在pump.png文件`)
      })
  },
  mounted() {
    this.autoSaveInterval = setInterval(() => {
      this.$store.dispatch('editor/autoSave')
    }, 30000) // 每30秒自动保存
  },
  methods: {
    undo() {
      this.$store.commit('editor/UNDO')
    },
    redo() {
      this.$store.commit('editor/REDO')
    },    
    deleteSelected() {
      this.$refs.confirmDialog.showModal()
    },
    confirmDelete(confirmed) {
      this.$refs.confirmDialog.close()
      if (confirmed) {
        this.$store.dispatch('editor/deleteSelectedItem')
      }
    },
    openAnimationConfig(itemId) {
      this.animationItemId = itemId
      this.showAnimationConfig = true
    },
    
    closeAnimationConfig() {
      this.showAnimationConfig = false
      this.animationItemId = null
    },
    
    saveProject() {
      const project = {
        items: this.$store.state.editor.canvasItems,
        connections: this.$store.state.editor.connections,
        animations: this.$store.state.animation.animations,
        isEditMode: this.$store.state.editor.isEditMode // 保存当前模式状态
      }
      const data = JSON.stringify(project)
      localStorage.setItem('scada-project', data)
      alert('项目已保存')
    },
    
    loadProject() {
        const data = localStorage.getItem('scada-project')
        if (data) {
            try {
                const project = JSON.parse(data)
                
                // 使用正确的mutation类型
                this.$store.commit('editor/SET_CANVAS_ITEMS', project.items)
                this.$store.commit('editor/SET_CONNECTIONS', project.connections)
                this.$store.commit('animation/SET_ANIMATIONS', project.animations)
                
                // 恢复保存的模式状态
                this.$store.commit('editor/SET_EDIT_MODE', project.isEditMode !== false)
                
                // 重置历史记录
                this.$store.commit('editor/RESET_HISTORY')
                
                alert('项目已加载')
            } catch (e) {
                console.error('项目加载失败:', e)
                alert('项目加载失败，数据格式错误')
            }
        } else {
            alert('没有找到保存的项目')
        }
    },
    
    toggleMode() {
      if (this.isEditMode) {
        // 切换到运行模式前自动保存
        this.saveProject()
      }
      this.$store.commit('editor/TOGGLE_EDIT_MODE')
      
      // 如果切换到编辑模式，停止模拟
      if (this.isEditMode && this.isSimulating) {
        this.stopSimulation()
      }
    },
    
    toggleSimulation() {
      if (this.isSimulating) {
        this.stopSimulation()
      } else {
        this.startSimulation()
      }
    },
    
    startSimulation() {
      this.isSimulating = true
      // 开始模拟数据变化
      this.simulationInterval = setInterval(() => {
        // 随机更新一些数据点
        const tags = this.$store.state.animation.animations
          .filter(a => a.trigger === 'data')
          .map(a => a.dataTag)
          
        tags.forEach(tag => {
          if (tag) {
            const value = Math.random() * 100
            this.$store.dispatch('animation/updateDataTag', {
              tag,
              value
            })
          }
        })
      }, 1000)
    },
    
    stopSimulation() {
      this.isSimulating = false
      clearInterval(this.simulationInterval)
    }
  },
  beforeDestroy() {
    clearInterval(this.autoSaveInterval)
    this.stopSimulation()
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  height: 100vh;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 模式全局样式 */
.edit-mode {
  --primary-color: #2196F3;
  --toolbar-bg: #f5f5f5;
  --border-color: #ddd;
}

.run-mode {
  --primary-color: #4CAF50;
  --toolbar-bg: #e8f5e9;
  --border-color: #c8e6c9;
  cursor: default;
}

.app-header {
  padding: 10px 20px;
  background: var(--primary-color);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s ease;
}

.app-header h1 {
  font-size: 18px;
  font-weight: 500;
}

.toolbar {
  display: flex;
  gap: 10px;
}

.toolbar button {
  padding: 6px 12px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.toolbar button:hover {
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.toolbar button.active {
  background: #ffeb3b;
  color: #333;
}

.toolbar button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.app-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: var(--toolbar-bg);
  transition: background 0.3s ease;
}

/* SVG画布全局样式 */
.editor-canvas svg {
  overflow: visible !important;
  display: block;
}

/* 运行模式下的特殊样式 */
.run-mode .shape-element {
  cursor: default;
}

.run-mode .app-header {
  background: var(--primary-color);
}

/* 调试样式 */
.debug-outline * {
  outline: 1px solid rgba(255,0,0,0.3);
}

.debug-rect {
  outline: 2px solid red !important;
}
.confirm-dialog {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 20px;
  max-width: 300px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  gap: 10px;
}
</style>