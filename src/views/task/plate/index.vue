<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="板块名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入板块名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="责任人" prop="dutyuser">
        <el-input v-model="queryParams.dutyuser" placeholder="请输入责任人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['task:plate:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['task:plate:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['task:plate:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['task:plate:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="plateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="板块ID" align="center" prop="id" />
      <el-table-column label="板块名" align="center" prop="name" />
      <el-table-column label="责任人" align="center" prop="dutyuser" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['task:plate:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['task:plate:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改任务板块对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="plateRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="板块名" prop="name">
          <el-input v-model="form.name" placeholder="请输入板块名" />
        </el-form-item>
        <el-form-item label="责任人" prop="dutyuser">
          <el-input v-model="form.dutyuser" placeholder="请输入责任人" />
        </el-form-item>
        <el-divider content-position="center">任务类型信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddType">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteType">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="typeList" :row-class-name="rowTypeIndex" @selection-change="handleTypeSelectionChange"
          ref="type">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="类型名称" prop="name" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.name" placeholder="请输入类型名称" />
            </template>
          </el-table-column>
          <el-table-column label="执行人" prop="douser" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.douser" placeholder="请输入执行人" />
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="Plate">
import { listPlate, getPlate, delPlate, addPlate, updatePlate } from "@/api/task/plate";

const { proxy } = getCurrentInstance();

const plateList = ref([]);
const typeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedType = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    dutyuser: null
  },
  rules: {
    name: [
      { required: true, message: "板块名不能为空", trigger: "blur" }
    ],
    dutyuser: [
      { required: true, message: "责任人不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询任务板块列表 */
function getList() {
  loading.value = true;
  listPlate(queryParams.value).then(response => {
    plateList.value = response.rows;
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
    dutyuser: null
  };
  typeList.value = [];
  proxy.resetForm("plateRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
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
  title.value = "添加任务板块";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPlate(_id).then(response => {
    form.value = response.data;
    typeList.value = response.data.typeList;
    open.value = true;
    title.value = "修改任务板块";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["plateRef"].validate(valid => {
    if (valid) {
      form.value.typeList = typeList.value;
      if (form.value.id != null) {
        updatePlate(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPlate(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除任务板块编号为"' + _ids + '"的数据项？').then(function () {
    return delPlate(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 任务类型序号 */
function rowTypeIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 任务类型添加按钮操作 */
function handleAddType() {
  let obj = {};
  obj.name = "";
  obj.douser = "";
  typeList.value.push(obj);
}

/** 任务类型删除按钮操作 */
function handleDeleteType() {
  if (checkedType.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的任务类型数据");
  } else {
    const types = typeList.value;
    const checkedTypes = checkedType.value;
    typeList.value = types.filter(function (item) {
      return checkedTypes.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleTypeSelectionChange(selection) {
  checkedType.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('task/plate/export', {
    ...queryParams.value
  }, `plate_${new Date().getTime()}.xlsx`)
}

getList();
</script>
