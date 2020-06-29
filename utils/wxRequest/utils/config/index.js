import apiRouter from '@/api/routers'

const global = {
  version: '1.0.0',
  apiEnv: process.env.NODE_ENV,
  apiHosts: {
    alpha: '', // 内测地址 http://192.168.10.77:8080 https://t.dyh.uidti.com/
    beta: '', // 公测地址
    abtest: '', // 灰度地址(没有灰度,线上接口地址)
    development: 'https://operate-test.hetianbang.com',
    production: 'https://operate-test.hetianbang.com'// 生产地址
  },
  apiHost: () => {
    return global.apiHosts[global.apiEnv]
  },
  appName: '',
  //   后端接口
  apiRouter,
  api: (key) => {
    // 如果接口地址为绝对路径，直接返回
    const reg = new RegExp(/(http:\/\/|https:\/\/)/g)
    const isAbsolute = reg.test(global.apiRouter[key])
    if (isAbsolute) return global.apiRouter[key]

    return global.apiHost() + (global.apiRouter[key] || key)
  }
}
export default global
