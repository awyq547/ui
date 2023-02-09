<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="出发时间" prop="timeBegin">
        <el-date-picker clearable
                        v-model="queryParams.timeBegin"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="请选择出发时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="到达时间" prop="timeEnd">
        <el-date-picker clearable
                        v-model="queryParams.timeEnd"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="请选择到达时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="出差天数" prop="days">
        <el-input
          v-model="queryParams.days"
          placeholder="请输入出差天数"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item label="出差说明" prop="remake">-->
<!--        <el-input-->
<!--          v-model="queryParams.remake"-->
<!--          placeholder="请输入出差说明"-->
<!--          clearable-->
<!--          @keyup.enter.native="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item label="报销时间" prop="timeReimbursement">
        <el-date-picker clearable
                        v-model="queryParams.timeReimbursement"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="请选择报销时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="补助金额" prop="amountSubsidy">
        <el-input
          v-model="queryParams.amountSubsidy"
          placeholder="请输入补助金额"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="报销总额" prop="amountAll">
        <el-input
          v-model="queryParams.amountAll"
          placeholder="请输入报销总额"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['system:reimbursement:add']"
        >新增
        </el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="el-icon-edit"-->
<!--          size="mini"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['system:reimbursement:edit']"-->
<!--        >修改-->
<!--        </el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="el-icon-delete"-->
<!--          size="mini"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['system:reimbursement:remove']"-->
<!--        >删除-->
<!--        </el-button>-->
<!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="reimbursementList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" align="center" width="50px">
        <template slot-scope="scope">
          {{scope.$index +1}}
        </template>
      </el-table-column>
      <el-table-column label="单据编号" align="center" prop="id"/>
      <el-table-column label="出差天数" align="center" prop="days"/>
<!--      <el-table-column label="出差说明" align="center" prop="remake"/>-->
      <el-table-column label="报销时间" align="center" prop="timeReimbursement" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.timeReimbursement, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="补助金额" align="center" prop="amountSubsidy"/>
      <el-table-column label="报销总额" align="center" prop="amountAll"/>
      <el-table-column label="报销进度" align="center" prop="approval">
        <template slot-scope="scope">
<!--          <dict-tag :options="dict.type.check" :value="scope.row.approval"/>-->
          <el-steps :space="200"  :active="getStep(scope.row.approval +1 )" :process-status="getStepStatus(scope.row.approval +1)" finish-status="success">
            <el-step title="员工填写" ></el-step>
            <el-step title="部门审批"></el-step>
            <el-step title="财务审批"></el-step>
            <el-step title="领导审批"></el-step>
          </el-steps>
        </template>
      </el-table-column>
      <el-table-column label="驳回原因" align="center" prop="remake"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-info"
            @click="handleCheck(scope.row)"
          >查看
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-if="scope.row.approval == 0"
            v-hasPermi="['system:reimbursement:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="scope.row.approval == 0"
            v-hasPermi="['system:reimbursement:remove']"
          >删除
          </el-button>

          <el-popconfirm
            title="确定通过吗？"
            @confirm="handleCheckYes(scope.row)"
            @onConfirm="handleCheckYes(scope.row)"
            v-if="vifcheck"
          >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-success"
              slot="reference"
              v-hasPermi="['system:reimbursement:yes']"
            >通过
            </el-button>
          </el-popconfirm>


            <el-button
              size="mini"
              type="text"
              icon="el-icon-close"
              v-if="vifcheck"
              @click="handleCheckNo(scope.row)"
              v-hasPermi="['system:reimbursement:no']"
            >驳回
            </el-button>




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

    <!-- 添加或修改reimbursement对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1200px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-col :span="6"><el-form-item label="工号" prop="userName">
            <el-input v-model="form.userName" placeholder="" disabled/>
          </el-form-item></el-col>

        </el-row >
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-form-item label="出发时间" prop="timeBegin">
            <el-date-picker clearable
                            v-model="form.timeBegin"
                            type="datetime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            disabled="disabled"
                            placeholder="请选择出发时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="返回时间" prop="timeEnd">
            <el-date-picker clearable
                            v-model="form.timeEnd"
                            type="datetime"
                            disabled="disabled"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            placeholder="请选择到达时间">
            </el-date-picker>
          </el-form-item>
        </el-row>
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-form-item label="出差天数" prop="days">
            <el-input v-model="form.days" disabled placeholder="出差天数"/>
          </el-form-item>
          <el-form-item label="补助金额" prop="amountSubsidy">
            <el-input v-model="form.amountSubsidy" disabled placeholder="补助金额"/>
          </el-form-item>
        </el-row>
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-form-item label="报销时间" prop="timeReimbursement">
            <el-date-picker clearable
                            v-model="form.timeReimbursement"
                            type="datetime"
                            disabled="disabled"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            placeholder="请选择报销时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="报销总额"  prop="amountAll">
            <el-input v-model="form.amountAll" disabled placeholder="报销总额"/>
          </el-form-item>
        </el-row>
