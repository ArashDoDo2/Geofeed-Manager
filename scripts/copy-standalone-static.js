const fs = require('fs')
const path = require('path')

const appRoot = process.cwd()
const staticSource = path.join(appRoot, '.next', 'static')
const staticDest = path.join(appRoot, '.next', 'standalone', '.next', 'static')
const serverSource = path.join(appRoot, '.next', 'standalone', 'server.js')
const serverDest = path.join(appRoot, 'server.js')

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

copyDir(staticSource, staticDest)

if (fs.existsSync(serverSource)) {
  fs.copyFileSync(serverSource, serverDest)
}
