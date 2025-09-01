import { z } from 'zod';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
	'ReadUncommitted',
	'ReadCommitted',
	'RepeatableRead',
	'Serializable'
]);

export const UserScalarFieldEnumSchema = z.enum([
	'id',
	'name',
	'email',
	'emailVerified',
	'image',
	'createdAt',
	'updatedAt'
]);

export const SessionScalarFieldEnumSchema = z.enum([
	'id',
	'expiresAt',
	'token',
	'createdAt',
	'updatedAt',
	'ipAddress',
	'userAgent',
	'userId'
]);

export const AccountScalarFieldEnumSchema = z.enum([
	'id',
	'accountId',
	'providerId',
	'userId',
	'accessToken',
	'refreshToken',
	'idToken',
	'accessTokenExpiresAt',
	'refreshTokenExpiresAt',
	'scope',
	'password',
	'createdAt',
	'updatedAt'
]);

export const VerificationScalarFieldEnumSchema = z.enum([
	'id',
	'identifier',
	'value',
	'expiresAt',
	'createdAt',
	'updatedAt'
]);

export const TransitionScalarFieldEnumSchema = z.enum([
	'id',
	'createdAt',
	'updatedAt',
	'derivative',
	'property',
	'pre',
	'post',
	'contributionId'
]);

export const ContributionScalarFieldEnumSchema = z.enum([
	'id',
	'createdAt',
	'updatedAt',
	'value',
	'recommendationId'
]);

export const RecommendationScalarFieldEnumSchema = z.enum([
	'id',
	'createdAt',
	'updatedAt',
	'action',
	'strength',
	'guidelineId'
]);

export const GuidelineScalarFieldEnumSchema = z.enum([
	'id',
	'createdAt',
	'updatedAt',
	'title',
	'description',
	'userId'
]);

export const SortOrderSchema = z.enum(['asc', 'desc']);

export const QueryModeSchema = z.enum(['default', 'insensitive']);

export const NullsOrderSchema = z.enum(['first', 'last']);

export const DerivativeSchema = z.enum(['INCREASE', 'DECREASE', 'MAINTAIN']);

export type DerivativeType = `${z.infer<typeof DerivativeSchema>}`;

export const SituationSchema = z.enum(['NORMAL', 'HIGH', 'LOW', 'UNKNOWN']);

export type SituationType = `${z.infer<typeof SituationSchema>}`;

export const ContributionValueSchema = z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']);

export type ContributionValueType = `${z.infer<typeof ContributionValueSchema>}`;

export const RecommendationStrengthSchema = z.enum(['SHOULD', 'NOT']);

export type RecommendationStrengthType = `${z.infer<typeof RecommendationStrengthSchema>}`;

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});

export type User = z.infer<typeof UserSchema>;

// USER RELATION SCHEMA
//------------------------------------------------------

export type UserRelations = {
	sessions: SessionWithRelations[];
	accounts: AccountWithRelations[];
	guidelines: GuidelineWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations;

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(
	z.object({
		sessions: z.lazy(() => SessionWithRelationsSchema).array(),
		accounts: z.lazy(() => AccountWithRelationsSchema).array(),
		guidelines: z.lazy(() => GuidelineWithRelationsSchema).array()
	})
);

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
	id: z.string(),
	expiresAt: z.coerce.date(),
	token: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	ipAddress: z.string().nullable(),
	userAgent: z.string().nullable(),
	userId: z.string()
});

export type Session = z.infer<typeof SessionSchema>;

// SESSION RELATION SCHEMA
//------------------------------------------------------

export type SessionRelations = {
	user: UserWithRelations;
};

export type SessionWithRelations = z.infer<typeof SessionSchema> & SessionRelations;

export const SessionWithRelationsSchema: z.ZodType<SessionWithRelations> = SessionSchema.merge(
	z.object({
		user: z.lazy(() => UserWithRelationsSchema)
	})
);

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
	id: z.string(),
	accountId: z.string(),
	providerId: z.string(),
	userId: z.string(),
	accessToken: z.string().nullable(),
	refreshToken: z.string().nullable(),
	idToken: z.string().nullable(),
	accessTokenExpiresAt: z.coerce.date().nullable(),
	refreshTokenExpiresAt: z.coerce.date().nullable(),
	scope: z.string().nullable(),
	password: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});

export type Account = z.infer<typeof AccountSchema>;

