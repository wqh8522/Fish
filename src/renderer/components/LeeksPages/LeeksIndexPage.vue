<template>
  <!-- <div id="wrapper"> -->
  <el-container id="out">
    <el-container>
      <el-container style="width: 1px; width: 23%;border-right: 1px solid rgb(238, 238, 238);">
        <el-header>
          <el-button icon="el-icon-refresh-right" size="mini" @click="refreshStock"/>
          <el-button icon="el-icon-plus" size="mini" @click="search"/>
          <el-button icon="el-icon-setting" size="mini"/>
          <el-button icon="iconfont icon-stick_icon" style="font-size: 10px" size="mini" v-show="!isTop" @click="topWin"/>
          <el-button icon="iconfont icon-quxiaozhiding" size="mini" v-show="isTop" @click="cancelTopWin"/>
        </el-header>
        <el-aside>
          <el-menu :default-openeds="['1', '2']">
            <el-submenu index="1">
              <template slot="title">FUND</template>
              <!-- <i class="el-icon-message"></i> -->
              <el-menu-item
                  v-for="(val, index) in fundQuotList"
                  :index="val.code"
                  :key="index">
                <i :class="val.isDown ? downClass : upClass"/>&nbsp;&nbsp;{{val.zd
                }}&nbsp;&nbsp;&nbsp;{{ val.name }}
              </el-menu-item
              >
            </el-submenu>
            <el-submenu index="2">
              <template slot="title"
              >STOCK
              </template>
              <el-menu-item-group title="A STOCK" v-show="aStockQuotList.length > 0">
                <el-menu-item
                    v-for="(val, index) in aStockQuotList"
                    :index="val.code"
                    :key="index">
                  <i :class="val.isDown ? downClass : upClass"/>&nbsp;&nbsp;{{
                    val.zd
                  }}&nbsp;&nbsp;&nbsp;&nbsp;{{
                    val.price
                  }}&nbsp;&nbsp;&nbsp;&nbsp;{{
                    val.name
                  }}
                </el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="HK STOCK" v-show="hkStockQuotList.length > 0">
                <el-menu-item
                    v-for="(val, index) in hkStockQuotList"
                    :index="val.code"
                    :key="index">
                  <i :class="val.isDown ? downClass : upClass"/>&nbsp;&nbsp;{{
                    val.zd
                  }}&nbsp;&nbsp;&nbsp;&nbsp;{{
                    val.price
                  }}&nbsp;&nbsp;&nbsp;&nbsp;{{
                    val.name
                  }}
                </el-menu-item>
              </el-menu-item-group>

            </el-submenu>
          </el-menu>
        </el-aside>

      </el-container>
      <el-main style="height: 99%;  width: 60%; padding-top: 0px" v-show="showSearchStockPanel">
        <el-button class="el-icon-close" size="mini" style="float: right;border:none" @click="closePanel"></el-button>
        <search-page v-bind:fund-codes="stockConfig.fundCodes"
                     v-bind:a-stock-codes="stockConfig.aStockCodes"
                     v-bind:hk-stock-codes="stockConfig.hkStockCodes"
                     v-bind:add-select="addSelect"
                     v-bind:remove-select="removeSelect"
        ></search-page>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {getStockQuotTx, getFundQuot} from "../../api/api";
import vPinyin from "../../utils/Piny";
import SearchPage from "./SearchPage.vue";
import {store} from '../../utils/configUtil';

const ipcRenderer = require('electron').ipcRenderer;

