import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common'
import { UsersService } from './users.service'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: any) {
    const user = await this.usersService.createUser(body)
    return { id: user.id, email: user.email }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req: any) {
    return req.user
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('proprietor')
  @Get()
  async listAll() {
    return { message: 'List users (protected, proprietor only)' }
  }
}
