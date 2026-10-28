import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async createUser(data: { email?: string; phone?: string; firstName: string; lastName: string; password: string }) {
    const hashed = await bcrypt.hash(data.password, 10)
    return this.prisma.user.create({ data: { email: data.email, phone: data.phone, firstName: data.firstName, lastName: data.lastName, password: hashed } })
  }
}
