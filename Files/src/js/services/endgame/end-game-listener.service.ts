import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { GameEvent } from '../../models/game-event';
import { DeckParserService } from '../decktracker/deck-parser.service';
import { Events } from '../events.service';
import { GameEventsEmitterService } from '../game-events-emitter.service';
import { EndGameUploaderService } from './end-game-uploader.service';

@Injectable()
export class EndGameListenerService {
	private currentGameId: string;

	constructor(
		private gameEvents: GameEventsEmitterService,
		private events: Events,
		private logger: NGXLogger,
		private deckService: DeckParserService,
		private endGameUploader: EndGameUploaderService,
	) {
		this.init();
	}

	private init(): void {
		this.events.on(Events.NEW_GAME_ID).subscribe(event => {
			this.logger.debug('Received new game id event', event);
			this.currentGameId = event.data[0];
		});
		this.gameEvents.allEvents.subscribe(async (event: GameEvent) => {
			if (event.type === GameEvent.GAME_END) {
				await this.endGameUploader.upload(event, this.currentGameId, this.deckService.currentDeck.deckstring);
			}
		});
	}
}
