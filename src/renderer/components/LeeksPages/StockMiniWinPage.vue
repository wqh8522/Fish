<template xmlns="http://www.w3.org/1999/html">

  <div id="miniOut" style="height: 100%;width: 100%;">
    <el-button class="el-icon-close closeBtn" size="mini" v-show="showCloseBtn"
               style="float: right;border:none; " @click="closeWin"></el-button>
    <span style="height: auto;" v-for="item in currentQuotDatas" :key="item.code">
      {{ item.name }} &nbsp;{{ item.price }} &nbsp;{{ item.zd }} <br>
    </span>


  </div>

</template>

<script>
import {store} from "../../utils/configUtil";
import Queue from '../../utils/Queue'
import {getStockQuotTx} from "../../api/api";
import vPinyin from "../../utils/Piny";

const ipcRenderer = require('electron').ipcRenderer;

const {WPCProviderDelegate} = require('electron-wpc');
const providerDelegate = new WPCProviderDelegate();

const remote = require('@electron/remote')


export default {
  name: "StockMiniWinPage",
  data() {
    return {
      showCloseBtn: false,
      stockCodes: new Array(),
      hideMode: false,
      queue: new Queue(),
      currentSearchCode: [],
      currentQuotDatas: [{}],
      miniStockNum: 1
    }
  },
  mounted() {
    const leeksConfig = store.get('leeksConfig');
    if (leeksConfig !== undefined) {
      const aStockCodes = leeksConfig.aStockCodes === undefined ? new Array() : leeksConfig.aStockCodes;
      const hkStockCodes = leeksConfig.hkStockCodes === undefined ? new Array() : leeksConfig.hkStockCodes;
      this.hideMode = leeksConfig.hideMode === undefined ? false : leeksConfig.hideMode;
      this.miniStockNum = leeksConfig.miniStockNum === undefined ? false : leeksConfig.miniStockNum;

      aStockCodes.forEach(value => {
        this.stockCodes.push(value)
      })
      hkStockCodes.forEach(value => {
        this.stockCodes.push(value)
      })
    }
    if (this.stockCodes.length > 0) {
      this.queue = new Queue();
      this.stockCodes.forEach(value => {
        this.queue.enqueue(value);
      })
    }
    this.refreshStock();
    setInterval(() => {
      this.refreshStock();
    }, 3000);
    // 监听
    this.onSelectChange();
    this.mouseEvent();
    this.onSetChange();

  },
  methods: {
    mouseEvent(){

      let win = remote.getCurrentWindow();
      let biasX = 0;
      let biasY = 0;
      document.addEventListener('mouseover', () =>{
        this.mouseOver();
      });
      document.addEventListener('mouseleave', () =>{
        this.mouseLeave()
      })
      document.addEventListener('mousedown', function (e) {
        console.log(e.button)
        switch (e.button) {
          case 0:
            biasX = e.x;
            biasY = e.y;
            document.addEventListener('mousemove', moveEvent);
            break;
        }
      });

      document.addEventListener('mouseup', function () {
        biasX = 0;
        biasY = 0;
        document.removeEventListener('mousemove', moveEvent)
      });

      function moveEvent(e) {
        win.setPosition(e.screenX - biasX, e.screenY - biasY)
      }

    },
    onSetChange() {
      providerDelegate.on('stock_set_change', (resolve, reject, args) => {
        this.hideMode = store.get('leeksConfig.hideMode');
        this.miniStockNum = store.get('leeksConfig.miniStockNum');
      });

    },
    onSelectChange() {
      providerDelegate.on('select_stock_change', (resolve, reject, args) => {
        this.currentSearchCode = '';
        this.stockCodes = new Array();
        console.log(store.get('leeksConfig.aStockCodes'))
        // 接口到自选修改的消息 更新队列
        const leeksConfig = store.get('leeksConfig');
        if (leeksConfig !== undefined) {
          const aStockCodes = leeksConfig.aStockCodes === undefined ? new Array() : leeksConfig.aStockCodes;
          const hkStockCodes = leeksConfig.hkStockCodes === undefined ? new Array() : leeksConfig.hkStockCodes;

          aStockCodes.forEach(value => {
            this.stockCodes.push(value)
          })
          hkStockCodes.forEach(value => {
            this.stockCodes.push(value)
          })
        }
        if (this.stockCodes.length > 0) {
          this.queue = new Queue();
          this.stockCodes.forEach(value => {
            this.queue.enqueue(value);
          })
        } else {
          this.queue.clear();
        }
        console.log(this.queue.toString())
        const replyArgs = {result: `stockChangeSuccess`};
        resolve(replyArgs);
      });
    },
    mouseOver() {
      this.showCloseBtn = true;
    },
    mouseLeave() {
      this.showCloseBtn = false;
    },
    closeWin() {
      ipcRenderer.send('closeStockMiniWindow');
    },
    refreshStock() {
      if (this.stockCodes.length <= 0 || this.queue.isEmpty()) {
        return
      }
      if (this.miniStockNum === null || this.miniStockNum === undefined) {
        this.miniStockNum = 1;
      }
      if (this.miniStockNum > this.queue.size()) {
        this.miniStockNum = this.queue.size();
      }
      let searchCodes = new Array();
      for (let i = 0; i< this.miniStockNum; i++) {
        searchCodes.push(this.queue.dequeue());
      }
      this.currentSearchCode = searchCodes;
      if (searchCodes.length <= 0) {
        return;
      }
      // 将当前搜索的code放入队尾
      for (let j = 0; j < searchCodes.length; j++) {
        this.queue.enqueue(searchCodes[j])
      }

      getStockQuotTx(searchCodes.join(",")).then((response) => {
        this.currentQuotDatas = new Array();
        const datas = response.data.split("\n");
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
            const currentQuotData = {
              code: code,
              name: name,
              zd: oneStock[32] + '%',
              isDown: oneStock[32].startsWith("-"),
              price: oneStock[3],
            };
            this.currentQuotDatas.push(currentQuotData);
          });
        }
      }).catch((error) => {
        console.log(error);
        this.$message.error("刷新股票数据失败！")
      }).finally(() => {

      });
    }

  },
}
</script>

<style>
/*#app {*/
/*  -webkit-app-region: drag;*/
/*}*/
#miniOut {
  font-size: 12px;
  color: #2b2a2a;
}

.closeBtn {
  padding: 3px 4px;
}


</style>