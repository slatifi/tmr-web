import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransitionDto } from './dto/create-transition.dto';
import { UpdateTransitionDto } from './dto/update-transition.dto';
import { DatabaseService } from '@/database/database.service';
import { Transition } from './entities/transition.entity';

@Injectable()
export class TransitionService {
	constructor(private readonly db: DatabaseService) {}

	async create(createTransitionDto: CreateTransitionDto) {
		const transition = await this.db.transition.create({
			data: createTransitionDto
		});
		return new Transition(transition);
	}

	async findAll(contributionId: number) {
		const transitions = await this.db.transition.findMany({
			where: { contributionId },
			orderBy: { createdAt: 'desc' }
		});
		return transitions.map((transition) => new Transition(transition));
	}

	async findOne(id: number) {
		const transition = await this.db.transition.findUnique({
			where: { id }
		});

		if (!transition) throw new NotFoundException(`Transition with ID ${id} not found`);
		return new Transition(transition);
	}

	async update(id: number, updateTransitionDto: UpdateTransitionDto) {
		const updatedTransition = await this.db.transition.update({
			where: { id },
			data: updateTransitionDto
		});

		if (!updatedTransition) throw new NotFoundException(`Transition with ID ${id} not found`);
		return new Transition(updatedTransition);
	}

	async remove(id: number) {
		return await this.db.transition.delete({
			where: { id }
		});
	}
}
