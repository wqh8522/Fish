
import request from '../api/httpUtil'
// 获取你要的数据
// export function getData(data) {
// 	return request({
// 		url: '/test/testdata/',//自己的接口地址
// 		method: 'post',//请求方法
//         data //需要携带的参数
// 	})
// }


// Vue.axios.get("http://qt.gtimg.cn/q=").then((response) => {
//     console.log(response.data)
//   });

// 获取股票数据  目前使用新浪接口
export function getStockQuot(codes) {
    return request({
		url: 'http://qt.gtimg.cn/q=' + codes,
		method: 'get',//请求方法
	}) 
}

// 股票搜索 http://suggest3.sinajs.cn/suggest/type=2&key=zgly  
// 21,22,23,24,25,26 基金
// 11,12,13,14,15    沪深
// 31,33,32          港股
export function searchStockSina(searchKey) {
	return request({
		url: 'http://suggest3.sinajs.cn/suggest/type=2&key=' + searchKey,
		method: 'get'
	})
}

// 腾讯搜索接口 https://smartbox.gtimg.cn/s3/?v=2&q=22222&t=hk
export function searchStockTx(searchKey) {
	return request({
		url: 'https://smartbox.gtimg.cn/s3/?v=2&t=hk&q=' + searchKey,
		method: 'get'
	})
}

//基金实时数据  天天基金
// https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=50&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=ssdfsdfsdf&Fcodes=320007,161726
export function getFundQuot(codes) {
    return request({
		url: 'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=50&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=' + new Date().getTime() + '&Fcodes=' + codes,
		method: 'get',//请求方法
	}) 
}
