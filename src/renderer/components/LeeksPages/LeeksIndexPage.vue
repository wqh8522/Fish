<template>
  <!-- <div id="wrapper"> -->
  <el-container id="out">
    <el-container>
      <el-container style="width: 1px; width: 23%;border-right: 1px solid rgb(238, 238, 238);">
        <el-header>
          <el-tooltip effect="dark" content="刷新">
            <el-button icon="el-icon-refresh-right" size="mini" @click="refreshBtnClick"/>
          </el-tooltip>
          <el-popover
              placement="bottom"
              width="350"
              style="height: 100%"
              trigger="manual"
              v-model="showSearchStockPanel">
            <search-page v-if="showSearchStockPanel" v-bind:fund-codes="fundCodes"
                         v-bind:a-stock-codes="aStockCodes"
                         v-bind:hk-stock-codes="hkStockCodes"
                         v-bind:futu-codes="fundCodes"
                         v-bind:add-select="addSelect"
                         v-bind:remove-select="removeSelect"
            ></search-page>
            <el-button slot="reference" size="mini" @click="search" :class="!showSearchStockPanel ? 'el-icon-plus' : 'el-icon-close'"></el-button>
          </el-popover>
<!--          <el-tooltip effect="dark" content="添加自选">
            <el-button icon="el-icon-plus" size="mini" @click="search" title="添加自选"/>
          </el-tooltip>-->
          <el-tooltip effect="dark" content="设置">
            <el-button icon="el-icon-setting" size="mini" @click="setBtn" title="设置"/>
          </el-tooltip>
          <el-tooltip effect="dark" content="置顶窗口">
            <el-button icon="iconfont icon-stick_icon" size="mini" v-show="!isTop" @click="openTopWin"/>
          </el-tooltip>
          <el-tooltip effect="dark" content="取消置顶窗口">
            <el-button icon="iconfont icon-quxiaozhiding" size="mini" v-show="isTop" @click="closeTopWin"/>
          </el-tooltip>
          <el-tooltip effect="dark" content="打开股票小窗口">
            <el-button icon="iconfont icon-xuanfuchuang" size="mini" @click="openMiniWin"/>
          </el-tooltip>

        </el-header>
        <el-aside>

          <el-collapse v-model="activeCollapse" >
            <el-collapse-item title="FUND" name="fund" >
              <el-table :show-header="false" :data="fundQuotList" row-key="code">
                <el-table-column
                    prop="name"
                    label="名称">
                </el-table-column>
                <el-table-column
                    prop="zd">
                </el-table-column>
              </el-table>

            </el-collapse-item>
            <el-collapse-item title="STOCK" name="stock" >
              <el-divider content-position="left" v-show="aStockQuotList.length > 0">a stock</el-divider>
              <el-table :show-header="false" :data="aStockQuotList" row-key="code" >
                <el-table-column
                    prop="name"
                    label="名称">
                </el-table-column>
                <el-table-column
                    prop="price">
                </el-table-column>
                <el-table-column
                    prop="zd">
                </el-table-column>
              </el-table>
              <el-divider content-position="left" v-show="hkStockQuotList.length > 0">hk stock</el-divider>
              <el-table :show-header="false" :data="hkStockQuotList" row-key="code">
                <el-table-column
                    prop="name"
                    label="名称">
                </el-table-column>
                <el-table-column
                    prop="price">
                </el-table-column>
                <el-table-column
                    prop="zd">
                </el-table-column>
              </el-table>
            </el-collapse-item>

          </el-collapse>
        </el-aside>

      </el-container>
<!--      <el-main style="height: 99%;  width: 60%; padding-top: 0px" v-show="showSearchStockPanel">
        <el-button class="el-icon-close" size="mini" style="float: right;border:none" @click="closePanel"></el-button>
        <search-page v-bind:fund-codes="fundCodes"
                     v-bind:a-stock-codes="aStockCodes"
                     v-bind:hk-stock-codes="hkStockCodes"
                     v-bind:futu-codes="fundCodes"
                     v-bind:add-select="addSelect"
                     v-bind:remove-select="removeSelect"
        ></search-page>
      </el-main>-->
    </el-container>
    <el-dialog
        title="设置"
        :visible.sync="setDialogVisible"
        width="350px">
      <el-form ref="form" label-width="80px">
        <el-form-item label="隐藏模式">
          <el-switch v-model="hideMode"></el-switch>
        </el-form-item>
        <el-form-item label="小窗口显示数量">
          <el-input-number v-model="miniStockNum" :min="1" :max="aStockCodes.length + hkStockCodes.length"></el-input-number>
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
import {getStockQuotTx, getFundQuot, futuQutoSina} from "../../api/api";
import vPinyin from "../../utils/Piny";
import SearchPage from "./SearchPage.vue";
import {store} from '../../utils/configUtil';

const ipcRenderer = require('electron').ipcRenderer;