<!--        <el-row type="flex" class="row-bg" justify="start" :gutter="20">-->

<!--          <el-col :span="12" :offset="3">-->
<!--            <el-form-item label="出差说明" prop="remake">-->
<!--              <el-input v-model="form.remake" placeholder="出差说明"/>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--        </el-row>-->









        <el-divider></el-divider>
        <el-row>

          <el-col :span="20">
            <label title="差旅信息">差旅信息</label>
          </el-col>
          <el-col :span="3">
            <el-button type="primary" @click="selectTicket" >选择车票信息</el-button>
          </el-col>

        </el-row>


<!--        选择车票表格-->
<!--        **************************-->
        <el-row>
          <el-table v-loading="selectLoding" :data="selecttickets" :default-sort = "{prop: 'timeBegin', order: 'ascending'}">
<!--            <el-table-column type="selection" width="55" align="center" />-->
            <el-table-column label="序号" align="center" >
              <template slot-scope="scope">
                {{scope.$index +1}}
              </template>
            </el-table-column>
            <el-table-column label="出发地点" align="center" prop="placeBegin" />
            <el-table-column label="出发时间" align="center" prop="timeBegin" width="180">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.timeBegin, '{y}-{m}-{d}') }}</span>
                <p>{{parseTime(scope.row.timeBegin,'{h}:{m}:{s}')}}</p>
              </template>
            </el-table-column>
            <el-table-column label="到达地点" align="center" prop="placeEnd" />

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
            <el-table-column label="出差类型" align="center" prop="travelType">
              <template slot-scope="scope">
                <dict-tag :options="dict.type.travel_type" :value="scope.row.travelType"/>
              </template>
            </el-table-column>
            <el-table-column label="车票金额" align="center" prop="amount" />
            <el-table-column label="备注" align="center" prop="remark" />
          </el-table>
        </el-row>




      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


<!--    选择车票窗口-->
    <el-dialog title="旅程信息选择" :visible.sync="ticketopen" width="1200px" append-to-body>
      <el-table v-loading="ticketloding" :data="ticketList" @selection-change="handleSelectionChangeTicket">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="出差类型" align="center" prop="travelType">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.travel_type" :value="scope.row.travelType"/>
          </template>
        </el-table-column>
        <el-table-column label="出发地点" align="center" prop="placeBegin" />
        <el-table-column label="到达地点" align="center" prop="placeEnd" />
        <el-table-column label="交通工具" align="center" prop="vehicle">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.vehicle" :value="scope.row.vehicle"/>
          </template>
        </el-table-column>
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
        <el-table-column label="车票金额" align="center" prop="amount" />
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="checkTicket">确 定</el-button>
        <el-button @click="closeTicket">取 消</el-button>
      </div>
    </el-dialog>


    <!-- 审批查看对话框 -->
    <el-dialog :title="titleCheck" :visible.sync="checkOpen" width="1200px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row type="flex" class="row-bg" justify="space-around">

          <el-form-item label="单据编号" prop="userName">
            <el-input v-model="form.id" placeholder="" disabled/>
          </el-form-item>

          <el-form-item label="报销人" prop="userName">
            <el-input v-model="name" placeholder="" disabled/>
          </el-form-item>

        </el-row >
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-form-item label="出发时间" prop="timeBegin">
            <el-date-picker clearable
                            v-model="form.timeBegin"
                            type="datetime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            disabled="disabled"
                            placeholder="请选择出发时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="返回时间" prop="timeEnd">
            <el-date-picker clearable
                            v-model="form.timeEnd"
                            type="datetime"
                            disabled="disabled"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            placeholder="请选择到达时间">
            </el-date-picker>
          </el-form-item>
        </el-row>
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-form-item label="出差天数" prop="days">
            <el-input v-model="form.days" disabled placeholder="出差天数"/>
          </el-form-item>
          <el-form-item label="补助金额" prop="amountSubsidy">
            <el-input v-model="form.amountSubsidy" disabled placeholder="补助金额"/>
          </el-form-item>
        </el-row>
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-form-item label="报销时间" prop="timeReimbursement">
            <el-date-picker clearable
                            v-model="form.timeReimbursement"
                            type="datetime"
                            disabled="disabled"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            placeholder="请选择报销时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="报销总额"  prop="amountAll">
            <el-input v-model="form.amountAll" disabled placeholder="报销总额"/>
          </el-form-item>
        </el-row>
