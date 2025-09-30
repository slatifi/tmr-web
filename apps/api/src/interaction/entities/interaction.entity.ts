import { ApiProperty } from '@nestjs/swagger';
import { InteractingPair as IInteractingPair } from '../interaction-rule.interface';

// This class doesn't provide any functionality - it is just used to generate Swagger documentation
class InteractingPair implements IInteractingPair {
	@ApiProperty({ enum: ['contribution', 'recommendation'] })
	entity: 'contribution' | 'recommendation';
	id1: number;
	id2: number;
}

export class InteractionEntity {
	alternative?: InteractingPair[];
	contribution_contradiction?: InteractingPair[];
	divergent?: InteractingPair[];
	recommendation_contradiction?: InteractingPair[];
	repairable?: InteractingPair[];
	repetition?: InteractingPair[];
	side_effect?: InteractingPair[];
}
