<script setup>
import { reactive } from "vue";
import { storeToRefs } from "pinia";
import EventBus from "../common/EventBus";
import { useAppStore } from "../store/appStore";
import ContextMenu from "./ContextMenu.vue";
const { ctxMenuShow, ctxMenuData, ctxMenuSeparatorNums } = storeToRefs(
  useAppStore()
);
const { hideCtxMenu, showCtxMenu } = useAppStore();
const ctxMenuPosStyle = reactive({ left: -999, top: -999 });
let ctxMenuPos = null;
const getCtxMenuAutoHeight = () => {
  const total = ctxMenuData.value.length || 1;
  const spNums = ctxMenuSeparatorNums.value;
  const itemHeight = 38,
    padding = 15;
  return itemHeight * (total - spNums) + 7.5 * spNums + 2 * padding;
};

const menuWidth = 208;
const adjustMenuPosition = (event) => {
  const { x, y, clientX, clientY } = event;
  const pos = { x, y };
  const { clientWidth, clientHeight } = document.documentElement;
  //const menuWidth = 179, menuHeight = 288, padding = 10
  const menuHeight = getCtxMenuAutoHeight(),
    padding = 10;
  const gapX = clientX + menuWidth - clientWidth;
  const tGapY = clientY - menuHeight;
  const bGapY = clientY + menuHeight - clientHeight;
  //右边界
  if (gapX > 0) {
    pos.x = pos.x - gapX - padding;
  }
  //TODO 菜单有可能溢出顶部边界
  if (bGapY > 0) {
    //溢出底部边界
    pos.y = pos.y - menuHeight + padding / 2;
  }
  return pos;
};

const setMenuPosition = (event) => {
  ctxMenuPos = adjustMenuPosition(event);
  ctxMenuPosStyle.left = ctxMenuPos.x + "px !important";
  ctxMenuPosStyle.top = ctxMenuPos.y + "px !important";
};

EventBus.on("commonCtxMenu-show", (event) => {
  hideCtxMenu(); //强制取消上次的显示
  setMenuPosition(event);
  showCtxMenu();
});
</script>
<template>
  <div id="popovers">
    <ContextMenu
      v-show="ctxMenuShow"
      :posStyle="ctxMenuPosStyle"
      :data="ctxMenuData"
    >
    </ContextMenu>
  </div>
</template>

<style></style>
