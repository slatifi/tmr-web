import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	applyDecorators,
	UseGuards
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '@/database/database.service';

type ResourceOwnershipCheck = {
	resourceType: string;
	idParam?: string; // The parameter name in the request that contains the resource ID
	nested?: string[]; // Optional nested structure to check ownership in related resources
};

export const ResourceOwnership = (
	checks: ResourceOwnershipCheck[] | ResourceOwnershipCheck | string
) => {
	if (typeof checks === 'string') {
		checks = [{ resourceType: checks }];
	} else if (!Array.isArray(checks)) {
		checks = [checks];
	}
	return applyDecorators(ResourceOwnershipMetadata(checks), UseGuards(ResourceOwnershipGuard));
};

export const ResourceOwnershipMetadata = (checks: ResourceOwnershipCheck[]): MethodDecorator => {
	return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
		Reflect.defineMetadata('resourceOwnershipChecks', checks, descriptor.value as object);
	};
};

@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private db: DatabaseService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const checks = this.reflector.get<ResourceOwnershipCheck[]>(
			'resourceOwnershipChecks',
			context.getHandler()
		);

		if (!checks || checks.length === 0) return true; // No checks defined, skip the guard

		outer: for (const check of checks) {
			const { resourceType, idParam = 'id', nested = [] } = check;

			if (!resourceType) continue outer; // Skip if no resource type is defined

			const request = context.switchToHttp().getRequest();
			const userId = request.session?.user?.id;
			let resourceId = request.params[idParam];

			if (!resourceId && request.body && request.body[idParam]) {
				resourceId = request.body[idParam];
			}

			const parsedResourceId = parseInt(resourceId as string, 10);

			if (!userId || isNaN(parsedResourceId)) continue outer; // If userId or resourceId is not valid, skip the check

			// Check resource ownership
			// If the userId exists in a nested resource, we need to traverse the nested structure

			let selectQuery = {};
			if (nested.length > 0) {
				let ref = selectQuery;
				for (const key of nested) {
					ref[key] = {};
					ref[key].select = {};
					ref = ref[key].select;
				}
				ref['userId'] = true;
			} else {
				selectQuery = { userId: true };
			}

			const resource = await this.db[resourceType].findUnique({
				where: { id: parsedResourceId },
				select: selectQuery
			});

			if (!resource) {
				// If the resource does not exist, pass control back to the controller
				continue outer;
			} else {
				if (nested.length > 0) {
					let nestedResource = resource;
					for (const key of nested) {
						if (!nestedResource || !nestedResource[key]) {
							continue outer; // If any nested resource is not found, skip the check
						}
						nestedResource = nestedResource[key];
					}
					if (nestedResource.userId !== userId) {
						throw new ForbiddenException('You do not have permission to access this resource');
					}
				} else if (resource.userId !== userId) {
					throw new ForbiddenException('You do not have permission to access this resource');
				}
			}
		}
		return true;
	}
}
