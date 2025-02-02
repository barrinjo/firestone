import { CardsFacadeService } from '@firestone/shared/framework/core';
import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { QuestReward } from '../../../../models/battlegrounds/bgs-player';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { BgsRewardGainedEvent } from '../events/bgs-reward-gained-event';
import { EventParser } from './_event-parser';

export class BgsRewardGainedParser implements EventParser {
	constructor(private readonly allCards: CardsFacadeService) {}

	public applies(gameEvent: BattlegroundsStoreEvent, state: BattlegroundsState): boolean {
		return state && state.currentGame && gameEvent.type === 'BgsRewardGainedEvent';
	}

	public async parse(currentState: BattlegroundsState, event: BgsRewardGainedEvent): Promise<BattlegroundsState> {
		const playerToUpdate = currentState.currentGame.findPlayer(event.playerId);
		if (!playerToUpdate) {
			return currentState;
		}

		const turn = currentState.currentGame.getCurrentTurnAdjustedForAsyncPlay();
		const reward: QuestReward = playerToUpdate.questRewards.find((r) => r.isHeroPower === event.isHeroPowerReward);
		if (!reward) {
			console.warn('[bgs-reward] missing reward', event, playerToUpdate.questRewards, playerToUpdate);
			return currentState;
		}

		const newRewards: readonly QuestReward[] = playerToUpdate.questRewards.map((r) =>
			r.isHeroPower === event.isHeroPowerReward
				? {
						...r,
						completed: true,
						completedTurn: turn,
				  }
				: r,
		);
		const newPlayer = playerToUpdate.update({
			questRewards: newRewards,
		});
		const newGame = currentState.currentGame.updatePlayer(newPlayer);
		return currentState.update({
			currentGame: newGame,
		} as BattlegroundsState);
	}
}
