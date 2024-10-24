<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入任务名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="交接人" prop="toWho">
        <el-input v-model="queryParams.toWho" placeholder="请输入交接人" clearable @keyup.enter="handleQuery" />
      </el-form-item> -->
      <el-form-item label="截止时间" prop="endTime">
        <el-date-picker clearable v-model="queryParams.endTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择截止时间">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 100px;">
          <el-option v-for="dict in statusList" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="完成时间" style="width: 308px">
        <el-date-picker v-model="daterangeFinishTime" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>

      <el-form-item label="添加时间" style="width: 308px">
        <el-date-picker v-model="daterangeAddTime" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>

      <el-form-item label="任务类型" align="center" prop="typeId">
        <el-select v-model="queryParams.typeId" placeholder="请选择任务类型" clearable style="width: 200px;">
          <el-option v-for="ty in typeList" :key="ty.id" :label="ty.name" :value="ty.id" />
        </el-select>

      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['task:task:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['task:task:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['task:task:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['task:task:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">

      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="任务类型" align="center" prop="typeName" width="100">
        <template v-slot="scope">
          {{ getNameById(scope.row.typeId) }}
        </template>
      </el-table-column>

      <el-table-column label="任务名" align="center" prop="name" width="500" />

      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <span :style="{ color: scope.row.status === 1 ? 'green' : 'red' }">
            {{ statusList[scope.row.status].label }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="截止时间" align="center" prop="endTime" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{m}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="完成时间" align="center" prop="finishTime" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.finishTime, '{y}-{m}-{d} {h}:{m}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" align="center" prop="addTime" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.addTime, '{y}-{m}-{d} {h}:{m}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" style="width:100px;">
        <template #default="scope">

            <el-button v-if="scope.row.status == 0" type="success" icon="check" @click="handle_finish_unfinish(scope.row)"
              v-hasPermi="['task:task:edit']" style="color: #d4e4c3; font-weight: bold;">  
              完成任务
            </el-button>

            <el-button v-else type="danger" icon="close" @click="handle_finish_unfinish(scope.row)"
              v-hasPermi="['task:task:edit']" style="color: #ebc6c6; font-weight: bold;">  
              取消完成
            </el-button>
  
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['task:task:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['task:task:remove']">删除</el-button>
       </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改任务对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="taskRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="任务名" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名" />
        </el-form-item>
        <!-- <el-form-item label="种类ID" prop="typeId">
          <el-input v-model="form.typeId" placeholder="请输入种类ID" />
        </el-form-item> -->
        <el-form-item label="任务类型" prop="typeId">
          <el-select v-model="form.typeId" placeholder="请选择任务类型">
            <el-option v-for="type in typeList" :key="type.id" :label="type.name" :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" prop="endTime">
          <el-date-picker clearable v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm"
            placeholder="请选择截止时间">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="接收通知" prop="wxNoticeFrom">
          <el-input v-model="form.wxNoticeFrom" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="交接人" prop="toWho">
          <el-input v-model="form.toWho" placeholder="请输入交接人" />
        </el-form-item>
        <el-form-item label="发出通知" prop="wxNoticeTo">
          <el-input v-model="form.wxNoticeTo" type="textarea" placeholder="请输入内容" />
        </el-form-item>

        <!-- <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option v-for="dict in statusList" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item> -->

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Task">
import { listTaskAll, getTask, delTask, addTask, updateTask, finishTask, unfinishTask } from "@/api/task/task";

const { proxy } = getCurrentInstance();

const taskList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeFinishTime = ref([]);
const daterangeAddTime = ref([]);

const statusList = ref(
  [
    { value: 0, label: "待完成" },
    { value: 1, label: "已完成" },
  ]
)



const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    wxNoticeFrom: null,
    toWho: null,
    wxNoticeTo: null,
    endTime: null,
    status: null,
    finishTime: null,
    addTime: null,
    typeId: null
  },
  rules: {
    name: [
      { required: true, message: "任务名不能为空", trigger: "blur" }
    ],
    endTime: [
      { required: true, message: "截止时间不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);




// ---------列表----------改造typeId为type的name---------------------
import { listType } from "@/api/task/type";
// 给个存储容器
const typeList = ref([]);
// 根据 ID 返回名称
function getNameById(id) {
  const type = typeList.value.find(item => item.id === id);
  return type ? type.name : '未知类型';
}
/** 获取任务类型  的列表 */
function getTypes() {
  listType().then(response => {
    typeList.value = response.rows;
  });
}
//初始时填充容器
getTypes();
// ------------------------------------------------------------------


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
  queryParams.value.params = {};
  if (null != daterangeFinishTime && '' != daterangeFinishTime) {
    queryParams.value.params["beginFinishTime"] = daterangeFinishTime.value[0];
    queryParams.value.params["endFinishTime"] = daterangeFinishTime.value[1];
  }
  if (null != daterangeAddTime && '' != daterangeAddTime) {
    queryParams.value.params["beginAddTime"] = daterangeAddTime.value[0];
    queryParams.value.params["endAddTime"] = daterangeAddTime.value[1];
  }
  listTaskAll(queryParams.value).then(response => {
    taskList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    wxNoticeFrom: null,
    toWho: null,
    wxNoticeTo: null,
    endTime: null,
    status: null,
    finishTime: null,
    addTime: null,
    typeId: null
  };
  proxy.resetForm("taskRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeFinishTime.value = [];
  daterangeAddTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加任务";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTask(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改任务";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["taskRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTask(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTask(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除任务编号为"' + _ids + '"的数据项？').then(function () {
    return delTask(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('task/taskAll/export', {
    ...queryParams.value
  }, `task_${new Date().getTime()}.xlsx`)
}

getList();
</script>
