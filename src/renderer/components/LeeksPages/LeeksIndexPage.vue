<template>
  <!-- <div id="wrapper"> -->
  <el-container id="out">
    <el-container>
      <el-container style="width: 1px; width: 23%;border-right: 1px solid rgb(238, 238, 238);">
        <el-header>
          <el-button icon="el-icon-refresh-right" size="mini" @click="refreshBtnClick" title="刷新"/>
          <el-button icon="el-icon-plus" size="mini" @click="search" title="添加自选"/>
          <el-button icon="el-icon-setting" size="mini" @click="setBtn" title="设置"/>
          <el-button icon="iconfont icon-stick_icon" size="mini" v-show="!isTop" @click="openTopWin" title="置顶"/>
          <el-button icon="iconfont icon-quxiaozhiding" size="mini" v-show="isTop" @click="closeTopWin" title="取消置顶"/>
        </el-header>
        <el-aside>
          <el-menu :default-openeds="['1','2']">
            <el-submenu index="1">
              <template slot="title">FUND</template>
              <!-- <i class="el-icon-message"></i> -->
              <el-menu-item
                  v-for="(val, index) in fundQuotList"
                  :index="val.code"
                  :key="index">
                <i :class="val.isDown ? downClass : upClass"/>&nbsp;&nbsp;{{
                  val.zd
                }}&nbsp;&nbsp;&nbsp;{{ val.name }}
                <el-button class="el-icon-minus" size="mini" style="border: none"
                           @click="removeSelect(val.code, 'fund')"/>
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
                  <el-button class="el-icon-minus" size="mini" style="border: none"
                             @click="removeSelect(val.code, 'gp')"/>
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
                  <el-button class="el-icon-minus" size="mini" style="border: none"
                             @click="removeSelect(val.code, 'hk')"/>
                  <!--                  <i class="el-icon-minus"/>-->
                </el-menu-item>
              </el-menu-item-group>

            </el-submenu>
            <el-submenu index="1">
              <template slot="title">FUTU</template>
              <!-- <i class="el-icon-message"></i> -->
              <el-menu-item
                  v-for="(val, index) in futuQuotList"
                  :index="val.code"
                  :key="index">
                <i :class="val.isDown ? downClass : upClass"/>&nbsp;&nbsp;{{
                  val.zd
                }}&nbsp;&nbsp;&nbsp;{{ val.name }}
                <el-button class="el-icon-minus" size="mini" style="border: none"
                           @click="removeSelect(val.code, 'fund')"/>
              </el-menu-item
              >
            </el-submenu>
          </el-menu>
        </el-aside>

      </el-container>
      <el-main style="height: 99%;  width: 60%; padding-top: 0px" v-show="showSearchStockPanel">
        <el-button class="el-icon-close" size="mini" style="float: right;border:none" @click="closePanel"></el-button>
        <search-page v-bind:fund-codes="fundCodes"
                     v-bind:a-stock-codes="aStockCodes"
                     v-bind:hk-stock-codes="hkStockCodes"
                     v-bind:futu-codes="fundCodes"
                     v-bind:add-select="addSelect"
                     v-bind:remove-select="removeSelect"
        ></search-page>
      </el-main>
    </el-container>
    <el-dialog
        title="设置"
        :visible.sync="setDialogVisible"
        width="95%">
      <el-form ref="form" label-width="80px">
        <el-form-item label="隐藏模式">
          <el-switch v-model="hideMode"></el-switch>
        </el-form-item>
        <el-form-item label="透明度">
          <el-slider v-model="transparency" @change="transparencyChange" :min="Number(10)"></el-slider>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setDialogNoBtn">取 消</el-button>
    <el-button type="primary" @click="setDialogYesBtn">确 定</el-button>
    </span>
    </el-dialog>
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
      hideMode: false,
      fundCodes: [],
      aStockCodes: [],
      hkStockCodes: [],
      futuCodes: [],
      transparency: 100,
      isTop: false,
      fundQuotList: [],
      aStockQuotList: [],
      hkStockQuotList: [],
      futuQuotList: [],
      showSearchStockPanel: false,
      sliderVal: 20,
      stockInterval: null,
      fundInterval: null,
      setDialogVisible: false
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
    const stockConfig = store.get('stockConfig');
    if (stockConfig !== undefined) {
      this.isHidden = stockConfig.isHidden === undefined ? false : stockConfig.isHidden;
      this.fundCodes = stockConfig.fundCodes === undefined ? [] : stockConfig.fundCodes;
      this.aStockCodes = stockConfig.aStockCodes === undefined ? [] : stockConfig.aStockCodes;
      this.hkStockCodes = stockConfig.hkStockCodes === undefined ? [] : stockConfig.hkStockCodes;
      this.transparency = stockConfig.transparency === undefined ? 100 : stockConfig.transparency;
    }
    this.refreshStock();
    this.refreshFund();
    this.startInterval();
    this.transparencyChange();
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
    setDialogNoBtn() {
      this.setDialogVisible = false;
      this.transparency = 100;
      store.set('stockConfig.hideMode', this.hideMode);
      store.set('stockConfig.transparency', this.transparency);
    },
    setDialogYesBtn() {
      this.setDialogVisible = false;
      store.set('stockConfig.hideMode', this.hideMode);
      store.set('stockConfig.transparency', this.transparency);
    },
    transparencyChange() {
      ipcRenderer.send('asynchronous-message', 'leeks-win-transparency', this.transparency / 100);
    },
    setBtn() {
      this.setDialogVisible = true;
    },
    refreshBtnClick() {
      this.refreshStock();
      this.refreshFund();
    },
    closeTopWin() {
      this.isTop = false;
      ipcRenderer.send('asynchronous-message', 'leeks-win-closeTop');
    },
    openTopWin() {
      this.isTop = true;
      ipcRenderer.send('asynchronous-message', 'leeks-win-openTop');
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
            if (this.aStockCodes.indexOf(code) < 0) {
              return
            }
            this.aStockCodes.forEach((item, index, arr) => {
              if (item === code) {
                arr.splice(index, 1)
              }
            });
            this.refreshStock();
            store.set('stockConfig.aStockCodes', this.aStockCodes);
            break;
          case 'hk':
            if (this.hkStockCodes.indexOf(code) < 0) {
              return
            }
            this.hkStockCodes.forEach((item, index, arr) => {
              if (item === code) {
                arr.splice(index, 1)
              }
            });
            this.refreshStock();
            store.set('stockConfig.hkStockCodes', this.hkStockCodes);
            break;
          case 'fund':
            if (this.fundCodes.indexOf(code) < 0) {
              return
            }
            this.fundCodes.forEach((item, index, arr) => {
              if (item === code) {
                arr.splice(index, 1)
              }
            });
            this.refreshFund();
            store.set('stockConfig.fundCodes', this.fundCodes);
            break;
          case 'futu':
            if (this.futuCodes.indexOf(code) < 0) {
              return
            }
            this.futuCodes.forEach((item, index, arr) => {
              if (item === code) {
                arr.splice(index, 1)
              }
            });
            this.refreshFutu();
            store.set('stockConfig.futuCodes', this.futuCodes);
            break;
        }

      }
    },
    addSelect(code, selectType) {
      if (code !== '') {
        switch (selectType) {
          case 'gp':
            if (this.aStockCodes.indexOf(code) >= 0) {
              return
            }
            this.aStockCodes.push(code);
            this.refreshStock();
            store.set('stockConfig.aStockCodes', this.aStockCodes);
            break;
          case 'hk':
            if (this.hkStockCodes.indexOf(code) >= 0) {
              return
            }
            this.hkStockCodes.push(code);
            this.refreshStock();
            store.set('stockConfig.hkStockCodes', this.hkStockCodes);
            break;
          case 'fund':
            if (this.fundCodes.indexOf(code) >= 0) {
              return
            }
            this.fundCodes.push(code);
            this.refreshFund();
            store.set('stockConfig.fundCodes', this.fundCodes);
            break;
          case 'futu':
            if (this.futuCodes.indexOf(code) >= 0) {
              return
            }
            this.futuCodes.push(code);
            this.refreshFutu();
            store.set('stockConfig.futuCode', this.futuCodes);
            break;
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
    refreshFutu(){
      // 刷新期货行情
      console.log(this.futuCodes)
    },
    refreshFund() {
      if (this.fundCodes.length == 0) {
        return
      }
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
      if ((this.hkStockCodes === undefined || this.hkStockCodes.length <= 0)
          && (this.aStockCodes === undefined || this.aStockCodes.length <= 0)) {
        return
      }
      let searchCode = '';
      if (this.aStockCodes && this.aStockCodes.length > 0) {
        searchCode = this.aStockCodes.join(",");
      }
      searchCode += ','
      if (this.hkStockCodes && this.hkStockCodes.length > 0) {
        searchCode += this.hkStockCodes.join(",");
      }
      const newAStockQuotList = new Array();
      const newHkStockQuotList = new Array();
      getStockQuotTx(searchCode)
          .then((response) => {
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
                const name = this.hideMode
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
                  newHkStockQuotList.push(stockQuot);
                } else {
                  newAStockQuotList.push(stockQuot);
                }
              });
            }
          })
          .catch((error) => {
            console.log(error);
            this.$message.error("刷新股票数据失败！")
          }).finally(() => {
        this.aStockQuotList = newAStockQuotList;
        this.hkStockQuotList = newHkStockQuotList;
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
