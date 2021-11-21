<template>

  <div id="miniOut" style="height: 100%;width: 100%;">
    <el-button class="el-icon-close closeBtn" size="mini" v-show="showCloseBtn"
               style="float: right;border:none; " @click="closeWin"></el-button>
    <span style="height: auto;">
      {{ currentQuotData.name }} &nbsp;{{ currentQuotData.price }} &nbsp;{{ currentQuotData.zd }}
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
      currentSearchCode: null,
      currentQuotData: {},
    }
  },
  mounted() {
    const leeksConfig = store.get('leeksConfig');
    if (leeksConfig !== undefined) {
      const aStockCodes = leeksConfig.aStockCodes === undefined ? new Array() : leeksConfig.aStockCodes;
      const hkStockCodes = leeksConfig.hkStockCodes === undefined ? new Array() : leeksConfig.hkStockCodes;
      this.hideMode = leeksConfig.hideMode === undefined ? false : leeksConfig.hideMode;

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
      this.hideMode = store.get('leeksConfig.hideMode')
      if (this.stockCodes.length <= 0 || this.queue.isEmpty()) {
        return
      }
      const searchCode = this.queue.dequeue();
      this.currentSearchCode = searchCode;
      if (searchCode === undefined) {
        return;
      }
      // 将当前搜索的code放入队尾
      this.queue.enqueue(searchCode)
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
            this.currentQuotData = {
              code: code,
              name: name,
              zd: oneStock[32] + '%',
              isDown: oneStock[32].startsWith("-"),
              price: oneStock[3],
            };
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