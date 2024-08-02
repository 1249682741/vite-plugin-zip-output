import {createWriteStream} from 'node:fs'
import archiver from 'archiver'

interface ZipParams {
  zipFileName: string,
  distPath: string
  destPath: false | string 
}

export default function archiveFile({zipFileName, distPath, destPath}: ZipParams) {
  return new Promise((resolve, reject) => {
    
    const output = createWriteStream(zipFileName)
    const archive = archiver('zip')
  
    output.on('close', () => {
      resolve('success')
    })

    output.on('error', (err) => {
      reject(err)
    })

    archive.pipe(output)

    archive.directory(distPath, destPath)

    archive.finalize()
  })
  
}