import request from '../api/httpUtil'

const releaseUrl = 'https://api.github.com/repos/wqh8522/Fish/releases/latest'
const releaseUrlBackup = 'https://cdn.jsdelivr.net/gh/wqh8522/Fish@latest/package.json'
export const downloadUrl = 'https://github.com/repos/wqh8522/Fish/releases/latest'

/** ===================更新接口============================ */
export function checkUpdateApi() {
    return request({
        url: releaseUrlBackup,
        method: 'get',
    }).catch(() => {
        console.log(222)
        return request({
            url: releaseUrlBackup,
            method: 'get',
        })
    });
}

/** ===================腾讯股票接口============================ */
// 获取股票数据  目前使用接口
export function getStockQuotTx(codes) {
    return request({
        url: 'http://qt.gtimg.cn/q=' + codes,
        method: 'get',//请求方法
    })
}

// 腾讯搜索接口 https://smartbox.gtimg.cn/s3/?v=2&q=22222&t=hk
export function searchStockTx(searchKey, type,existCode) {

    return request({
        url: 'https://smartbox.gtimg.cn/s3/?v=2&t=' + type + '&q=' + searchKey,
        method: 'get'
    }).then((res) => {
        const searchResList = eval("'" + res.data + "'").replace('v_hint="', '').replace('"', '').split('^');
        if (searchResList.length <= 0 || searchResList[0] === 'N;') {
            return;
        }
        const resultList = new Array();
        searchResList.forEach((item, index) => {
            const itemList = item.split("~");
            const  code = type === 'jj' ? itemList[1] : itemList[0] + itemList[1]
            resultList.push({
                key: index,
                code: code,
                name: itemList[0] + itemList[1] + ' | ' + itemList[2] + ' | ' + itemList[3] + ' | ' + itemList[4],
                isExist: existCode.indexOf(code) >= 0
            })
        })
        return resultList;
    })
}

/** ===================新浪股票接口============================*/
// 股票搜索 http://suggest3.sinajs.cn/suggest/type=2&key=zgly  
// 21,22,23,24,25,26 基金
// 11,12,13,14,15    沪深
// 31,33,32          港股
// 85 				 期货
export function searchStockSina(searchKey, type,existCode) {
    let searchType = '';
    switch (type) {
        case 'jj':
            searchType = '21,22,23,24,25,26,27';
            break;
        case 'gp':
            searchType = '11,12,13,14,15';
            break;
        case 'hk':
            searchType = '31,33,32'
            break;
        case 'futu':
            searchType = '85';
            break;
    }
    const name = 'suggestdata_' + new Date().getTime();
    return request({
        url: 'http://suggest3.sinajs.cn/suggest/type=' + searchType,
        method: 'get',
        params: {
            key: searchKey,
            name: name
        }
    }).then((res) => {
        //var suggestdata_1637759317505="sz000002,11,000002,sz000002,万科A,,万科A,99,1,ESG;sh600028,11,600028,sh600028,中国石化,,中国石化,99,1,ESG;";
        const resultList = new Array();
        const resData = res.data.replace('var ' + name + '=', '').replaceAll('\"', '');
        if (resData === null || resData === ';') {
            return resultList;
        }
        const searchResList = resData.split(';');
        searchResList.forEach((item, index) => {
            if (item === '' || item === undefined || item === null) {
                return;
            }

            const itemList = item.split(",");
            let code = type === 'jj' ? itemList[2] : type === 'hk' ? 'hk'+ itemList[3] : itemList[3];
            resultList.push({
                key: index,
                code:  code,
                name: itemList[3]+ ' | ' + itemList[2] + ' | ' + itemList[4],
                isExist: existCode.indexOf(code) >= 0
            })
        });
        return resultList;
    });

}

//https://hq.sinajs.cn/?_=1637372495829/&list=M2205,M2207,M2208,M2203,M2209,M2211
export function futuQutoSina(codes) {
    return request({
        url: 'https://hq.sinajs.cn/?_=' + new Date().getTime() + '/&list=' + codes,
        method: 'get'
    })
}


/** ===================天天基金相关接口============================*/

//基金实时数据  天天基金
// https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=50&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=ssdfsdfsdf&Fcodes=320007,161726
export function getFundQuot(codes) {
    return request({
        url: 'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=50&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=' + new Date().getTime() + '&Fcodes=' + codes,
        method: 'get',//请求方法
    })
}
