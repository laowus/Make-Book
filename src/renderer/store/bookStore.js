import { defineStore } from "pinia";
import EventBus from "../common/EventBus";
const { ipcRenderer } = window.require("electron");
/**
[
    {
        label: "封面",
        href: "OPS/coverpage.html",
        subitems: [
            {
              label: "第一章　血洗孤城",
              href: "OPS/chapter276.html",
              subitems: null,
            },
            {
              label: "第二章　妙计巧连环",
              href: "OPS/chapter277.html",
              subitems: null,
            }
        ],
    }
]
**/
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
    setMetaData(metaData) {
      this.metaData = metaData;
    },
    setToc(toc) {
      this.toc = toc;
    },
    delTocByHref(href) {
      const removeItem = (items) => {
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i];
          if (item.href === href) {
            items.splice(i, 1); // 删除匹配项
            EventBus.emit("deleteToc", href);
            return true;
          }
          if (item.subitems && item.subitems.length > 0) {
            if (removeItem(item.subitems)) {
              EventBus.emit("deleteToc", href);
              return true;
            }
          }
        }
        return false;
      };
      removeItem(this.toc);
    },
    // 插入数据库中 并更新目录以及当前章节
    addTocByHref(href, item) {
      ipcRenderer.once("db-insert-chapter-response", (event, res) => {
        console.log("addTocByHref db-insert-book-response", res);
        if (res.success) {
          if (href) {
            //获取要插入的父级元素
            const parentItem = this.findTocByHref(href);
            if (parentItem.subitems) {
              parentItem.subitems.push(item);
            } else {
              parentItem.subitems = [item];
            }
          } else {
            console.log("08 addTocByHref", this.toc, item);
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
      ipcRenderer.send("db-insert-chapter", item);
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
  // ,
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
