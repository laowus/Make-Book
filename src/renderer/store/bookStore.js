import { defineStore } from "pinia";
import EventBus from "../common/EventBus";
const { ipcRenderer } = window.require("electron");
export const useBookStore = defineStore("bookStore", {
  state: () => ({
    isFirst: true,
    metaData: null, //书籍信息
    toc: null, //目录
    curChapter: {
      bookId: 0,
      href: "",
      title: "",
      content: "",
    }, //当前编辑的章节
  }),
  getters: {},
  actions: {
    setFirst(isF) {
      this.isFirst = isF;
    },
    setMetaData(metaData) {
      this.metaData = metaData;
    },
    setToc(toc) {
      this.toc = toc;
    },
    delTocByHref(href) {
      console.log("delTocByHref", href);
      const removeItem = (items) => {
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i];
          if (item.href === href) {
            const preItem = items[i - 1];
            items.splice(i, 1);
            EventBus.emit("updateToc", preItem.href);
            return true;
          }
          if (item.subitems && item.subitems.length > 0) {
            if (removeItem(item.subitems)) {
              return true;
            }
          }
        }
        return false;
      };
      removeItem(this.toc);
    },
    // 插入数据库中 并更新目录以及当前章节
    addTocByHref(href, tocItem) {
      console.log("addTocByHref", href, tocItem);
      ipcRenderer.once("db-insert-chapter-response", (event, res) => {
        if (res.success) {
          const item = {
            label: tocItem.label,
            href: res.id,
            subitems: null,
          };
          if (href) {
            //获取要插入的父级元素
            const parentItem = this.findTocByHref(href);
            console.log("findTocByHref", parentItem);
            if (parentItem.subitems) {
              parentItem.subitems.push(item);
            } else {
              parentItem.subitems = [item];
            }
          } else {
            if (!this.toc) {
              this.toc = [];
            }
            this.toc.push(item);
          }
          // 发送更新目录事件
          EventBus.emit("updateToc", item.href);
        } else {
          console.error("插入章节数据失败:", res.message);
        }
      });
      ipcRenderer.send("db-insert-chapter", tocItem);
    },
    updateTocByHref(newItem) {
      const tocItem = this.findTocByHref(newItem.id);
      console.log("updateTocByHref", tocItem, newItem);
      if (tocItem) {
        tocItem.label = newItem.label;
        console.log("更新后toc", this.toc);
        EventBus.emit("updateToc", tocItem.href);
      }
    },
    findTocByHref(href) {
      const findItem = (href, items) => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.href === href) {
            return item;
          }
          if (item.subitems && item.subitems.length > 0) {
            const result = findItem(href, item.subitems);
            if (result) {
              return result;
            }
          }
        }
      };
      return findItem(href, this.toc);
    },
  },
  // persist: {
  //   enabled: true,
  //   strategies: [
  //     {
  //       storage: localStorage,
  //       paths: ["metaData", "toc"],
  //     },
  //   ],
  // },
});
