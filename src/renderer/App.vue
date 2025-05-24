<script setup>
import { ref, provide, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { createTOCView } from "./libs/ui/tree.js";
import EventBus from "./common/EventBus";
import Header from "./components/Header.vue";
import TxtEditor from "./components/TxtEditor.vue";
import { useBookStore } from "./store/bookStore";
const { ipcRenderer } = window.require("electron");
const { addTocByHref } = useBookStore();
const { curChapter, metaData, toc } = storeToRefs(useBookStore());
let tocView;
//重新布局目录
const updateTocView = (curhref) => {
  console.log("curhref", curhref);
  tocView = createTOCView(
    toc.value,
    (href) => {
      updateCurChapter(href);
    },
    (href, event) => {
      updateCurChapter(href);
      //showContextMenu(event, href);
    }
  );
  const tocViewElement = window.$("#toc-view");
  tocViewElement.innerHTML = "";
  tocViewElement.append(tocView.element);
  tocView.setCurrentHref(curhref);
  updateCurChapter(curhref);
};

EventBus.on("addChapter", (res) => {
  console.log("addChapter", res);
  addTocByHref(res.href, res.chapter); //toc里面添加
  console.log("res.chapter.href", res.chapter.href);
  updateTocView(res.chapter.href); //重新布局目录
});

//更新内容
const updateCurChapter = (href) => {
  //从数据库里面获取内容
  const chapter = ipcRenderer.sendSync(
    "db-get-chapter",
    metaData.value.bookId,
    href
  );
  //显示内容
  curChapter.value = chapter.data;
};

//更新目录，重新载入编辑内容
EventBus.on("updateToc", (href) => {
  //更新目录
  updateTocView(href);
  //更新右边内容
  updateCurChapter(href);
});
</script>

<template>
  <div class="container">
    <Header></Header>
    <div class="content">
      <div id="leftMenu">
        <div id="side-bar-header">
          <img id="side-bar-cover" />
          <div>
            <h1 id="side-bar-title"></h1>
            <p id="side-bar-author"></p>
          </div>
        </div>
        <div id="toc-view"></div>
      </div>
      <TxtEditor />
    </div>
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

#leftMenu {
  width: 200px;
  height: 100%;
  background-color: #f0f0f0;
  border-right: 1px solid #add8e6;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#leftMenu div {
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  text-overflow: ellipsis;
}

#side-bar-header {
  padding: 1rem;
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  align-items: center;
  padding: 5px;
}

#side-bar-cover {
  height: 10vh;
  min-height: 60px;
  max-height: 180px;
  border-radius: 3px;
  border: 0;
  background: lightgray;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.1), 0 0 16px rgba(0, 0, 0, 0.1);
  margin-inline-end: 1rem;
}

#side-bar-cover:not([src]) {
  display: none;
}

#side-bar-title {
  margin: 0.5rem 0;
  font-size: inherit;
}

#side-bar-author {
  margin: 0.5rem 0;
  font-size: small;
  color: GrayText;
}

#toc-view {
  padding: 0.5rem;
  overflow-y: scroll;
}

#toc-view li,
#toc-view ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

#toc-view a,
#toc-view span {
  display: block;
  border-radius: 6px;
  padding: 8px;
  margin: 2px 0;
}

#toc-view a {
  color: CanvasText;
  text-decoration: none;
}

#toc-view a:hover {
  background: #ccc;
}

#toc-view span {
  color: GrayText;
}

#toc-view svg {
  margin-inline-start: -24px;
  padding-inline-start: 5px;
  padding-inline-end: 6px;
  fill: CanvasText;
  cursor: default;
  transition: transform 0.2s ease;
  opacity: 0.5;
}

#toc-view svg:hover {
  opacity: 1;
}

#toc-view [aria-current] {
  font-weight: bold;
  background: #ccc;
}

#toc-view [aria-expanded="false"] svg {
  transform: rotate(-90deg);
}

#toc-view [aria-expanded="false"] + [role="group"] {
  display: none;
}
</style>
