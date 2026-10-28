import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.enableCors()
  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`API (Nest) listening on ${port}`)
}

bootstrap()
import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.get('/api/school', async (req, res) => {
  const school = await prisma.school.findFirst()
  res.json(school)
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`API listening on ${port}`))
