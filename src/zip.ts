import JSZip from 'jszip'
import {readdirSync, statSync, readFileSync, createWriteStream} from 'node:fs'
import {resolve} from 'node:path'

export default class Zip {
  zip: JSZip
  constructor(){
    this.zip = new JSZip()
  }
  
  static addFileToZipArchive(zip: JSZip, path: string, folderName: string) {
    try {
      let zipFolder = zip.folder(folderName) as JSZip
      let fileList = readdirSync(path)
      for (let name of fileList) {
        let filePath = resolve(path, name)
        if (statSync(filePath).isDirectory()) {
          this.addFileToZipArchive(zipFolder, filePath, name)
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

  generateZipArchive(zipFileName: string) {
    return new Promise<void>((resolve) => {
      this.zip
        .generateNodeStream({ streamFiles: true })
        .pipe(createWriteStream(zipFileName))
        .on('finish', () => {
          resolve()
        })
    })
  }
}