export default {
  name: "leeks-index-page",
  components: {SearchPage},

  data() {
    return {
      upClass: "el-icon-arrow-up",
      downClass: "el-icon-arrow-down",
      stockConfig: {
        hideMode: false,
        fundCodes: [],
        aStockCodes: [],
        hkStockCodes: []
      },
      isTop: false,
      fundQuotList: [],
      aStockQuotList: [],
      hkStockQuotList: [],
      showSearchStockPanel: false,
      sliderVal: 20,
      stockInterval: null,
      fundInterval: null
    };
  },
  // created(){
  //   this.worker=this.$worker.create([{
  //     message:'hello',
  //     func: function(e){
  //       console.log('hello',e);
  //       return 'hi yiye'
  //     }
  //   }])
  // },
  mounted: function () {
    const stockC = store.get('stockConfig');
    if (stockC === undefined) {
      store.set('stockConfig', this.stockConfig);
    } else {
      this.stockConfig = stockC;
    }
    this.refreshStock();
    this.refreshFund();
    this.startInterval();

  },
  methods: {
    open(link) {
      this.$electron.shell.openExternal(link);
    },
    closePanel() {
      this.showSearchStockPanel = false;
      ipcRenderer.send('asynchronous-message', 'leeks-right-close');
    },
    openSunWin() {

    },
    refreshBtnCLikck() {
      this.refreshStock();
      this.refreshFund();
    },
    cancelTopWin() {
      this.isTop = false;
    },
    topWin() {
      this.isTop = true;
    },
    search() {
      // ipcRenderer.sendSync('synchronous-message', 'leeks-right');
      // ipcRenderer.on('asynchronous-reply', (event, arg) => {})
      ipcRenderer.send('asynchronous-message', 'leeks-right-open');
      setTimeout(() => {
        this.showSearchStockPanel = true;
      }, 100);
    },
    removeSelect(code, selectType) {
      if (code !== '') {
        switch (selectType) {
          case 'gp':
            if (this.stockConfig.aStockCodes.indexOf(code) < 0) {
              return
            }
            this.stockConfig.aStockCodes.forEach((item,index,arr) => {
              if(item === code){
                arr.splice(index,1)
              }
            });
            this.refreshStock();
            store.set('stockConfig.aStockCodes', this.stockConfig.aStockCodes);
            break;
          case 'hk':
            if (this.stockConfig.hkStockCodes.indexOf(code)<0) {
              return
            }
            this.stockConfig.hkStockCodes.forEach((item,index,arr) => {
              if(item === code){
                arr.splice(index,1)
              }
            });
            this.refreshStock();
            store.set('stockConfig.hkStockCodes', this.stockConfig.hkStockCodes);
            break;
          case 'fund':
            if (this.stockConfig.fundCodes.indexOf(code)<0) {
              return
            }
            this.stockConfig.fundCodes.forEach((item,index,arr) => {
              if(item === code){
                arr.splice(index,1)
              }
            });
            this.refreshFund();
            store.set('stockConfig.fundCodes', this.stockConfig.fundCodes);
            break;
            break
        }

      }
    },
    addSelect(code, selectType) {
      console.log(code, selectType)
      if (code !== '') {
        switch (selectType) {
          case 'gp':
            if (this.stockConfig.aStockCodes.indexOf(code)>=0) {
              return
            }
            this.stockConfig.aStockCodes.push(code);
            this.refreshStock();
            store.set('stockConfig.aStockCodes', this.stockConfig.aStockCodes);
            break;
          case 'hk':
            if (this.stockConfig.hkStockCodes.indexOf(code)>=0) {
              return
            }
            this.stockConfig.hkStockCodes.push(code);
            this.refreshStock();
            store.set('stockConfig.hkStockCodes', this.stockConfig.hkStockCodes);
            break;
          case 'fund':
            if (this.stockConfig.fundCodes.indexOf(code)>=0) {
              return
            }
            this.stockConfig.fundCodes.push(code);
            this.refreshFund();
            store.set('stockConfig.fundCodes', this.stockConfig.fundCodes);
            break;
            break
        }

      }
    },
    startInterval() {
      this.stockInterval = setInterval(() => {
        this.refreshStock()
      }, 5000);
      this.fundInterval = setInterval(() => {
        this.refreshFund()
      }, 10000);
    },
    stopInterval() {
      clearInterval(this.stockInterval);
      clearInterval(this.fundInterval);
    },
    refreshFund() {
      if (this.stockConfig.fundCodes.length == 0) {
        return
      }
      getFundQuot(this.stockConfig.fundCodes.join(","))
          .then((response) => {
            this.fundQuotList = new Array();

            const fundQuotDatas = response.data.Datas;
            console.log(fundQuotDatas);
            if (fundQuotDatas.length > 0) {
              fundQuotDatas.forEach((element, index, array) => {
                const name = this.stockConfig.hideMode
                    ? vPinyin.chineseToPinYin(element.SHORTNAME)
                    : element.SHORTNAME;
                const zd = isNaN(Number(element.GSZZL))
                    ? element.NAVCHGRT
                    : element.GSZZL;
                this.fundQuotList.push({
                  code: element.FCODE,
                  name: "「" + name + "」",
                  zd: zd + "%",
                  isDown: zd.startsWith("-"),
                });
              });
            }
          })
          .catch((error) => {
            console.log(error);
            this.$message.error("刷新基金数据失败！");
          });
    },
    refreshStock() {
      if ((this.stockConfig.hkStockCodes === undefined || this.stockConfig.hkStockCodes.length  <= 0)
          && (this.stockConfig.aStockCodes === undefined || this.stockConfig.aStockCodes.length <= 0)) {
        return
      }
      let searchCode = '';
      if (this.stockConfig.aStockCodes && this.stockConfig.aStockCodes.length  > 0) {
        searchCode = this.stockConfig.aStockCodes.join(",");
      }
      searchCode += ','
      if (this.stockConfig.hkStockCodes && this.stockConfig.hkStockCodes.length  > 0) {
        searchCode += this.stockConfig.hkStockCodes.join(",");
      }
      getStockQuotTx(searchCode)
          .then((response) => {
            this.aStockQuotList = new Array();
            this.hkStockQuotList = new Array();
            var datas = response.data.split("\n");
            if (datas.length > 0) {
              datas.forEach((data) => {
                if (data === null || data === "") {
                  return;
                }
                let oneStock = data.split("~");
                if (oneStock[0].startsWith('v_pv_none_match')) {
                  return;
                }

                let code = oneStock[0].replace("v_", "");
                code = code.substr(0, code.lastIndexOf("="));
                const name = this.stockConfig.hideMode
                    ? vPinyin.chineseToPinYin(oneStock[1])
                    : oneStock[1];
                const stockQuot = {
                  code: code,
                  name: "「" + name + "」",
                  zd: oneStock[32] + '%',
                  isDown: oneStock[32].startsWith("-"),
                  price: oneStock[3],
                };
                if (code.startsWith('hk')) {
                  this.hkStockQuotList.push(stockQuot);
                } else {
                  this.aStockQuotList.push(stockQuot);
                }
              });
            }
          })
          .catch((error) => {
            console.log(error);
            this.$message.error("刷新股票数据失败！");
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

.el-header {
  padding: 5px 0px 0px 5px;
  height: 40px !important;
  border-bottom: 1px solid rgb(238, 238, 238);
}

/* .el-submenu > i {
  font-size: 14px;
} */
</style>
