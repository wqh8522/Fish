<template>
  <!-- <div id="wrapper"> -->
  <el-container id="out">
    <el-container>
      <el-container style="width: 1px; width: 23%;border-right: 1px solid rgb(238, 238, 238);">
        <el-header style="height: 40px; border-top: 1px solid #eee"
        ><i class="el-icon-plus" @click="search"
        /></el-header>
        <el-aside>
          <el-menu :default-openeds="['1', '2']">
            <el-submenu index="1">
              <template slot="title"
              >FUND <i class="el-icon-refresh-right" @click="refreshFund"
              /></template>
              <!-- <i class="el-icon-message"></i> -->
              <el-menu-item
                  v-for="(val, index) in fundQuotList"
                  :index="val.code"
                  :key="index"
              ><i :class="val.isDown ? downClass : upClass"/>&nbsp;&nbsp;{{
                  val.zd
                }}&nbsp;&nbsp;&nbsp;{{ val.name }}
              </el-menu-item
              >
            </el-submenu>
            <el-submenu index="2">
              <template slot="title"
              >STOCK
                <span>
                  <i
                      class="el-icon-refresh-right"
                      @click="refreshStock"/></span
                ></template>
              <el-menu-item
                  v-for="(val, index) in stockQuotList"
                  :index="val.code"
                  :key="index"
              >
                <i :class="val.isDown ? downClass : upClass"/>&nbsp;&nbsp;{{
                  val.zd
                }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{
                  val.price
                }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{
                  val.name
                }}
              </el-menu-item
              >
            </el-submenu>
          </el-menu>
        </el-aside>

      </el-container>
      <el-main style="height: 99%;  width: 60%">
        <search-page v-show="showSearchStockPanel"
                     v-bind:fund-codes="fundCodes"
                     v-bind:stock-codes="stockCodes"
                     v-bind:add-select="addSelect"></search-page>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {getStockQuotTx, getFundQuot} from "../../api/api";
import vPinyin from "../../utils/Piny";
import SearchPage from "./SearchPage.vue";

export default {
  name: "leeks-index-page",
  components: {SearchPage},
  data() {
    return {
      upClass: "el-icon-arrow-up",
      downClass: "el-icon-arrow-down",
      hideMode: false,
      fundCodes: ["005953", "001071", "007028", "320007", "161726"],
      stockCodes: ["sh000001", "sh000300", "sz399001", "sz399006"],
      fundQuotList: [],
      stockQuotList: [],
      showSearchStockPanel: true,
    };
  },
  mounted: function () {
    this.refreshStock();
    this.refreshFund();
  },
  methods: {
    open(link) {
      this.$electron.shell.openExternal(link);
    },
    search() {
      this.showSearchStockPanel = true;
    },
    addSelect(code, selectType) {
      console.log(code, selectType)
      if (code !== '') {
        this.stockCodes.push(code);
        this.refreshStock();
      }
    },
    refreshFund() {
      getFundQuot(this.fundCodes.join(","))
          .then((response) => {
            this.fundQuotList = new Array();

            const fundQuotDatas = response.data.Datas;
            console.log(fundQuotDatas);
            if (fundQuotDatas.length > 0) {
              fundQuotDatas.forEach((element, index, array) => {
                const name = this.hideMode
                    ? vPinyin.chineseToPinYin(element.SHORTNAME)
                    : element.SHORTNAME;
                const zd = isNaN(Number(element.GSZZL))
                    ? Number(element.NAVCHGRT)
                    : Number(element.GSZZL);
                this.fundQuotList.push({
                  code: element.FCODE,
                  name: "「" + name + "」",
                  zd: zd,
                  isDown: zd < 0,
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
            this.$message.error("属性基金数据失败！");
          });
    },
    refreshStock() {
      getStockQuotTx(this.stockCodes.join(","))
          .then((response) => {
            this.stockQuotList = new Array();
            var datas = response.data.split("\n");
            if (datas.length > 0) {
              datas.forEach((data) => {
                if (data === null || data === "") {
                  return;
                }
                let oneStock = data.split("~");
                let code = oneStock[0].replace("v_", "");
                const name = this.hideMode
                    ? vPinyin.chineseToPinYin(oneStock[1])
                    : oneStock[1];
                this.stockQuotList.push({
                  code: code.substr(0, code.lastIndexOf("=")),
                  name: "「" + name + "」",
                  zd: oneStock[32],
                  isDown: oneStock[32].startsWith("-"),
                  price: oneStock[32],
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
            this.$message.error("属性股票数据失败！");
          });
    }

  },
};
</script>

<style>
#wrapper {
  max-height: 100%;
}

#out {
  height: 99%;
  border: 1px solid #eee;
  border-radius: 5px;
}

.el-submenu {
  border-bottom: 1px solid #eee;
  border-right: none;
  /* height: 25px; */
}

.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 30px;
}

.el-aside {
  color: #eee;
  background-color: white;
  /* background-color: rgb(238, 241, 246);  */
  height: 95%;
  width: auto !important;
  border-right: none;
}

.el-submenu__title {
  padding-left: 5px !important;
  line-height: 30px;
  height: 30px;
  font-size: 12px;
}

.el-menu {
  border-right: none;
}

.el-submenu .el-menu-item {
  padding-left: 10px !important;
  line-height: 30px;
  height: 30px;
}

.el-footer {
  padding: 5px 0px 0px 6px;
  height: 35px;
  border-bottom: 1px solid rgb(238, 238, 238);

}

/* .el-submenu > i {
  font-size: 14px;
} */
</style>
