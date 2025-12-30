const fs = require('fs')
const path = require('path')

const appRoot = process.cwd()
const staticSource = path.join(appRoot, '.next', 'static')
const staticDest = path.join(appRoot, '.next', 'standalone', '.next', 'static')
const prismaSource = path.join(appRoot, 'node_modules', '.prisma')
const prismaDest = path.join(appRoot, '.next', 'standalone', 'node_modules', '.prisma')

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
copyDir(prismaSource, prismaDest)
