import { RawRequirement } from '../../../../models/achievement/raw-requirement';
import { GameEvent } from '../../../../models/game-event';
import { Requirement } from './_requirement';

export class GameWonReq implements Requirement {
	private isWon: boolean;

	public static create(rawReq: RawRequirement): Requirement {
		return new GameWonReq();
	}

	reset(): void {
		// console.log('[debug] [won] reset');
		this.isWon = undefined;
	}

	afterAchievementCompletionReset(): void {
		// console.log('[debug] [won] afterAchievementCompletionReset');
		this.isWon = undefined;
	}

	isCompleted(): boolean {
		// console.log('[debug] [won] isCompleted', this.isWon);
		return this.isWon;
	}

	test(gameEvent: GameEvent): void {
		if (gameEvent.type === GameEvent.WINNER) {
			this.detectGameResultEvent(gameEvent);
			return;
		}
	}

	private detectGameResultEvent(gameEvent: GameEvent) {
		const winner = gameEvent.additionalData.winner;
		const localPlayer = gameEvent.localPlayer;
		if (winner && localPlayer?.Id === winner.Id) {
			this.isWon = true;
		}
		// console.log('[debug] [won] gameresult', this.isWon, gameEvent);
	}
}
