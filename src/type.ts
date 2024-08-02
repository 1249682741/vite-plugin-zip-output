export interface Options {
  zipName: string
  /** if false is passed for destPath, the path of a chunk of data in the archive is set to the root */
  destPath: false | string
  isSend: boolean
  user: string
  pass: string
  to: string
}
export interface Mail{
  user: string
  pass: string
}