import {
	DerivativeSchema,
	type DerivativeType,
	SituationSchema,
	type SituationType
} from '@repo/shared-types';

export function titleCase(str: string): string {
	return str
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function validateDerivative(
	derivative: DerivativeType,
	pre: SituationType,
	post: SituationType
): boolean {
	if (pre === SituationSchema.enum.UNKNOWN || post === SituationSchema.enum.UNKNOWN) {
		return true;
	}

	// Check that the derivative is valid based on the pre and post situations
	// For example, if pre is 'NORMAL' and post is 'HIGH', the derivative must be 'INCREASE'
	const situations = SituationSchema.options;
	const preIndex = situations.indexOf(pre);
	const postIndex = situations.indexOf(post);

	if (preIndex < postIndex && derivative !== DerivativeSchema.enum.DECREASE) {
		return false;
	} else if (preIndex > postIndex && derivative !== DerivativeSchema.enum.INCREASE) {
		return false;
	} else if (preIndex === postIndex && derivative !== DerivativeSchema.enum.MAINTAIN) {
		return false;
	}

	return true;
}
