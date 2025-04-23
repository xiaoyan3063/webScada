<template>
  <div id="app">
    <Editor />
  </div>
</template>

<script>
import Editor from './components/Editor.vue'

export default {
  name: 'App',
  components: {
    Editor
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>