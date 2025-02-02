import { GameState } from '../../../models/decktracker/game-state';
import { GameEvent } from '../../../models/game-event';
import { DeckManipulationHelper } from './deck-manipulation-helper';
import { EventParser } from './event-parser';

// Update infos about secret, before the ENTITY_UPDATE event
export class SecretWillTriggerParser implements EventParser {
	constructor(private readonly helper: DeckManipulationHelper) {}

	applies(gameEvent: GameEvent, state: GameState): boolean {
		return !!state;
	}

	async parse(currentState: GameState, gameEvent: GameEvent): Promise<GameState> {
		const [cardId, controllerId, localPlayer, entityId] = gameEvent.parse();
		const isPlayer = controllerId === localPlayer.PlayerId;
		const deck = isPlayer ? currentState.playerDeck : currentState.opponentDeck;

		// Only use the entity Id to avoid creating an empty card (with the card id) as a result
		const secretCard = deck.otherZone.find((e) => e.entityId === entityId);

		// Remove it from the deck if we have an initial decklist?
		// How to avoid removing it twice (eg a secret is drawn from deck and known in hand, then played)?
		// Maybe that's enough of an edge case for now?
		let newDeck = deck.deck;
		if (cardId && secretCard && !secretCard.cardId && !secretCard.creatorCardId) {
			const [newDeckAfterReveal, removedCardFromDeck] = this.helper.removeSingleCardFromZone(
				newDeck,
				cardId,
				entityId,
				deck.deckList.length === 0,
				true,
				null,
			);

			if (removedCardFromDeck) {
				newDeck = newDeckAfterReveal;
			}
		}

		const newPlayerDeck = deck.update({
			deck: newDeck,
		});
		return currentState.update({
			[isPlayer ? 'playerDeck' : 'opponentDeck']: newPlayerDeck,
		});
	}

	event(): string {
		return GameEvent.SECRET_WILL_TRIGGER;
	}
}
