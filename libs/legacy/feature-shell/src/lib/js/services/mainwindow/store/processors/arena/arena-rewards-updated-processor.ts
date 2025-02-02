import { ArenaRewardInfo } from '@firestone-hs/api-arena-rewards';
import { Input } from '@firestone-hs/api-arena-rewards/dist/sqs-event';
import { ArenaState } from '../../../../../models/arena/arena-state';
import { MainWindowState } from '../../../../../models/mainwindow/main-window-state';
import { NavigationState } from '../../../../../models/mainwindow/navigation/navigation-state';
import { ArenaRewardsUpdatedEvent } from '../../events/arena/arena-rewards-updated-event';
import { Processor } from '../processor';

export class ArenaRewardsUpdatedProcessor implements Processor {
	public async process(
		event: ArenaRewardsUpdatedEvent,
		currentState: MainWindowState,
		stateHistory,
		navigationState: NavigationState,
	): Promise<[MainWindowState, NavigationState]> {
		const runId = event.rewards.runId;
		if (currentState.arena.rewards?.some((reward) => reward.runId === runId)) {
			console.log('[arena-rewards] rewards have already been added', runId);
			return [null, null];
		}

		const newRewards: readonly ArenaRewardInfo[] = [
			...(currentState.arena.rewards ?? []),
			...this.buildRewards(event.rewards),
		];
		const result = [
			currentState.update({
				arena: currentState.arena.update({
					rewards: newRewards,
				} as ArenaState),
			} as MainWindowState),
			null,
		];
		return result as any;
	}

	private buildRewards(input: Input): readonly ArenaRewardInfo[] {
		if (!input?.rewards?.length) {
			return [];
		}

		return input.rewards.map(
			(reward) =>
				({
					creationDate: new Date().toDateString(),
					losses: input.currentLosses,
					reviewId: input.reviewId,
					runId: input.runId,
					userId: input.userId,
					userName: input.userName,
					wins: input.currentWins,
					rewardAmount: reward.Amount,
					rewardBoosterId: reward.BoosterId,
					rewardType: reward.Type,
				} as ArenaRewardInfo),
		);
	}
}
