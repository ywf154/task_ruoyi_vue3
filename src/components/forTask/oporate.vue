<template>


      <el-button v-if="scope.row.status == 0" type="success" icon="check" @click="handle_finish_unfinish(scope.row)"
        v-hasPermi="['task:task:edit']" style="color: #d4e4c3; font-weight: bold;">
        完成任务
      </el-button>

      <el-button v-else type="danger" icon="close" @click="handle_finish_unfinish(scope.row)"
        v-hasPermi="['task:task:edit']" style="color: #ebc6c6; font-weight: bold;">
        取消完成
      </el-button>

</template>


<script setup name="operate">
import { listTask, finishTask, unfinishTask } from "@/api/task/task";

const { proxy } = getCurrentInstance();



//完成与取消完成
function handle_finish_unfinish(obj) {
  if (obj.status == 0) {
    proxy.$modal.confirm('是否确认完成' + obj.name).then(function () {
      return finishTask(obj.id);
    }).then(() => {
      getList();
      proxy.$modal.msgSuccess("操作成功");
    })
  }
  else {
    proxy.$modal.confirm('是否确认完成' + obj.name).then(function () {
      return unfinishTask(obj.id);
    }).then(() => {
      getList();
      proxy.$modal.msgSuccess("取消成功");
    })
  }
}


/** 查询任务列表 */
function getList() {
  loading.value = true;
  listTask(queryParams.value).then(response => {
    taskList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

</script>
  