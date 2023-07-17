import type { Plugin, ResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
import { resolve } from 'node:path'
import { existsSync, unlinkSync, readdirSync, statSync, readFileSync, createWriteStream } from 'node:fs'
import JSZip from 'jszip'
import { Options } from './type'
import Mail from './mail'

export default function VitePluginZipOutput(opt: Partial<Options> = { isSend: false }): Plugin {
  let rootPath = ''
  let dirPath = ''
  let zipFileName = ''

  function setZipFileName(folderName: string) {
    zipFileName = (opt.zipName || folderName) + '.zip'
  }

  function setRootPath(path: string) {
    rootPath = path
  }

  function setDirPath(path: string) {
    dirPath = path
  }

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

  // 遍历文件夹，压入到zip中
  function addFileToZipArchive(zip: JSZip, path: string, folderName: string) {
    try {
      let zipFolder = zip.folder(folderName) as JSZip
      let fileList = readdirSync(path)
      for (let name of fileList) {
        let filePath = resolve(path, name)
        if (statSync(filePath).isDirectory()) {
          addFileToZipArchive(zipFolder, filePath, name)
        } else {
          zipFolder.file(name, readFileSync(filePath), {
            date: new Date(),
          })
        }
      }
    } catch (e) {
      console.log('addFileToZipArchive err', e)
    }
  }

  // 删除同名zip文件， 生成zip文件
  function generateZipArchive(zip: JSZip, path: string) {
    return new Promise<void>((resolve) => {
      deleteFile(path)
      zip
        .generateNodeStream({ streamFiles: true })
        .pipe(createWriteStream(zipFileName))
        .on('finish', () => {
          resolve()
        })
    })
  }

  // 将压缩好的zip文件发送到邮箱 
  function sendEmail(path: string) {
    return new Promise(async (presolve, preject) => {
      try {
        console.log(`>>>vite-plugin-zip: start to send Email`)
        const { user, pass, to } = opt
        if (!user || !pass) {
          throw new Error(`>>>vite-plugin-zip: when isSend is true, must set user and pass value.`)
        }
        const mail = new Mail({
          user: opt.user!,
          pass: opt.pass!,
        })
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
        console.log(`>>>vite-plugin-zip: send email success`)
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
      if (!existsSync(dirPath)) {
        console.log(`>>>vite-plugin-zip: not exist ${dirPath}`)
        return
      }
      let folderName = pickFolderName(dirPath)
      setZipFileName(folderName)
      const zip = new JSZip()
      console.log(`>>>vite-plugin-zip: start adding the contents of the ${folderName} folder to zip`)
      addFileToZipArchive(zip, dirPath, folderName)
      const ZipPath = resolve(rootPath, `./${zipFileName}`)
      await generateZipArchive(zip, ZipPath)
      console.log(`>>>vite-plugin-zip: finish compress ${folderName}, ${zipFileName} written.`)
      if (opt.isSend) {
        await sendEmail(ZipPath)
      }
    },
    // 根据最终的vite配置获取静态文件的路径
    configResolved(resolveConfig: ResolvedConfig) {
      const { build, root } = resolveConfig
      const { outDir } = build
      setRootPath(root)
      setDirPath(normalizePath(resolve(root, outDir)))
    },
  }
}
