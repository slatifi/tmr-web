import { CreateTransitionDto } from '@/cig/transition/dto/create-transition.dto';
import { Transition } from '@/cig/transition/entities/transition.entity';

export const transitionStub = {
	id: 1,
	property: 'BP',
	pre: 'LOW',
	post: 'NORMAL',
	derivative: 'INCREASE',
	contributionId: 2,
	createdAt: new Date(),
	updatedAt: new Date()
} as Transition;

export const transitionCreateStub = {
	property: 'BP',
	pre: 'LOW',
	post: 'NORMAL',
	derivative: 'INCREASE',
	contributionId: 2
} as CreateTransitionDto;
