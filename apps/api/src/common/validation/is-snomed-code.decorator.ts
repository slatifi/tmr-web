import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator';

const snomedRegex = /^[1-9]\d{5,17}$/;

@ValidatorConstraint({ async: false })
export class IsSnomedCodeConstraint implements ValidatorConstraintInterface {
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	validate(code: any, args: ValidationArguments) {
		return typeof code === 'string' && snomedRegex.test(code);
	}

	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	defaultMessage(args: ValidationArguments) {
		return 'Code ($value) is not a valid SNOMED CT code.';
	}
}

export function IsSnomedCode(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsSnomedCodeConstraint
		});
	};
}
