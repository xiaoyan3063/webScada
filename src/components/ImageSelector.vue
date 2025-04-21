<template>
    <div class="image-selector-overlay">
      <div class="image-selector">
        <div class="header">
          <h3>选择图片</h3>
          <button @click="$emit('close')">×</button>
        </div>
        <div class="image-grid">
          <div 
            v-for="image in images"
            :key="image.src"
            class="image-item"
            @click="$emit('select', image)"
          >
            <img :src="image.src" :alt="image.name">
            <div class="image-name">{{ image.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      images: Array
    }
  }
  </script>
  
  <style scoped>
  .image-selector-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .image-selector {
    background: white;
    border-radius: 8px;
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    padding: 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
    padding: 15px;
    overflow-y: auto;
  }
  
  .image-item {
    cursor: pointer;
    text-align: center;
    transition: transform 0.2s;
  }
  
  .image-item:hover {
    transform: scale(1.05);
  }
  
  .image-item img {
    width: 100%;
    height: 80px;
    object-fit: contain;
    border: 1px solid #eee;
    border-radius: 4px;
  }
  
  .image-name {
    margin-top: 5px;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  </style>