<!--        <el-row type="flex" class="row-bg" justify="start" :gutter="20">-->

<!--          <el-col :span="12" :offset="3">-->
<!--            <el-form-item label="出差说明" prop="remake">-->
<!--              <el-input v-model="form.remake" disabled placeholder="出差说明"/>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--        </el-row>-->

        <el-divider></el-divider>
        <el-row>

          <el-col :span="20">
            <label title="差旅信息">差旅信息</label>
          </el-col>

        </el-row>

        <el-row>
          <el-table v-loading="selectLoding" :data="checkList" :default-sort = "{prop: 'timeBegin', order: 'ascending'}">
            <!--            <el-table-column type="selection" width="55" align="center" />-->
            <el-table-column label="序号" align="center" >
              <template slot-scope="scope">
                {{scope.$index +1}}
              </template>
            </el-table-column>

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
<!--            <el-table-column label="出差说明" align="center" prop="explain" />-->
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
            <!--      <el-table-column label="差旅关联信息" align="center" prop="travelId">-->
            <!--        <template slot-scope="scope">-->
            <!--          <dict-tag :options="dict.type.travel_id" :value="scope.row.travelId"/>-->
            <!--        </template>-->
            <!--      </el-table-column>-->
            <el-table-column label="车票金额" align="center" prop="amount" />
          </el-table>
        </el-row>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCheckYes({id:form.id,approval:form.approval})" v-hasPermi="['system:reimbursement:yes']" v-if="vifcheck">通  过</el-button>
        <el-button @click="handleCheckNo({id:form.id})" v-hasPermi="['system:reimbursement:no']" v-if="vifcheck">驳  回</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listReimbursement,
  getReimbursement,
  delReimbursement,
  addReimbursement,
  updateReimbursement,
  getname,
  checkNo,
  getRole
} from "@/api/system/reimbursement";

import { listTicket, getTicket, delTicket, addTicket, updateTicket,checkTicket } from "@/api/system/ticket";

