import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { GuidelineService } from './guideline.service';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ResourceOwnership } from '@/common/guards/resource-ownership.guard';

@Controller('guideline')
export class GuidelineController {
	constructor(private readonly guidelineService: GuidelineService) {}

	@Post()
	create(@Body() createGuidelineDto: CreateGuidelineDto, @Session() session: UserSession) {
		const userId = session.user.id;
		return this.guidelineService.create(createGuidelineDto, userId);
	}

	@Get()
	findAll(@Session() session: UserSession) {
		return this.guidelineService.findAll(session.user.id);
	}

	@Get(':id')
	@ResourceOwnership('guideline')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.guidelineService.findOne(id);
	}

	@Patch(':id')
	@ResourceOwnership('guideline')
	update(@Param('id', ParseIntPipe) id: number, @Body() updateGuidelineDto: UpdateGuidelineDto) {
		return this.guidelineService.update(id, updateGuidelineDto);
	}

	@Delete(':id')
	@ResourceOwnership('guideline')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.guidelineService.remove(id);
	}
}
