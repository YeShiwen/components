const files = require.context('.', true, /\.js$/)

let configApiRouters = {}

files.keys().forEach(key => {
  if (key === './index.js') return
  configApiRouters = Object.assign(configApiRouters, files(key).default) // 读取出文件中的default模块
})
export default configApiRouters
