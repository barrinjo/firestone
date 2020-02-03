import { CardType } from '@firestone-hs/reference-data';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { GameState } from '../../../../models/decktracker/game-state';
import { GameEvent } from '../../../../models/game-event';
import { DeckManipulationHelper } from '../deck-manipulation-helper';
import { EventParser } from '../event-parser';

export class HiddenCacheSecretParser implements EventParser {
	private readonly secretCardId = 'CFM_026';

	constructor(private readonly helper: DeckManipulationHelper, private readonly allCards: AllCardsService) {}

	// Whenever something occurs that publicly reveal a card, we try to assign its
	// cardId to the corresponding entity
	applies(gameEvent: GameEvent, state: GameState): boolean {
		return state && gameEvent.type === GameEvent.CARD_PLAYED;
	}

	async parse(currentState: GameState, gameEvent: GameEvent): Promise<GameState> {
		const [cardId, playedCardControllerId, localPlayer, entityId] = gameEvent.parse();
		const activePlayerId = gameEvent.gameState.ActivePlayerId;
		// Secrets don't trigger during your turn
		if (activePlayerId === playedCardControllerId) {
			return currentState;
		}

		const isPlayerWithCardPlayed = playedCardControllerId === localPlayer.PlayerId;
		const deckWithSecretToCheck = isPlayerWithCardPlayed ? currentState.opponentDeck : currentState.playerDeck;
		const dbCard = this.allCards.getCard(cardId);
		if (!dbCard || !dbCard.type || dbCard.type.toLowerCase() !== CardType[CardType.MINION].toLowerCase()) {
			return currentState;
		}
		const newPlayerDeck = this.helper.removeSecretOption(deckWithSecretToCheck, this.secretCardId);
		return Object.assign(new GameState(), currentState, {
			[isPlayerWithCardPlayed ? 'opponentDeck' : 'playerDeck']: newPlayerDeck,
		});
	}

	event(): string {
		return 'SECRET_MISDIRECTION';
	}
}
