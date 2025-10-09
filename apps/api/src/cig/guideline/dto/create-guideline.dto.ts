import { IsOptional, IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateGuidelineDto {
	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	public?: boolean;
}
