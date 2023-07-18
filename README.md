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
|zipName|string|×|压缩包的名称。默认为``build.outDir``的设置的文件夹名称。|
|isSend|boolean|×|压缩完成后是否以该压缩包为附件发送到邮箱。默认为``false``不发送。|
|user|string|×|发送者的qq邮箱。当**isSend: true**的时候**必传**。|
|pass|string|×|发送者qq邮箱的授权码。当**isSend: true**的时候**必传**。|
|to|string|×|接收者的qq邮箱。当**isSend: true**的时候且没有传值的时候， **user**所设置的邮箱即使发送者也是接收者|

## 授权码
目前仅支持qq邮箱
### QQ邮箱
#### 在网页QQ邮箱端管理授权码
在邮箱[帐号与安全](http://https://wx.mail.qq.com/account#/)点击 **设备管理** > **授权码管理**，对授权码进行管理。
#### 在QQ邮箱APP端管理
在QQ邮箱App**点击左上角头像** > **在我的帐户列表下点击帐号**>**安全管理**>**设备管理**，对授权码进行管理。