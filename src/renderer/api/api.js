
import request from '../api/httpUtil'

/** ===================腾讯股票接口============================ */
// 获取股票数据  目前使用接口
export function getStockQuotTx(codes) {
    return request({
		url: 'http://qt.gtimg.cn/q=' + codes,
		method: 'get',//请求方法
	}) 
}

// 腾讯搜索接口 https://smartbox.gtimg.cn/s3/?v=2&q=22222&t=hk
export function searchStockTx(searchKey, type) {
	return request({
		url: 'https://smartbox.gtimg.cn/s3/?v=2&t=' + type + '&q=' + searchKey,
		method: 'get'
	})
}

/** ===================新浪股票接口============================*/
// 股票搜索 http://suggest3.sinajs.cn/suggest/type=2&key=zgly  
// 21,22,23,24,25,26 基金
// 11,12,13,14,15    沪深
// 31,33,32          港股
// 85 				 期货
export function searchStockSina(searchKey, type) {
	let searchType = '';
	switch (type) {
		case 'hk':
			searchType='31,33,32'
			break;
		case 'futu':
			searchType = '85';
			break;
	}
	return request({
		url: 'http://suggest3.sinajs.cn/suggest/type=' + searchType +'&key=' + searchKey,
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
