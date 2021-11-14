<template>
  <div style="height: 100%">
    <div style="height: 40px">
      <el-input
        placeholder="请输入内容"
        v-model="seatchText"
        class="input-with-select"
      >
        <el-select v-model="select" slot="prepend" placeholder="请选择">
          <el-option label="股票" value="stock"></el-option>
          <el-option label="基金" value="fund"></el-option>
        </el-select>
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="searchBtn"
        ></el-button>
      </el-input>
    </div>
    <div style="height: 100%">
      <el-card class="box-card" v-show="tableDataList.length > 0">
        <div v-for="val in tableDataList" :key="val.code" class="text item">
          <span> {{ val.name }} </span
          ><el-button
            icon="el-icon-plus"
            style="float: right; padding: 3px 0; border: none"
            @click="addZx(val.code)"
          ></el-button>
        </div>
      </el-card>
      <!-- <el-table style=""  v-bind="tableDataList">
        <el-table-column prop="date1" label="日期" width="180">
        </el-table-column>
        <el-table-column prop="name1" label="姓名" width="180">
        </el-table-column>
        <el-table-column prop="address1" label="地址"> </el-table-column>
      </el-table> -->
    </div>
  </div>
</template>

<script>
import { searchStockSina,searchStockTx } from "../../api/api";
export default {
  name: "search-page",
  data() {
    return {
      select: "stock",
      seatchText: "",
      showHeader: true,
      tableDataList: [],
    };
  },
  mounted: function () {},
  methods: {
    searchBtn() {
      if (this.seatchText === "") {
        return;
      }
      if (this.select === "stock") {
        // 搜索股票
        searchStockTx(this.seatchText)
          .then((res) => {
            console.log(res.data);
          })
          .catch((error) => {
            console.log(error);
            this.$message.error("搜索股票失败");
          });
      } else if (this.select === "fund") {
        // 搜索基金
      }
    },
    addZx(val) {
      console.log(val);
    },
  },
};
</script>

<style>
.el-select .el-input {
  width: 80px;
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
.text {
  font-size: 14px;
}

.item {
  padding: 8px 0;
}

.box-card {
  width: 100%;
}
</style>
