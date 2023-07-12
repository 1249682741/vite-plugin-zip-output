# vite-plugin-zip-output
一个压缩打包构建的文件为zip的插件。
插件会根据``vite.config.js``的``build.outDir``配置把打包输出的文件夹压缩为一个``zip``格式的压缩包

## 使用
```js
import VitePluginZipOutput from 'vite-plugin-zip-output'

export default defineConfig({
  plugins: [VitePluginZipOutput()],
})
```

## 参数
|参数|类型|必填|简介|
|--|--|--|--|
|zipName|string|×|压缩包的名称。默认为``build.outDir``的设置的文件夹名称。