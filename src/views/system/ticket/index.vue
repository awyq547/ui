<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="出发地点" prop="placeBegin">
        <el-input
          v-model="queryParams.placeBegin"
          placeholder="请输入出发地点"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="到达地点" prop="placeEnd">
        <el-input
          v-model="queryParams.placeEnd"
          placeholder="请输入到达地点"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="出发时间" prop="timeBegin">
        <el-date-picker clearable
          v-model="queryParams.timeBegin"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择出发时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="到达时间" prop="timeEnd">
        <el-date-picker clearable
          v-model="queryParams.timeEnd"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择到达时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="交通工具" prop="vehicle">
        <el-select v-model="queryParams.vehicle" placeholder="请选择交通工具" clearable>
          <el-option
            v-for="dict in dict.type.vehicle"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>


      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:ticket:add']"
        >新增</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="el-icon-edit"-->
<!--          size="mini"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['system:ticket:edit']"-->
<!--        >修改</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="el-icon-delete"-->
<!--          size="mini"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['system:ticket:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ticketList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="工号" align="center" prop="userName" />
      <el-table-column label="出发地点" align="center" prop="placeBegin" />
      <el-table-column label="到达地点" align="center" prop="placeEnd" />
      <el-table-column label="出发时间" align="center" prop="timeBegin" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.timeBegin, '{y}-{m}-{d}') }}</span>
          <p>{{parseTime(scope.row.timeBegin,'{h}:{m}:{s}')}}</p>
        </template>
      </el-table-column>
      <el-table-column label="到达时间" align="center" prop="timeEnd" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.timeEnd, '{y}-{m}-{d}') }}</span>
          <p>{{parseTime(scope.row.timeEnd,'{h}:{m}:{s}')}}</p>
        </template>
      </el-table-column>
      <el-table-column label="交通工具" align="center" prop="vehicle">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.vehicle" :value="scope.row.vehicle"/>
        </template>
      </el-table-column>
      <el-table-column label="出差说明" align="center" prop="explain" />
      <el-table-column label="出差类型" align="center" prop="travelType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.travel_type" :value="scope.row.travelType"/>
        </template>
      </el-table-column>

      <el-table-column label="车票照片" align="center" prop="img" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.img" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="车票金额" align="center" prop="amount" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:ticket:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            v-if="scope.row.travelId == -1"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:ticket:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改车票对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="出发地点" prop="placeBegin">
          <el-input v-model="form.placeBegin" placeholder="请输入出发地点"/>
        </el-form-item>
        <el-form-item label="到达地点" prop="placeEnd">
          <el-input v-model="form.placeEnd" placeholder="请输入到达地点" />
        </el-form-item>
        <el-form-item label="出发时间" prop="timeBegin">
          <el-date-picker clearable
            v-model="form.timeBegin"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            align="right"
            placeholder="请选择出发时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="到达时间" prop="timeEnd">
          <el-date-picker clearable
            v-model="form.timeEnd"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择到达时间"
            align="right">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="交通工具" prop="vehicle">
          <el-select v-model="form.vehicle" placeholder="请选择交通工具">
            <el-option
              v-for="dict in dict.type.vehicle"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出差类型" prop="travelType">
          <el-select v-model="form.travelType" placeholder="请选择出差类型">
            <el-option
              v-for="dict in dict.type.travel_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="出差说明" prop="explain">
          <el-input v-model="form.explain" type="textarea" placeholder="请输入内容" />
        </el-form-item>

        <el-form-item label="车票照片" prop="img">
          <image-upload v-model="form.img"/>

        </el-form-item>

        <el-form-item label="车票金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入车票金额" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTicket, getTicket, delTicket, addTicket, updateTicket } from "@/api/system/ticket";
import {parseTime} from "../../../utils/ruoyi";

export default {
  name: "Ticket",
  dicts: ['img_tag', 'vehicle','travel_type'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 车票表格数据
      ticketList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: null,
        placeBegin: null,
        placeEnd: null,
        timeBegin: null,
        timeEnd: null,
        vehicle: null,
        totalAmount: null,
        explain: null,
        type: null,
        travelType: null,
        imgTag: null,
        img: null,
        travelId: null,
        amount: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        timeEnd:[
          {require:true,messaage:'',trigger:'change'},
          {validator:this.checkTime,trigger: 'change'}
        ],
        placeEnd:[
          {require:true,messaage:'',trigger:'blur'},
          {validator:this.checkPlace,trigger: 'change'}
        ],
        placeBegin:[
          {require:true,messaage:'',trigger:'blur'}
        ],
        timeBegin:[
          {require:true,messaage:'',trigger:'change'}
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    parseTime,
    //校验地点
    checkPlace(rule,value,callback){
      if(!value){
        callback(new Error(''));
      }else{
        if(this.form.placeBegin.trim() == ''){
          callback(new Error(''))
        }else if(this.form.placeBegin.trim() == value.trim()){
          callback(new Error('返回地点不能和出发地点相同'))
        }else{
          callback();
        }
      }
    },
    //校验时间
    checkTime(rule,value,callback){

      if(!value){
        callback(new Error(''));
      }else{
        if(!this.form.timeBegin){
          callback(new Error(''))
        }else if(Date.parse(this.form.timeBegin) >= Date.parse(value)){
          callback(new Error('返回时间必须大于出发时间'))
        }else{
          callback();
        }
      }

    },
    /** 查询车票列表 */
    getList() {
      this.loading = true;
      listTicket(this.queryParams).then(response => {
        this.ticketList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        userName: null,
        placeBegin: null,
        placeEnd: null,
        timeBegin: null,
        timeEnd: null,
        vehicle: null,
        totalAmount: null,
        travelType: null,
        explain: null,
        type: null,
        imgTag: null,
        img: null,
        travelId: null,
        amount: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    // handuploadchang(file,fileLists){
    //   console.log(file)
    //   console.log(fileLists)
    //   console.log(URL.createObjectURL(file.raw))
    //   console.log(document.getElementsByClassName("el-upload__input")[0].value)
    // },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加车票";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTicket(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改车票";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTicket(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTicket(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除车票编号为"' + ids + '"的数据项？').then(function() {
        return delTicket(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/ticket/export', {
        ...this.queryParams
      }, `ticket_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
