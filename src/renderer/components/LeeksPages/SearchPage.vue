<template>
  <div id="searchPanel">
    <div style="height: 40px">
      <el-input
          placeholder="请输入查询关键字"
          v-model="searchText"
          class="input-with-select"
      >
        <el-select v-model="select" slot="prepend" placeholder="请选择" @change="selectChange">
          <el-option label="A股" value="gp"></el-option>
          <el-option label="港股" value="hk"></el-option>
          <el-option label="基金" value="fund"></el-option>
<!--          <el-option label="期货" value="futu"></el-option>-->
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
        <div v-for="val in tableDataList" :key="val.code" class="text item" >
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
              style="float: right; padding: 1px 0; border: none;"
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
import {searchStockTx, searchStockSina} from "../../api/api";

export default {
  name: "search-page",
  props: {
    fundCodes: Array,
    aStockCodes: Array,
    hkStockCodes: Array,
    futuCodes: Array,
    addSelect: {type: Function},
    removeSelect: {type: Function}
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
    selectChange() {
      this.tableDataList = new Array();
    },
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
        this.searchStock('jj', this.fundCodes)
      } else if (this.select === "futu") {
        // 搜索基金
        this.searchFutu()
      }
    },
    searchFutu() {
      searchStockSina(this.searchText, this.select).then((res) => {
        const searchResList = res.data.replace('var suggestvalue=', '').replaceAll('"','').split(';');
        console.log(searchResList)
        searchResList.forEach((item) => {
          if (item === '') {
            return;
          }
          const itemList = item.split(",");
          this.tableDataList.push({
            code: itemList[0],
            name: itemList[2] + ' | ' + itemList[4] + ' | ' + itemList[0],
            isExist: this.futuCodes.indexOf(itemList[0] + itemList[1]) >= 0
          })
        })
      }).catch((error) => {
        console.log(error);
        this.$message.error("搜索失败");
      });
    },
    searchStock(type, existCode) {
      searchStockSina(this.searchText, type).then((res) => {
          this.tableDataList =  res;
      }).catch((error) => {
        console.log(error);
        this.$message.error("搜索失败");
      });

      // 搜索股票
      // searchStockTx(this.searchText, type).then((res) => {
      //   this.tableDataList =  res;
      // }).catch((error) => {
      //   console.log(error);
      //   this.$message.error("搜索失败");
      // });
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
#searchPanel .el-select .el-input {
  width: 80px;
}

#searchPanel .input-with-select .el-input-group__prepend {
  background-color: #fff;
}

#searchPanel .text {
  font-size: 14px;
}

#searchPanel .item {
  padding: 8px 0;
}

#searchPanel .box-card {
  width: 100%;
}
</style>
