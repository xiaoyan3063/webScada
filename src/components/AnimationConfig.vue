<template>
    <div class="animation-config-modal" v-if="show" @click.self="close">
      <div class="animation-config">
        <div class="modal-header">
          <h3>动画配置</h3>
          <button @click="close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>动画类型</label>
            <select v-model="animation.type">
              <option value="fill">填充颜色</option>
              <option value="stroke">边框颜色</option>
              <option value="position">位置</option>
              <option value="rotation">旋转</option>
              <option value="visibility">可见性</option>
              <option value="text">文本内容</option>
            </select>
          </div>
          
          <div class="form-group" v-if="animation.type === 'fill' || animation.type === 'stroke'">
            <label>颜色变化</label>
            <div>
              <input type="color" v-model="animation.value.from">
              <span>→</span>
              <input type="color" v-model="animation.value.to">
            </div>
          </div>
          
          <div class="form-group" v-if="animation.type === 'position'">
            <label>位置变化</label>
            <div>
              X: <input type="number" v-model.number="animation.value.from.x">
              Y: <input type="number" v-model.number="animation.value.from.y">
              →
              X: <input type="number" v-model.number="animation.value.to.x">
              Y: <input type="number" v-model.number="animation.value.to.y">
            </div>
          </div>
          
          <div class="form-group" v-if="animation.type === 'rotation'">
            <label>旋转角度</label>
            <div>
              <input type="number" v-model.number="animation.value.from">°
              →
              <input type="number" v-model.number="animation.value.to">°
            </div>
          </div>
          
          <div class="form-group" v-if="animation.type === 'visibility'">
            <label>可见性</label>
            <select v-model="animation.value">
              <option value="toggle">闪烁</option>
              <option value="show">显示</option>
              <option value="hide">隐藏</option>
            </select>
          </div>
          
          <div class="form-group" v-if="animation.type === 'text'">
            <label>文本内容</label>
            <input type="text" v-model="animation.value">
          </div>
          
          <div class="form-group">
            <label>触发方式</label>
            <select v-model="animation.trigger">
              <option value="data">数据变化</option>
              <option value="click">点击</option>
              <option value="time">定时</option>
            </select>
          </div>
          
          <div class="form-group" v-if="animation.trigger === 'data'">
            <label>数据点</label>
            <input type="text" v-model="animation.dataTag" placeholder="例如: PLC1.D100">
            <div v-if="animation.type !== 'visibility' && animation.type !== 'text'">
              <label>数据范围</label>
              <div>
                <input type="number" v-model.number="animation.dataRange.min" placeholder="最小值">
                →
                <input type="number" v-model.number="animation.dataRange.max" placeholder="最大值">
              </div>
            </div>
            <div v-else>
              <label>触发条件</label>
              <select v-model="animation.condition">
                <option value="eq">等于</option>
                <option value="gt">大于</option>
                <option value="lt">小于</option>
              </select>
              <input type="number" v-model.number="animation.conditionValue">
            </div>
          </div>
          
          <div class="form-group" v-if="animation.trigger === 'time'">
            <label>时间间隔(ms)</label>
            <input type="number" v-model.number="animation.interval">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="close">取消</button>
          <button @click="saveAnimation">保存</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapActions } from 'vuex'
  
  export default {
    props: {
      show: Boolean,
      itemId: String
    },
    data() {
      return {
        animation: {
          id: null,
          itemId: this.itemId,
          type: 'fill',
          trigger: 'data',
          value: {
            from: '#ffffff',
            to: '#ff0000'
          },
          dataTag: '',
          dataRange: {
            min: 0,
            max: 100
          },
          condition: 'eq',
          conditionValue: 1,
          interval: 1000
        }
      }
    },
    methods: {
      ...mapActions('animation', ['addAnimation', 'updateAnimation']),
      
      close() {
        this.$emit('close')
      },
      
      saveAnimation() {
        if (!this.animation.id) {
          this.animation.id = Date.now().toString()
          this.addAnimation(this.animation)
        } else {
          this.updateAnimation(this.animation)
        }
        this.close()
      }
    }
  }
  </script>
  
  <style scoped>
  .animation-config-modal {
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
  
  .animation-config {
    background: white;
    width: 500px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
  
  .modal-header {
    padding: 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h3 {
    margin: 0;
  }
  
  .modal-header button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
  
  .modal-body {
    padding: 15px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input, .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 5px;
  }
  
  .modal-footer {
    padding: 15px;
    border-top: 1px solid #eee;
    text-align: right;
  }
  
  .modal-footer button {
    padding: 8px 15px;
    margin-left: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .modal-footer button:first-child {
    background: #f5f5f5;
  }
  
  .modal-footer button:last-child {
    background: #2196F3;
    color: white;
  }
  </style>