export default {
  name: "Reimbursement",
  dicts: ['img_tag', 'vehicle','travel_type','check'],
  data() {
    return {
      role:'',
      vifcheck:true,
      formId:null,
      name:'',
      // 遮罩层
      loading: true,
      ticketloding:true,
      selectLoding:false,
      // 选中数组
      ids: [],
      idsTicket:[],
      checkList:[],
      // 非单个禁用
      single: true,
      singleTicket:true,
      // 非多个禁用
      multiple: true,
      multipleTicket:true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // reimbursement表格数据
      reimbursementList: [],
      //选择车票窗口表格数据
      ticketList:[],
      //选中的车票
      selecttickets:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //是否显示选择车票窗口
      ticketopen:false,
      titleCheck:'差旅信息',
      checkOpen:false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: null,
        timeBegin: null,
        timeEnd: null,
        days: null,
        remake: null,
        timeReimbursement: null,
        amountSubsidy: null,
        amountAll: null,
        approval:null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    };
  },
  created() {
    this.getList();
    this.getRole();
    getname().then(res => {
      console.log(res)
        this.name = res;
    });
  },
  methods: {
    //获取步骤状态
    getStepStatus(app){

      if(app < 4){
        return "process";
      }
      if(app > 4){
        return "error";
      }
      return "process"
    },
    //获取步骤数
    getStep(app){
      if(app < 4){
        return app;
      }
      if(app > 4){
        return app-5;
      }
    },
    //获取权限字符
    getRole(){
      getRole().then(res => {
        this.role = res;
        this.vifcheck = this.role != "[common]" ;
      })
    },
    //查询车票
    selectTicket(){
      this.ticketopen = true;
      this.ticketloding = true;
      // 获取当前的用户名称
      const username = this.$store.state.user.name; //1
      var data = {travelId:-1,userName:username}
      listTicket(data).then(response => {
        this.ticketList = response.rows;
        // this.total = response.total;
        this.ticketloding = false;
      });
    },
    //校验选中车票
    checkTicket(){
      checkTicket(this.idsTicket).then(res =>{
        if(res == null || res == ''){
          this.$alert('车票验证未通过，请确认并重新选择！', '消息提醒', {
            confirmButtonText: '确定',
            callback: action => {
            }
          });
        }else{
            this.form.timeEnd = res.enddate;
            this.form.timeBegin = res.begindate;
            this.form.days = res.days;
            this.form.amountAll = res.amount;
            this.form.amountSubsidy = res.amountSubsidy;
            this.form.timeReimbursement = res.now;
            this.selecttickets = res.list;
            this.ticketopen = false;
        }
      })
    },
    closeTicket(){
        this.ticketopen = false;
    },
    /** 查询reimbursement列表 */
    getList() {
      this.loading = true;
      // this.$http.post("/123")
      listReimbursement(this.queryParams).then(response => {
        this.reimbursementList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    cancelCheck(){
      this.checkOpen = false;
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        userName: null,
        timeBegin: null,
        timeEnd: null,
        days: null,
        remake: null,
        timeReimbursement: null,
        amountSubsidy: null,
        amountAll: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        approval: null
      };
      this.resetForm("form");
    },
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
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleSelectionChangeTicket(selection){
      this.idsTicket = selection.map(item => item.id)
      this.singleTicket = selection.length !== 1
      this.multipleTicket = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      const name = this.$store.state.user.name;//1
      this.form.userName = name;
      this.title = "添加报销单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getReimbursement(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改报销单";
      });
    },
    // 审批通过
    handleCheckYes(row){
      updateReimbursement({id:row.id,approval:row.approval+1}).then(response => {
        this.$modal.msgSuccess("审批成功");
        this.checkOpen = false;
        this.getList();
      });
    },

    //驳回
    handleCheckNo(row){

      this.$prompt('请输入驳回理由', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        var approval = 4;
          if(this.role == '[manager]'){
            // value = '部门审批不通过，理由：'+value;
            approval = 5;
          }
        if(this.role == '[finance]'){
          // value = '财务审批不通过，理由：'+value;
          approval = 6;
        }
        if(this.role == '[boss]'){
          // value = '领导审批不通过，理由：'+value;
          approval = 7;
        }
          checkNo({id:row.id,value:value,approval:approval}).then(res => {
            this.$modal.msgSuccess("操作成功");
            this.checkOpen = false;
            this.getList();
          })
      }).catch(() => {

      });
    },
    //查看
    handleCheck(row) {
      this.reset();
      const id = row.id || this.ids
      this.formId = row.id
      listTicket({travelId:id}).then(response => {

        this.checkList = response.rows;
      });

      getReimbursement(id).then(response => {
        this.form = response.data;
        this.checkOpen = true;
      });

    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateReimbursement(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            this.form.list = this.selecttickets;
            addReimbursement(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除reimbursement编号为"' + ids + '"的数据项？').then(function () {
        return delReimbursement(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/reimbursement/export', {
        ...this.queryParams
      }, `reimbursement_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
