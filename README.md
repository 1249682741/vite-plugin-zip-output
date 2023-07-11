# vite-plugin-zip-output
一个压缩打包构建的文件为zip的插件。
插件会根据``vite.config.js``的``build.outDir``配置把输出的文件夹进行压缩为一个``zip``格式的压缩包

## 使用
```js
import VitePluginZip from 'vite-plugin-zip-output'

export default defineConfig({
  plugins: [VitePluginZip()],
})
```