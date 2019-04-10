import { EventParser } from "./event-parser";
import { GameEvent } from "../../../models/game-event";
import { GameState } from "../../../models/decktracker/game-state";
import { DeckCard } from "../../../models/decktracker/deck-card";
import { DeckParserService } from "../deck-parser.service";
import { AllCardsService } from "../../all-cards.service";
import { DeckState } from "../../../models/decktracker/deck-state";
import { DeckEvents } from "./deck-events";
import { DeckManipulationHelper as DeckManipulationHelper } from "./deck-manipulation-helper";

export class DiscardedCardParser implements EventParser {

    constructor() { }

    applies(gameEvent: GameEvent): boolean {
        if (gameEvent.type !== GameEvent.DISCARD_CARD) {
			return false;
		}
		const cardId: string = gameEvent.data[0];
		const controllerId: string = gameEvent.data[1];
		const localPlayer = gameEvent.data[2];
		return cardId && controllerId === localPlayer.PlayerId
    }    
    
    parse(currentState: GameState, gameEvent: GameEvent): GameState {
		const cardId: string = gameEvent.data[0];
		const card = currentState.playerDeck.hand.find((card) => card.cardId === cardId);
		const newHand: ReadonlyArray<DeckCard> = DeckManipulationHelper
				.removeSingleCardFromZone(currentState.playerDeck.hand, card.cardId);
		const newOther: ReadonlyArray<DeckCard> = DeckManipulationHelper
				.addSingleCardToZone(currentState.playerDeck.otherZone, card);
		const newPlayerDeck = Object.assign(new DeckState(), currentState.playerDeck, {
			hand: newHand,
			otherZone: newOther
		} as DeckState);
		return Object.assign(new GameState(), currentState, 
			{ 
				playerDeck: newPlayerDeck
			});
	}

	event(): string {
		return DeckEvents.DISCARD_CARD;
	}
}