import {
	DerivativeSchema,
	SituationSchema,
	type SituationType,
	type DerivativeType
} from '@repo/shared-types';

export function titleCase(str: string): string {
	return str
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function calculateDerivative(pre: SituationType, post: SituationType): DerivativeType | '' {
	// Check that the derivative is valid based on the pre and post situations
	// For example, if pre is 'NORMAL' and post is 'HIGH', the derivative must be 'INCREASE'
	const situations = SituationSchema.options;
	const preIndex = situations.indexOf(pre);
	const postIndex = situations.indexOf(post);

	if (preIndex < postIndex) {
		return DerivativeSchema.enum.DECREASE;
	} else if (preIndex > postIndex) {
		return DerivativeSchema.enum.INCREASE;
	} else if (preIndex === postIndex) {
		return DerivativeSchema.enum.MAINTAIN;
	}

	return '';
}

export const svelteFlowHandleStyle = (isLeft: boolean) =>
	`top: 50%; transform: translateY(-50%); left: ${isLeft ? 'auto' : '-4px'}; right: ${
		isLeft ? '-4px' : 'auto'
	};`;
