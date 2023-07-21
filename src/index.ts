import type { Plugin, ResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
import { resolve } from 'node:path'
import { existsSync, unlinkSync } from 'node:fs'
import { Options } from './type'
import Mail from './mail'
import archiveFile from './archiveFile'

export default function VitePluginZipOutput(opt: Partial<Options> = { isSend: false }): Plugin {
  let rootPath = ''
  let distPath = ''
  let distFileName = ''
  let zipPath = ''
  let zipFileName = ''


  // 从路径中提取最后一个文件夹
  function pickFolderName(path: string) {
    let match = path.match(/\/([^\/]*)$/)
    return match ? match[1] : ''
  }

  // 删除根目录下的目标zip文件
  function deleteFile(path: string) {
    if (existsSync(path)) {
      unlinkSync(path)
    }
  }

  // 压缩文件
  async function zipFile() {
    if (!existsSync(distPath)) {
      throw new Error(`>>>vite-plugin-zip-output: not exist ${distPath}`)
    }
    console.log(`>>>vite-plugin-zip-output: start adding the contents of the ${distFileName} folder to zip`)
    deleteFile(zipPath)
    await archiveFile({
      zipFileName,
      distPath,
      distFileName
    })
    console.log(`>>>vite-plugin-zip-output: finish compress ${distFileName}, ${zipFileName} written.`)
  }

  // 将压缩好的zip文件发送到邮箱 
  function sendEmail(path: string) {
    return new Promise(async (presolve, preject) => {
      try {
        console.log(`>>>vite-plugin-zip-output: start to send Email`)
        const { user, pass, to } = opt
        if (!user || !pass) {
          throw new Error(`>>>vite-plugin-zip-output: when isSend is true, must set user and pass value.`)
        }
        const mail = new Mail(user, pass)
        const ProjectFolderName = pickFolderName(rootPath)
        const result = await mail.send({
          to: to || user,
          subject: ProjectFolderName,
          text: `Email send by VitePluginZipOutput. if you do not want to receive this email, you can set isSend: false at vite.config.js which under ${ProjectFolderName} folder`,
          attachments: [
            {
              filename: zipFileName,
              path,
            },
          ],
        })
        console.log(`>>>vite-plugin-zip-output: send email success`)
        presolve(result)
      } catch (err) {
        console.log(err)
        preject()
      }
    })
  }

  return {
    name: 'vite-plugin-zip-output',
    apply: 'build',
    // 这里已经完成打包了。 在这里进行压缩文件
    async closeBundle() {
      try{
        await zipFile()
        opt.isSend && await sendEmail(zipPath)
      } catch(err) {
        console.log(err)
      }
    },
    // 根据最终的vite配置获取静态文件的路径, 并初始化插件要用到信息
    configResolved(resolveConfig: ResolvedConfig) {
      const { build, root } = resolveConfig
      const { outDir } = build
      // 根路径
      rootPath = root
      // 最终打包输出的文件夹路径
      distPath = normalizePath(resolve(root, outDir))
      // 提取打包输出的文件夹的名称
      distFileName = pickFolderName(distPath)
      // 根据传入的配置或输出文件夹的名称来命名压缩文件夹名称
      zipFileName = (opt.zipName || distFileName) + '.zip'
      zipPath = resolve(rootPath, `./${zipFileName}`)
    },
  }
}
