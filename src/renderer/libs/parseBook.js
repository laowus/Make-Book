import { makeBook } from "./view.js";
import { useBookStore } from "../store/bookStore.js";
import EventBus from "../common/EventBus";
const path = window.require("path");
const fs = window.require("fs");
const { ipcRenderer } = window.require("electron");
const $ = document.querySelector.bind(document);

let bookId = 0;
const locales = "en";
const listFormat = new Intl.ListFormat(locales, {
  style: "short",
  type: "conjunction",
});

const formatLanguageMap = (x) => {
  if (!x) return "";
  if (typeof x === "string") return x;
  const keys = Object.keys(x);
  return x[keys[0]];
};

const formatOneContributor = (contributor) =>
  typeof contributor === "string"
    ? contributor
    : formatLanguageMap(contributor?.name);

const formatContributor = (contributor) =>
  Array.isArray(contributor)
    ? listFormat.format(contributor.map(formatOneContributor))
    : formatOneContributor(contributor);

/**
 * 保存封面到本地
 * @param {*} coverData string base64 格式
 * @param {*} coverPath string 保存路径
 * @returns void
 */
const saveCoverToLocal = (coverData, coverPath) => {
  return new Promise((resolve, reject) => {
    const base64Data = coverData.split(",")[1];
    const fileBuffer = Buffer.from(base64Data, "base64");
    fs.writeFile(coverPath, fileBuffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(coverPath);
      }
    });
  });
};

export const open = async (file) => {
  return new Promise(async (resolve, reject) => {
    console.log("file", file);
    const timestamp = Date.now();
    const ext = file.name.match(/\.([^.]+)$/)?.[1] || "";
    const book = await makeBook(file);
    console.log("book", book);
    const coverDir = ipcRenderer.sendSync("get-cover-dir", "ping");
    let coverPath = "";
    if (book.metadata.cover) {
      coverPath = path.join(coverDir, timestamp + ".jpg");
      await saveCoverToLocal(book.metadata.cover, coverPath);
    }
    //把文件信息添加到数据库中
    ipcRenderer.send("db-insert-book", {
      title: book.metadata.title,
      author: book.metadata.author,
      description: book.metadata.description,
      cover: coverPath,
      path: file.path,
    });
    ipcRenderer.once("db-insert-book-response", (event, res) => {
      bookId = res.bookId;
      createLeftMenu(book, bookId);
      insertChapter(book, bookId).then(() => {
        console.log("bookId", bookId);
        const firstChapter = ipcRenderer.sendSync("db-first-chapter", bookId);
        console.log("firstChapter", firstChapter);
        resolve(firstChapter);
      });
    });
  });
};

// 定义一个函数来提取 HTML 字符串中的纯文本
const getTextFromHTML = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return doc.body.textContent || "";
};

// 插入章节以及内容加入数据库
const insertChapter = async (book, bookId) => {
  try {
    const sectionInfoArray = await Promise.all(
      book.sections.map(async (section) => {
        const doc = await section.createDocument();
        return [section.id, getTextFromHTML(doc.documentElement.outerHTML)];
      })
    );
    // console.log("sectionInfoArray", sectionInfoArray);
    const sectionInfoMap = Object.fromEntries(sectionInfoArray);

    const insertTocItem = async (item) => {
      let newTocItem = { ...item }; // 复制 item 的属性
      if (sectionInfoMap[item.href]) {
        newTocItem.html = sectionInfoMap[item.href];
        try {
          await new Promise((resolve, reject) => {
            ipcRenderer.send("db-insert-chapter", {
              title: newTocItem.label,
              href: newTocItem.href,
              content: newTocItem.html,
              bookId: bookId,
            });
            // 监听插入响应
            ipcRenderer.once("db-insert-chapter-response", (event, res) => {
              if (res.success) {
                resolve();
              } else {
                reject(new Error(`插入失败: ${res.message}`));
              }
            });
          });
        } catch (err) {
          console.error("插入章节数据失败:", err);
        }
      }
      if (item.subitems) {
        for (const subitem of item.subitems) {
          await insertTocItem(subitem);
        }
      }
    };
    // 串行处理每个 toc 项
    for (const tocItem of book.toc) {
      await insertTocItem(tocItem);
    }
  } catch (err) {
    console.error("处理文件时出错:", err);
  }
};

//生成目录
const createLeftMenu = (book, bookId) => {
  const bookStore = useBookStore(); // 获取 tocStore 实例
  bookStore.setToc(book.toc); // 将 toc 数据保存到 tocStore 中
  const metaData = {
    bookId: bookId,
    title: book.metadata.title,
    author: book.metadata.author,
    description: book.metadata.description,
  };
  bookStore.setMetaData(metaData); // 将 metaData 数据保存到 tocStore 中

  const title = formatLanguageMap(book.metadata?.title) || "Untitled Book";
  $("#side-bar-cover").src = "";
  $("#side-bar-title").innerText = title;
  $("#side-bar-author").innerText = formatContributor(book.metadata?.author);
  Promise.resolve(book.getCover?.())?.then((blob) =>
    blob ? ($("#side-bar-cover").src = URL.createObjectURL(blob)) : null
  );
  if (book.toc.length > 0) {
    EventBus.emit("updateToc", book.toc[0].href);
  }
};
