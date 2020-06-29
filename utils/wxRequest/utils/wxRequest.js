import Tip from './tip'
import global from './config'
// import md5 from 'blueimp-md5'
import store from '@/store/index'
const whiteList = ['getMdDictList', 'setDevicePattern'] // 接口请求白名单，用于过滤不需要限制重复请求的接口
const pending = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let lock = true;
const removePending = (ever) => {
	return new Promise((resolve, reject) => {
		for (const p in pending) {
			if (pending[p].u === ever.url + '&' + ever.method) { // 当当前请求在数组中存在时执行函数体
				if (!ever.noAbort) {
					pending[p].f.abort() // 执行取消操作
				}
				// console.log(JSON.stringify(pending),45)
				pending.splice(p, 1) // 把这条记录从数组中移除
			}
		}
		resolve(pending)
	})
}

class Http {
	constructor(arg) {
		this.companySn = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
		// this.errorToastLock = false;
	}

	static errorToastLock = false // 错误提示进程锁，防止重复弹出
	/**
	 * ajax请求
	 * @param {*} url - 请求url 
	 * @param {*} params - 请求数据
	 * @param {*} method - 请求方法
	 * @param {*} hasLoading - 是否开启菊花图
	 */
	async request({
		url,
		data = {},
		method = 'get',
		header = {},
		hasLoading = false
	}) {
		// 多次请求只有最后一次生效，防止网络延迟数据篡位
		removePending({
			url: global.api(url),
			method
		})

		// 是否开启菊花图
		hasLoading && Tip.loading()
		// 读取第三方平台配置
		// data.hospitalId = this.companySn.hospitalId
		// data.appid = this.companySn.extAppid
		return new Promise((resolve, reject) => {
			const requestTask = wx.request({
				url: global.api(url),
				data,
				method,
				header: Object.assign({
					'content-type': 'application/json',
					'Token': wx.getStorageSync('TOKEN') || store.getters.token
				}, header),
				success: res => {
					this.handleSuccess(res.data, resolve, reject, url)
				},
				complete: () => {
					Tip.loaded()
					// 在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
					removePending({
						url: global.api(url),
						method,
						noAbort: true
					})
				},
				// TODO: 这里网络异常需要后期处理
				fail: err => {
					this.handleError(err)
					reject(err)
				}
			})
			if (!whiteList.includes(url)) {  // 是否在白名单内
				pending.push({ u: global.api(url) + '&' + method, f: requestTask })
			}
		})
	}
	/**
	 * 上传文件
	 * @param {*} tempFilePaths - 文件
	 * @param {*} name
	 * @param {*} formData
	 */
	uploadFile({
		url,
		tempFilePaths,
		name = 'file'
	}) {
		return new Promise((resolve, reject) => {
			const timestamp = new Date().getTime()
			wx.uploadFile({
				url: `${global.api(url)}?timestamp=${timestamp}`,
				filePath: tempFilePaths,
				name,
				header: {
					'upload-token': md5(`a50945dbc25b335de0402210421ea381${timestamp}`)
				},
				formData: {},
				success: res => {
					resolve(JSON.parse(res.data))
				},
				// TODO: 这里网络异常需要后期处理
				fail: err => {
					reject(err)
				}
			})
		})
	}
	/**
	 * 处理请求错误
	 */
	handleError({ errMsg }) {
		// Tip.loaded()
		// 报错信息只提醒一次，取消请求不做提示
		if (Http.errorToastLock || errMsg == 'request:fail abort') return
		Http.errorToastLock = true
		wx.showModal({
			title: '网络异常',
			content: '请求失败请重试',
			showCancel: false,
			confirmColor: '#4ABF9B',
			success(res) {
				if (res.confirm) {
					Http.errorToastLock = false
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	}
	/**
	 * 处理请求成功
	 */
	handleSuccess(res, resolve, reject, fucName) {
		let pages = getCurrentPages();
		let route = pages[pages.length - 1] && pages[pages.length - 1].route;
		switch (res.code) {
			case 100: // 参数错误
				wx.showToast({ title: res.message, icon: "none" });
				break
			case 200: // 请求成功
				resolve(res)
				break
			case 400: // 报错
				wx.showToast({ title: res.message, icon: "none" });
				break
			case 401: // token失效
				store.dispatch('login').then((res) => {
					// 重新调用接口
					pages[pages.length - 1][fucName]()
				})
				break
			case 1001: // 未注册用户
				if (route == 'pages/register/main') return
				setTimeout(() => {
					wx.reLaunch({
						url: '/pages/register/main'
					})
				}, 100);
				reject(res)
				break
			case 1002: // 账号冻结
				wx.showModal({
					title: '账号异常',
					content: `${res.msg}`,
					showCancel: false,
					confirmColor: '#4ABF9B',
					success(res) {
						if (res.confirm) { } else if (res.cancel) {
							console.log('用户点击取消')
						}
					}
				})
				if (route == 'pages/register/main') return
				setTimeout(() => {
					wx.reLaunch({
						url: '/pages/register/main'
					})
				}, 100);
				reject(res)
				break
			case 500: // 接口报错
				wx.showModal({
					title: '请求失败',
					content: `${res.msg}`,
					showCancel: false,
					confirmColor: '#4ABF9B',
					success(res) {
						if (res.confirm) { } else if (res.cancel) {
							console.log('用户点击取消')
						}
					}
				})
				reject(res)
				break
			default:
				wx.showToast({ title: res.message, icon: "none" });
				reject(res)
		}
	}
	/**
	 * 中断重复请求
	 */
	abortRequest(data) {
		removePending(data)
	}
}


export default new Http()
