import { mkdirSync } from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

const isProduction = process.env.NODE_ENV === 'production'
const dbUrl = process.env.DATABASE_URL
const absoluteDbFilePath = path.resolve(
  process.cwd(),
  isProduction ? '../../data/geo.db' : 'data/geo.db'
)
const absoluteDbFileUrl = `file:${absoluteDbFilePath.split(path.sep).join('/')}`

if (isProduction) {
  if (!dbUrl) {
    process.env.DATABASE_URL = absoluteDbFileUrl
  } else if (
    dbUrl.startsWith('file:./data/') ||
    dbUrl.startsWith('file:../') ||
    dbUrl.startsWith('file:../../')
  ) {
    process.env.DATABASE_URL = absoluteDbFileUrl
  }
}

const dataDir = isProduction
  ? path.resolve(process.cwd(), '../../data')
  : path.resolve(process.cwd(), 'data')

mkdirSync(dataDir, { recursive: true })

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
