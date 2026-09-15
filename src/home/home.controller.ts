import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { HomeService } from './home.services.js';
import { HomeQueryDto } from '../home/dto/home-query.dto.js'
import { JwtAuthGuard } from '../guards/jwt.auth.guards.js';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getHome(
    @Query() query: HomeQueryDto,
    @Req() req: any, // req.user from JwtAuthGuard — { id, role }
  ) {
    return this.homeService.getHome(req.user.sub, query);
  }
}