// ACCOUNT RELATION SCHEMA
//------------------------------------------------------

export type AccountRelations = {
	user: UserWithRelations;
};

export type AccountWithRelations = z.infer<typeof AccountSchema> & AccountRelations;

export const AccountWithRelationsSchema: z.ZodType<AccountWithRelations> = AccountSchema.merge(
	z.object({
		user: z.lazy(() => UserWithRelationsSchema)
	})
);

/////////////////////////////////////////
// VERIFICATION SCHEMA
/////////////////////////////////////////

export const VerificationSchema = z.object({
	id: z.string(),
	identifier: z.string(),
	value: z.string(),
	expiresAt: z.coerce.date(),
	createdAt: z.coerce.date().nullable(),
	updatedAt: z.coerce.date().nullable()
});

export type Verification = z.infer<typeof VerificationSchema>;

/////////////////////////////////////////
// TRANSITION SCHEMA
/////////////////////////////////////////

export const TransitionSchema = z.object({
	derivative: DerivativeSchema,
	pre: SituationSchema,
	post: SituationSchema,
	id: z.number().int(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	property: z.string(),
	contributionId: z.number().int()
});

export type Transition = z.infer<typeof TransitionSchema>;

// TRANSITION RELATION SCHEMA
//------------------------------------------------------

export type TransitionRelations = {
	contribution: ContributionWithRelations;
};

export type TransitionWithRelations = z.infer<typeof TransitionSchema> & TransitionRelations;

export const TransitionWithRelationsSchema: z.ZodType<TransitionWithRelations> =
	TransitionSchema.merge(
		z.object({
			contribution: z.lazy(() => ContributionWithRelationsSchema)
		})
	);

/////////////////////////////////////////
// CONTRIBUTION SCHEMA
/////////////////////////////////////////

export const ContributionSchema = z.object({
	value: ContributionValueSchema,
	id: z.number().int(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	recommendationId: z.number().int()
});

export type Contribution = z.infer<typeof ContributionSchema>;

// CONTRIBUTION RELATION SCHEMA
//------------------------------------------------------

export type ContributionRelations = {
	transition?: TransitionWithRelations | null;
	recommendation: RecommendationWithRelations;
};

export type ContributionWithRelations = z.infer<typeof ContributionSchema> & ContributionRelations;

export const ContributionWithRelationsSchema: z.ZodType<ContributionWithRelations> =
	ContributionSchema.merge(
		z.object({
			transition: z.lazy(() => TransitionWithRelationsSchema).nullable(),
			recommendation: z.lazy(() => RecommendationWithRelationsSchema)
		})
	);

/////////////////////////////////////////
// RECOMMENDATION SCHEMA
/////////////////////////////////////////

export const RecommendationSchema = z.object({
	strength: RecommendationStrengthSchema,
	id: z.number().int(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	action: z.string(),
	guidelineId: z.number().int()
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// RECOMMENDATION RELATION SCHEMA
//------------------------------------------------------

export type RecommendationRelations = {
	contributions: ContributionWithRelations[];
	guideline: GuidelineWithRelations;
};

export type RecommendationWithRelations = z.infer<typeof RecommendationSchema> &
	RecommendationRelations;

export const RecommendationWithRelationsSchema: z.ZodType<RecommendationWithRelations> =
	RecommendationSchema.merge(
		z.object({
			contributions: z.lazy(() => ContributionWithRelationsSchema).array(),
			guideline: z.lazy(() => GuidelineWithRelationsSchema)
		})
	);

/////////////////////////////////////////
// GUIDELINE SCHEMA
/////////////////////////////////////////

export const GuidelineSchema = z.object({
	id: z.number().int(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	title: z.string(),
	description: z.string().nullable(),
	userId: z.string()
});

export type Guideline = z.infer<typeof GuidelineSchema>;

// GUIDELINE RELATION SCHEMA
//------------------------------------------------------

export type GuidelineRelations = {
	recommendations: RecommendationWithRelations[];
	user: UserWithRelations;
};

export type GuidelineWithRelations = z.infer<typeof GuidelineSchema> & GuidelineRelations;

export const GuidelineWithRelationsSchema: z.ZodType<GuidelineWithRelations> =
	GuidelineSchema.merge(
		z.object({
			recommendations: z.lazy(() => RecommendationWithRelationsSchema).array(),
			user: z.lazy(() => UserWithRelationsSchema)
		})
	);
