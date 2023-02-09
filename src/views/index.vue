<template>
  <div class="app-container home">
    <el-card class="box-card" style="border: #1e1e1e" shadow="hover">
      <div slot="header" class="clearfix">
            <span><el-button type="primary" round>流程待办</el-button></span>
      </div>

        <div  class="text item">
            <router-link to="/reimbursement" tag="li" active-class="current" exact>
              <label v-text="text" class="mtext"></label>
            <a><el-link type="primary"  style="left: 10px" v-if="vif">点此前往</el-link></a>
          </router-link>
        </div>

    </el-card>
  </div>
</template>
<script>


import {
  getmsg
} from "@/api/system/reimbursement";
export default {
  name: "Index",
  data() {
    return {
      // 版本号
      version: "3.8.5",
      text:"暂无待办事项",
      vif:false
    };
  },
  created() {
    this.getmsg();
  },
  methods: {
    getmsg(){
      getmsg().then(res =>{
        if(res == null || res == ''){

          return;
        }
        if(res.isM){
          if(res.count > 0){
            this.text='您有'+res.count+'条差旅信息待审批';
            this.vif = true;
          }
        }else{
            if(res.count > 0){
              this.text='您有'+res.count+'条差旅信息被驳回';
              this.vif = true;
            }
        }
      })
    },
    goTarget(href) {
      window.open(href, "_blank");
    }
  }
};
</script>

<style scoped lang="scss">


.el-card ::v-deep .el-card__header{
  padding: 2px 10px;
  background-color: rgb(21, 122, 242,0.1);
}
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}

.box-card {
  width: 480px;
  height: 300px;
}




.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

