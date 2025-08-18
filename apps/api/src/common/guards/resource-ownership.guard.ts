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

export const ResourceOwnership = (resourceType: string, idParam: string = 'id') => {
	return applyDecorators(
		ResourceOwnershipMetadata(resourceType, idParam),
		UseGuards(ResourceOwnershipGuard)
	);
};

export const ResourceOwnershipMetadata = (
	resourceType: string,
	idParam: string = 'id'
): MethodDecorator => {
	return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
		Reflect.defineMetadata('resourceType', resourceType, descriptor.value as object);
		Reflect.defineMetadata('idParam', idParam, descriptor.value as object);
	};
};

@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private db: DatabaseService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const resourceType = this.reflector.get<string>('resourceType', context.getHandler());
		const idParam = this.reflector.get<string>('idParam', context.getHandler());

		if (!resourceType) return true; // No metadata, skip the check

		const request = context.switchToHttp().getRequest();
		const userId = request.session?.user?.id;
		const resourceId = parseInt(request.params[idParam] as string, 10);

		if (!userId || isNaN(resourceId)) return false;

		// Check resource ownership
		const resource = await this.db[resourceType].findUnique({
			where: { id: resourceId },
			select: { userId: true }
		});

		if (!resource) {
			// If the resource does not exist, pass control back to the controller
			return true;
		} else if (resource.userId !== userId) {
			throw new ForbiddenException('You do not have permission to access this resource');
		}

		return true;
	}
}
