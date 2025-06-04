import { defineStore } from "pinia";

export const useAppStore = defineStore("appStore", {
  state: () => ({
    //通用上下文菜单
    ctxMenuShow: false,
    ctxMenuData: [],
    ctxItem: {},
    ctxMenuSeparatorNums: 0,
    currentHref: "",
  }),
  getters: {},
  actions: {
    setCurrentHref(href) {
      this.currentHref = href;
    },
    showCtxMenu() {
      this.ctxMenuShow = true;
    },
    hideCtxMenu() {
      this.ctxMenuShow = false;
    },
    setCtxMenuData(data) {
      this.ctxMenuData.length = 0;
      if (data) {
        let spCnt = 0;
        data.forEach((item) => {
          this.ctxMenuData.push(item);
          if (item.separator) ++spCnt;
        });
        this.ctxMenuSeparatorNums = spCnt;
      }
    },
  },
  // persist: {
  //   enabled: true,
  //   strategies: [
  //     {
  //       storage: localStorage,
  //       paths: ["currentHref"],
  //     },
  //   ],
  // },
});
