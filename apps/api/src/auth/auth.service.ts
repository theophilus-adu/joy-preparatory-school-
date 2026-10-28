import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(emailOrPhone: string, pass: string) {
    const user = await this.prisma.user.findFirst({ where: { email: emailOrPhone } })
    if (!user) return null
    const match = await bcrypt.compare(pass, user.password)
    if (match) {
      // strip password
      const { password, ...rest } = user as any
      return rest
    }
    return null
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email }
    return { access_token: this.jwtService.sign(payload) }
  }
}
