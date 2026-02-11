import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	Query,
	ParseBoolPipe
} from '@nestjs/common';
import { GuidelineService } from './guideline.service';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ResourceOwnership } from '@/common/guards/resource-ownership.guard';
import { ApiResponse } from '@nestjs/swagger';
import { ExpandedGuideline } from './entities/expanded-guideline.entity';
import { Guideline } from './entities/guideline.entity';

@Controller('guideline')
export class GuidelineController {
	constructor(private readonly guidelineService: GuidelineService) {}

	@Post()
	create(@Body() createGuidelineDto: CreateGuidelineDto, @Session() session: UserSession) {
		const userId = session.user.id;
		return this.guidelineService.create(createGuidelineDto, userId);
	}

	@Get()
	findAll(
		@Query('mine', new ParseBoolPipe({ optional: true })) mine: boolean = true,
		@Session() session: UserSession
	) {
		return this.guidelineService.findAll(session.user.id, mine);
	}

	@Get('deep/:id')
	@ApiResponse({ status: 200, type: ExpandedGuideline })
	findOneDeep(@Param('id', ParseIntPipe) id: number, @Session() session: UserSession) {
		return this.guidelineService.findOne(id, true, session.user.id);
	}

	@Get(':id')
	@ResourceOwnership('guideline')
	@ApiResponse({ status: 200, type: Guideline })
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.guidelineService.findOne(id, false);
	}

	@Post(':id/copy')
	copy(@Param('id', ParseIntPipe) id: number, @Session() session: UserSession) {
		return this.guidelineService.copy(id, session.user.id);
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
