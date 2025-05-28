const { ipcMain } = require("electron");
const {
  insertBook,
  insertChapter,
  getFirstChapter,
  getChapter,
  getChapters,
  updateChapter,
} = require("../dbtool.js");

const dbHandle = () => {
  ipcMain.on("db-insert-book", (event, book) => {
    console.log("db-insert-book", book);
    insertBook(book, event);
  });
  ipcMain.on("db-insert-chapter", (event, chapter) => {
    insertChapter(chapter, event);
  });
  ipcMain.on("db-first-chapter", (event, bookId) => {
    getFirstChapter(bookId, event);
  });
  ipcMain.on("db-get-chapter", (event, bookId, href) => {
    getChapter(bookId, href, event);
  });
  ipcMain.on("db-get-chapters", (event, bookId) => {
    getChapters(bookId, event);
  });

  ipcMain.on("db-update-chapter", (event, chapter) => {
    updateChapter(chapter.bookId, chapter.href, chapter.content, event);
  });
};

module.exports = dbHandle;
