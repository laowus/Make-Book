<script setup>
import { ref, provide, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import Header from "./components/Header.vue";
</script>

<template>
  <div class="container">
    <Header></Header>
  </div>
</template>

<style>
html {
  height: 100%;
}

body {
  margin: 0 auto;
  height: 100%;
  font: menu;
  font-family: system-ui, sans-serif;
}
.content {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100vh - 120px);
  background-color: #add8e6;
  box-sizing: border-box !important;
}
.footbar {
  height: 20px;
  width: 100%;
  background-color: #87ceeb;
  text-align: left;
  line-height: 20px;
}
</style>