const { WPCResolverDelegate } = require('electron-wpc');
const TAG = 'tag_for_win_provider';//需填入目标Provider的tagId.
const resolverDelegate = new WPCResolverDelegate(TAG);//这里需要传入tag以指定Provider


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
      futuInterval: null,
      setDialogVisible: false,
      activeCollapse:['stock'],
      miniStockNum:1
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
    const leeksConfig = store.get('leeksConfig');
    if (leeksConfig !== undefined) {
      this.isHidden = leeksConfig.isHidden === undefined ? false : leeksConfig.isHidden;
      this.fundCodes = leeksConfig.fundCodes === undefined ? [] : leeksConfig.fundCodes;
      this.aStockCodes = leeksConfig.aStockCodes === undefined ? [] : leeksConfig.aStockCodes;
      this.hkStockCodes = leeksConfig.hkStockCodes === undefined ? [] : leeksConfig.hkStockCodes;
      this.transparency = leeksConfig.transparency === undefined ? 100 : leeksConfig.transparency;
      this.miniStockNum = leeksConfig.miniStockNum === undefined ? 1 : leeksConfig.miniStockNum;
    }
    this.refreshStock();
    this.refreshFund();
    this.startInterval();
    this.transparencyChange();
  },
  methods: {
    // open(link) {
    //   this.$electron.shell.openExternal(link);
    // },
    closePanel() {
      this.showSearchStockPanel = false;
      // ipcRenderer.send('asynchronous-message', 'leeks-right-close');
    },
    openMiniWin() {
    //渲染进程中使用
      ipcRenderer.send('openStockMiniWindow');//打开
      // ipcRenderer.send('minimizeCalendarWindow');//最小化
      // ipcRenderer.send('closeCalendarWindow');//关闭
    },
    setDialogNoBtn() {
      this.setDialogVisible = false;
      this.transparency = 100;
      // store.set('leeksConfig.hideMode', this.hideMode);
      // store.set('leeksConfig.transparency', this.transparency);
    },
    setDialogYesBtn() {
      this.setDialogVisible = false;
      store.set('leeksConfig.hideMode', this.hideMode);
      store.set('leeksConfig.transparency', this.transparency);
      store.set('leeksConfig.miniStockNum', this.miniStockNum);
      resolverDelegate.send('stock_set_change')
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
      // ipcRenderer.send('asynchronous-message', 'leeks-right-open');
      this.showSearchStockPanel = !this.showSearchStockPanel;
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
            store.set('leeksConfig.aStockCodes', this.aStockCodes);
            this.sendSelectChangeMsg();
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
            store.set('leeksConfig.hkStockCodes', this.hkStockCodes);
            this.sendSelectChangeMsg();
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
            store.set('leeksConfig.fundCodes', this.fundCodes);
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
            store.set('leeksConfig.futuCodes', this.futuCodes);
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
            store.set('leeksConfig.aStockCodes', this.aStockCodes);
            this.sendSelectChangeMsg();
            break;
          case 'hk':
            if (this.hkStockCodes.indexOf(code) >= 0) {
              return
            }
            this.hkStockCodes.push(code);
            this.refreshStock();
            store.set('leeksConfig.hkStockCodes', this.hkStockCodes);
            this.sendSelectChangeMsg();
            break;
          case 'fund':
            if (this.fundCodes.indexOf(code) >= 0) {
              return
            }
            this.fundCodes.push(code);
            this.refreshFund();
            store.set('leeksConfig.fundCodes', this.fundCodes);
            break;
          case 'futu':
            if (this.futuCodes.indexOf(code) >= 0) {
              return
            }
            this.futuCodes.push(code);
            this.refreshFutu();
            store.set('leeksConfig.futuCode', this.futuCodes);
            break;
        }
      }
    },
    sendSelectChangeMsg() {
      // （可选）可设置超时时间，如果超时时间内没有返回结果，则将catch timeout error.
      // resolverDelegate.setTimeOut(6 * 1000);//default is 5s.
      //发送消息
      resolverDelegate.send('select_stock_change')
          .then(res => {
            //结果返回
            console.log('<-update_user_table res',res);
          })
          .catch(e => {
            //处理失败
            console.error('<-receive error msg:', e)
          });
    },
    startInterval() {
      this.stockInterval = setInterval(() => {
        this.refreshStock()
      }, 5000);
      this.fundInterval = setInterval(() => {
        this.refreshFund()
      }, 10000);
      // this.futuInterval = setInterval(() => {
      //   this.refreshFutu()
      // }, 5000);
    },
    stopInterval() {
      clearInterval(this.stockInterval);
      clearInterval(this.fundInterval);
    },
    refreshFutu() {
      // 刷新期货行情
      if (this.futuCodes.length == 0) {
        return
      }
      futuQutoSina(this.futuCodes.join(",")).then((response) => {
        console.log(response.data)
      }).catch((error) => {
        console.log(error);
        this.$message.error("刷新期货数据失败！");
      });
    },
    refreshFund() {
      if (this.fundCodes.length == 0) {
        this.fundQuotList = new Array();
        return
      }
      getFundQuot(this.fundCodes.join(",")).then((response) => {
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
              name: name,
              zd: zd + "%",
              isDown: zd.startsWith("-"),
            });
          });
        }
      }).catch((error) => {
        console.log(error);
        this.$message.error("刷新基金数据失败！");
      });
    },
    refreshStock() {
      if ((this.hkStockCodes === undefined || this.hkStockCodes.length <= 0)
          && (this.aStockCodes === undefined || this.aStockCodes.length <= 0)) {
        this.aStockQuotList = new Array();
        this.hkStockQuotList = new Array();
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
      getStockQuotTx(searchCode).then((response) => {
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
              name: name,
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
      }).catch((error) => {
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

<style >

#out {
  height: 99%;
  border: 1px solid #eee;
  border-radius: 5px;
}

#out .el-submenu {
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

.el-table td.el-table__cell {
  border: none;
  padding: 2px 0px;
  /*color: black;*/
  font-size: 12px;
  height: 100%;
}

.el-collapse-item__content {
  padding-bottom: 0px;
  border-bottom: none;
}
.el-collapse-item__header {
  height: 25px;
}
.el-divider--horizontal{
  margin: 8px 0px;
  /*color: #DCDFE6 !important;*/
}
</style>
