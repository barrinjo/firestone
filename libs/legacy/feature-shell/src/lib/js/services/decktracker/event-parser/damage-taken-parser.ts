import { DeckState } from '../../../models/decktracker/deck-state';
import { GameState } from '../../../models/decktracker/game-state';
import { GameEvent } from '../../../models/game-event';
import { DamageGameEvent } from '../../../models/mainwindow/game-events/damage-game-event';
import { EventParser } from './event-parser';

export class DamageTakenParser implements EventParser {
	applies(gameEvent: GameEvent, state: GameState): boolean {
		return !!state;
	}

	async parse(currentState: GameState, gameEvent: DamageGameEvent): Promise<GameState> {
		const localPlayerCardId = gameEvent.gameState?.Player?.Hero?.cardId ?? gameEvent.localPlayer?.CardID;
		const localPlayerId = gameEvent.localPlayer?.PlayerId;
		const damageForLocalPlayer = gameEvent.findTarget(localPlayerCardId);
		// We check that the cardID is indeed our cardId, in case of mirror matches for instance
		const localPlayerDamage =
			damageForLocalPlayer && damageForLocalPlayer.TargetControllerId === localPlayerId
				? damageForLocalPlayer.Damage
				: 0;

		// So that we also handle the case where the player has switched to another hero
		const opponentPlayerCardId = gameEvent.gameState?.Opponent?.Hero?.cardId ?? gameEvent.opponentPlayer?.CardID;
		const opponentPlayerId = gameEvent.opponentPlayer?.PlayerId;
		const damageForOpponentPlayer = gameEvent.findTarget(opponentPlayerCardId);
		const opponentPlayerDamage =
			damageForOpponentPlayer && damageForOpponentPlayer.TargetControllerId === opponentPlayerId
				? damageForOpponentPlayer.Damage
				: 0;

		const playerDeck = currentState.playerDeck.update({
			damageTakenThisTurn: (currentState.playerDeck.damageTakenThisTurn ?? 0) + localPlayerDamage,
		} as DeckState);
		const opponentDeck = currentState.opponentDeck.update({
			damageTakenThisTurn: (currentState.opponentDeck.damageTakenThisTurn ?? 0) + opponentPlayerDamage,
		} as DeckState);

		return Object.assign(new GameState(), currentState, {
			playerDeck: playerDeck,
			opponentDeck: opponentDeck,
		} as GameState);
	}

	event(): string {
		return GameEvent.DAMAGE;
	}
}
