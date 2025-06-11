<script setup>
import { ref, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "../store/appStore";
import { useBookStore } from "../store/bookStore";
const { curChapter } = storeToRefs(useBookStore());
const { showEditView, hideEditView } = useAppStore();
const { editViewShow } = storeToRefs(useAppStore());
const updateLabel = () => {
  console.log("updateChapter", curChapter.value);
};
</script>
<template>
  <el-dialog v-model="editViewShow" title="修改标题" width="500">
    <el-form>
      <el-form-item label="标题名">
        <el-input v-model="curChapter.label" /> </el-form-item
    ></el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="hideEditView">关闭</el-button>
        <el-button type="primary" @click="updateLabel"> 修改 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style>
.editChapter {
  position: fixed;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 203;
}
.edit-musk {
  position: absolute;
  margin: auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 0px 6px #666;
}

.edit-dilog {
  width: 265px;
  height: 150px;
  gap: 10px;
  background: #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.btns {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
</style>
