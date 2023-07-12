import type { Plugin, ResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
import { resolve } from 'node:path'
import { existsSync, unlinkSync, readdirSync, statSync, readFileSync, createWriteStream } from 'node:fs'
// @ts-ignore
import JSZip from 'jszip'
import { Options } from './type'

export default function VitePluginZip({ zipName }: Options = {}): Plugin {
  let rootPath = ''
  let dirPath = ''
  let zipFileName = ''

  function setZipFileName(folderName: string) {
    zipFileName = (zipName || folderName) + '.zip'
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

  function generateZipArchive(zip: JSZip) {
    const ZipPath = resolve(rootPath, `./${zipFileName}`)
    return new Promise<void>((resolve) => {
      deleteFile(ZipPath)
      zip
        .generateNodeStream({ streamFiles: true })
        .pipe(createWriteStream(zipFileName))
        .on('finish', () => {
          resolve()
        })
    })
  }

  return {
    name: 'vite-plugin-zip',
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
      await generateZipArchive(zip)
      console.log(`>>>vite-plugin-zip: finish compress ${folderName}, ${zipFileName} written.`)
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
