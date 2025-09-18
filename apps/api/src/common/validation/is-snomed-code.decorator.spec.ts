import { IsSnomedCodeConstraint } from './is-snomed-code.decorator';
import { ValidationArguments } from 'class-validator';

describe('IsSnomedCodeConstraint', () => {
	let constraint: IsSnomedCodeConstraint;

	beforeEach(() => {
		constraint = new IsSnomedCodeConstraint();
	});

	describe('validate', () => {
		it('should return true for valid SNOMED CT codes', () => {
			expect(constraint.validate('123456', {} as ValidationArguments)).toBe(true);
			expect(constraint.validate('12345678901234567', {} as ValidationArguments)).toBe(true);
		});

		it('should return false for codes starting with 0', () => {
			expect(constraint.validate('0123456', {} as ValidationArguments)).toBe(false);
		});

		it('should return false for codes shorter than 6 digits', () => {
			expect(constraint.validate('12345', {} as ValidationArguments)).toBe(false);
		});

		it('should return false for codes longer than 18 digits', () => {
			expect(constraint.validate('1234567890123456789', {} as ValidationArguments)).toBe(false);
		});

		it('should return false for non-numeric codes', () => {
			expect(constraint.validate('abcdef', {} as ValidationArguments)).toBe(false);
			expect(constraint.validate('12345a', {} as ValidationArguments)).toBe(false);
		});

		it('should return false for non-string input', () => {
			expect(constraint.validate(123456, {} as ValidationArguments)).toBe(false);
			expect(constraint.validate(null, {} as ValidationArguments)).toBe(false);
			expect(constraint.validate(undefined, {} as ValidationArguments)).toBe(false);
		});
	});

	describe('defaultMessage', () => {
		it('should return the correct error message', () => {
			const args = { value: 'badcode' } as ValidationArguments;
			expect(constraint.defaultMessage(args)).toBe('Code ($value) is not a valid SNOMED CT code.');
		});
	});
});
