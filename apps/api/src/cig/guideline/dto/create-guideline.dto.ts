import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateGuidelineDto {
	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsOptional()
	description?: string;
}
