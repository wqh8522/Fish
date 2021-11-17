<template>
  <div>
    <div style="height: 40px">
      <el-input
          placeholder="请输入查询关键字"
          v-model="searchText"
          class="input-with-select"
      >
        <el-select v-model="select" slot="prepend" placeholder="请选择">
          <el-option label="A股" value="gp"></el-option>
          <el-option label="港股" value="hk"></el-option>
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
        <div v-for="val in tableDataList" :key="val.code" class="text item" pe>
          <span> {{ val.name }} </span
          >
          <el-button
              icon="el-icon-plus"
              style="float: right; padding: 3px 0; border: none"
              size="medium"
              v-show="!val.isExist"
              @click="addSelectM(val.code)"
          ></el-button>
          <el-button
              icon="el-icon-minus"
              style="float: right; padding: 3px 0; border: none"
              v-show="val.isExist"
              size="medium"
              @click="removeSelectM(val.code)"
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
import {searchStockTx} from "../../api/api";

export default {
  name: "search-page",
  props: {
    fundCodes: Array,
    aStockCodes: Array,
    hkStockCodes: Array,
    addSelect:{type: Function},
    removeSelect:{type: Function}
  },
  data() {
    return {
      select: "gp",
      searchText: "",
      showHeader: true,
      tableDataList: []
    };
  },
  mounted: function () {
  },
  methods: {
    searchBtn() {
      if (this.searchText === "") {
        return;
      }
      this.tableDataList = new Array();
      if (this.select === "gp") {
        this.searchStock('gp', this.aStockCodes)
      } else if (this.select === 'hk') {
        // 搜索港股
        this.searchStock('hk', this.hkStockCodes)
      } else if (this.select === "fund") {
        // 搜索基金
      }
    },
    searchStock(type, existCode) {
      // 搜索股票
      searchStockTx(this.searchText, type)
          .then((res) => {
            const searchResList = eval("'" + res.data + "'").replace('v_hint="', '').replace('"', '').split('^');
            if (searchResList.length <= 0 || searchResList[0] === 'N;') {
              return;
            }
            console.log(searchResList)
            searchResList.forEach((item) => {
              const itemList = item.split("~");
              this.tableDataList.push({
                code: itemList[0] + itemList[1],
                name: itemList[0] + itemList[1] + ' | ' + itemList[2] + ' | ' + itemList[3] + ' | ' + itemList[4],
                isExist: existCode.indexOf(itemList[0] + itemList[1]) >= 0
              })
            })
          }).catch((error) => {
        console.log(error);
        this.$message.error("搜索股票失败");
      });
    },
    addSelectM(val) {
      this.addSelect(val, this.select)
      this.tableDataList.forEach((item) => {
        if (item.code === val) {
          item.isExist = true;
        }
      })
    },
    removeSelectM(val) {
      this.removeSelect(val, this.select)
      this.tableDataList.forEach((item) => {
        if (item.code === val) {
          item.isExist = false;
        }
      })

    }
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
