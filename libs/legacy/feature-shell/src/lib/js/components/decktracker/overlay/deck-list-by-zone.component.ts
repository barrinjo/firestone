import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy } from '@angular/core';
import { CardTooltipPositionType } from '@firestone/shared/common/view';
import { CardsFacadeService } from '@firestone/shared/framework/core';
import { DeckCard } from '../../../models/decktracker/deck-card';
import { DeckState } from '../../../models/decktracker/deck-state';
import { DeckZone, DeckZoneSection } from '../../../models/decktracker/view/deck-zone';
import { DynamicZone } from '../../../models/decktracker/view/dynamic-zone';
import { VisualDeckCard } from '../../../models/decktracker/visual-deck-card';
import { LocalizationFacadeService } from '../../../services/localization-facade.service';

@Component({
	selector: 'deck-list-by-zone',
	styleUrls: ['../../../../css/component/decktracker/overlay/deck-list-by-zone.component.scss'],
	template: `
		<ul class="deck-list">
			<li *ngFor="let zone of zones; trackBy: trackZone">
				<deck-zone
					[zone]="zone"
					[tooltipPosition]="_tooltipPosition"
					[colorManaCost]="colorManaCost"
					[showRelatedCards]="showRelatedCards"
					[showUnknownCards]="showUnknownCards"
					[showUpdatedCost]="showUpdatedCost"
					[showGiftsSeparately]="showGiftsSeparately"
					[showStatsChange]="showStatsChange"
					[showTopCardsSeparately]="_showTopCardsSeparately"
					[showBottomCardsSeparately]="_showBottomCardsSeparately"
					[darkenUsedCards]="_darkenUsedCards"
					[showTotalCardsInZone]="showTotalCardsInZone"
					[side]="side"
				></deck-zone>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckListByZoneComponent implements OnDestroy {
	@Input() colorManaCost: boolean;
	@Input() showRelatedCards: boolean;
	@Input() showUpdatedCost: boolean;
	@Input() showUnknownCards: boolean;
	@Input() showGiftsSeparately: boolean;
	@Input() showStatsChange: boolean;
	@Input() showTotalCardsInZone: boolean;
	@Input() side: 'player' | 'opponent' | 'duels';

	@Input() set showGlobalEffectsZone(value: boolean) {
		this._showGlobalEffectsZone = value;
		this.updateInfo();
	}

	@Input() set hideGeneratedCardsInOtherZone(value: boolean) {
		if (value === this._hideGeneratedCardsInOtherZone) {
			return;
		}
		this._hideGeneratedCardsInOtherZone = value;
		this.updateInfo();
	}

	@Input() set sortCardsByManaCostInOtherZone(value: boolean) {
		if (value === this._sortCardsByManaCostInOtherZone) {
			return;
		}
		this._sortCardsByManaCostInOtherZone = value;
		this.updateInfo();
	}

	@Input() set showBottomCardsSeparately(value: boolean) {
		if (value === this._showBottomCardsSeparately) {
			return;
		}
		this._showBottomCardsSeparately = value;
		this.updateInfo();
	}

	@Input() set showTopCardsSeparately(value: boolean) {
		if (value === this._showTopCardsSeparately) {
			return;
		}
		this._showTopCardsSeparately = value;
		this.updateInfo();
	}

	@Input() set tooltipPosition(value: CardTooltipPositionType) {
		this._tooltipPosition = value;
	}

	@Input() set deckState(value: DeckState) {
		if (value === this._deckState) {
			return;
		}
		this._deckState = value;
		this.updateInfo();
	}

	@Input() set darkenUsedCards(value: boolean) {
		this._darkenUsedCards = value;
	}

	zones: readonly DeckZone[];
	_tooltipPosition: CardTooltipPositionType;
	_showBottomCardsSeparately = true;
	_showTopCardsSeparately = true;
	_darkenUsedCards = true;

	private _showGlobalEffectsZone: boolean;
	private _hideGeneratedCardsInOtherZone: boolean;
	private _sortCardsByManaCostInOtherZone: boolean;
	private _deckState: DeckState;

	constructor(private readonly i18n: LocalizationFacadeService, private readonly allCards: CardsFacadeService) {}

	trackZone(index, zone: DeckZone) {
		return zone.id;
	}

	@HostListener('window:beforeunload')
	ngOnDestroy(): void {
		this._deckState = null;
		this.zones = null;
	}

	private updateInfo() {
		if (!this._deckState) {
			return;
		}
		const zones = [];

		if (this._showGlobalEffectsZone && this._deckState.globalEffects.length > 0) {
			zones.push(
				this.buildZone(
					this._deckState.globalEffects,
					null,
					'global-effects',
					this.i18n.translateString('decktracker.zones.global-effects'),
					null,
					null,
				),
			);
		}

		const deckSections: InternalDeckZoneSection[] = [];
		let cardsInDeckZone = this._deckState.deck;
		if (this._showTopCardsSeparately && this._deckState.deck.filter((c) => c.positionFromTop != undefined).length) {
			deckSections.push({
				header: this.i18n.translateString('decktracker.zones.top-of-deck'),
				sortingFunction: (a, b) => a.positionFromTop - b.positionFromTop,
				cards: this._deckState.deck.filter((c) => c.positionFromTop != undefined),
				order: -1,
			});
			cardsInDeckZone = cardsInDeckZone.filter((c) => c.positionFromTop == undefined);
		}
		if (
			this._showBottomCardsSeparately &&
			this._deckState.deck.filter((c) => c.positionFromBottom != undefined).length
		) {
			deckSections.push({
				header: this.i18n.translateString('decktracker.zones.bottom-of-deck'),
				sortingFunction: (a, b) => a.positionFromBottom - b.positionFromBottom,
				cards: this._deckState.deck.filter((c) => c.positionFromBottom != undefined),
				order: 1,
			});
			cardsInDeckZone = cardsInDeckZone.filter((c) => c.positionFromBottom == undefined);
		}
		deckSections.push({
			header: deckSections.length == 0 ? null : this.i18n.translateString('decktracker.zones.in-deck'),
			cards: cardsInDeckZone,
			sortingFunction: null,
			order: 0,
		});

		zones.push(
			Object.assign(
				this.buildZone(
					null,
					deckSections.sort((a, b) => a.order - b.order),
					'deck',
					this.i18n.translateString('decktracker.zones.in-deck'),
					null,
					this._deckState.cardsLeftInDeck,
				),
				{
					showWarning: this._deckState.showDecklistWarning,
				} as DeckZone,
			),
		);

		zones.push(
			this.buildZone(
				this._deckState.hand,
				null,
				'hand',
				this.i18n.translateString('decktracker.zones.in-hand'),
				null,
				this._deckState.hand.length,
				null,
				'in-hand',
			),
		);
		// If there are no dynamic zones, we use the standard "other" zone
		if (this._deckState.dynamicZones.length === 0) {
			const otherZone = [
				...this._deckState.otherZone
					// Frizz creates PLAY entities that don't have any information
					// D 17:41:27.4774901 PowerTaskList.DebugPrintPower() -     FULL_ENTITY - Updating [entityName=UNKNOWN ENTITY [cardType=INVALID] id=91 zone=SETASIDE zonePos=0 cardId= player=1] CardID=
					// D 17:41:27.4774901 PowerTaskList.DebugPrintPower() -         tag=ZONE value=SETASIDE
					// D 17:41:27.4774901 PowerTaskList.DebugPrintPower() -         tag=CONTROLLER value=1
					// D 17:41:27.4774901 PowerTaskList.DebugPrintPower() -         tag=ENTITY_ID value=91
					// D 17:41:27.4774901 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=[entityName=UNKNOWN ENTITY [cardType=INVALID] id=91 zone=SETASIDE zonePos=0 cardId= player=1] tag=ZONE value=PLAY
					// In the Other zone, we only want to have known cards (as they have been played / removed / etc.)
					.filter((c) => !!c.cardId?.length)
					.filter(
						(c) => (c.cardType ?? this.allCards.getCard(c.cardId).type)?.toLowerCase() !== 'enchantment',
					),
				...this._deckState.board,
			];
			zones.push(
				this.buildZone(
					otherZone,
					null,
					'other',
					this.i18n.translateString('decktracker.zones.other'),
					this._sortCardsByManaCostInOtherZone
						? (a, b) => a.manaCost - b.manaCost
						: (a, b) => this.sortByIcon(a, b),
					null,
					// We want to keep the info in the deck state (that there are cards in the SETASIDE zone) but
					// not show them in the zones
					// (a: VisualDeckCard) => a.zone !== 'SETASIDE',
					// Cards like Tracking put cards from the deck to the SETASIDE zone, so we want to
					// keep them in fact. We have added a specific flag for cards that are just here
					// for technical reasons
					(a: VisualDeckCard) =>
						// See comment on temporary cards in grouped-deck-list.component.ts
						(!a.temporaryCard || a.zone !== 'SETASIDE') &&
						!a.createdByJoust &&
						!(this._hideGeneratedCardsInOtherZone && a.creatorCardId) &&
						!(this._hideGeneratedCardsInOtherZone && a.creatorCardIds && a.creatorCardIds.length > 0),
				),
			);
		}
		// Otherwise, we add all the dynamic zones
		this._deckState.dynamicZones.forEach((zone) => {
			zones.push(this.buildDynamicZone(zone, null));
		});
		this.zones = zones as readonly DeckZone[];
	}

	private buildDynamicZone(
		zone: DynamicZone,
		sortingFunction: (a: VisualDeckCard, b: VisualDeckCard) => number,
	): DeckZone {
		return {
			id: zone.id,
			name: zone.name,
			sections: [
				{
					header: null,
					cards: zone.cards.map((card) =>
						VisualDeckCard.create(card).update({
							creatorCardIds: (card.creatorCardId ? [card.creatorCardId] : []) as readonly string[],
							lastAffectedByCardIds: (card.lastAffectedByCardId
								? [card.lastAffectedByCardId]
								: []) as readonly string[],
						}),
					),
					sortingFunction: sortingFunction,
				},
			],
			numberOfCards: zone.cards.length,
		} as DeckZone;
	}

	private buildZone(
		cards: readonly DeckCard[],
		zones: readonly InternalDeckZoneSection[],
		id: string,
		name: string,
		sortingFunction: (a: VisualDeckCard, b: VisualDeckCard) => number,
		numberOfCards: number,
		filterFunction?: (a: VisualDeckCard) => boolean,
		highlight?: string,
	): DeckZone {
		let sections: DeckZoneSection[] = [];
		if (zones == null) {
			sections.push({
				header: null,
				cards: cards
					.map((card) =>
						VisualDeckCard.create(card).update({
							creatorCardIds: (card.creatorCardId ? [card.creatorCardId] : []) as readonly string[],
							lastAffectedByCardIds: (card.lastAffectedByCardId
								? [card.lastAffectedByCardId]
								: []) as readonly string[],
							highlight: highlight as any,
						}),
					)
					.filter((card) => !filterFunction || filterFunction(card)),
				sortingFunction: sortingFunction,
			});
		} else if (cards == null) {
			sections = zones.map((zone) => ({
				header: zone.header,
				cards: zone.cards
					.map((card) =>
						VisualDeckCard.create(card).update({
							creatorCardIds: (card.creatorCardId ? [card.creatorCardId] : []) as readonly string[],
							lastAffectedByCardIds: (card.lastAffectedByCardId
								? [card.lastAffectedByCardId]
								: []) as readonly string[],
							highlight: highlight as any,
						}),
					)
					.filter((card) => !filterFunction || filterFunction(card)),
				sortingFunction: zone.sortingFunction,
			}));
		}
		if (numberOfCards !== null && numberOfCards !== sections.flatMap((section) => section.cards).length) {
			// console.warn(
			// 	'incorrect number of cards in zone',
			// 	name,
			// 	numberOfCards,
			// 	sections.flatMap((section) => section.cards).length,
			// );
		}
		return {
			id: id,
			name: name,
			numberOfCards: numberOfCards != null ? numberOfCards : sections.flatMap((section) => section.cards).length,
			sections: sections,
		} as DeckZone;
	}

	private sortByIcon(a: VisualDeckCard, b: VisualDeckCard): number {
		if (a.zone === 'PLAY' && b.zone !== 'PLAY') {
			return -1;
		}
		if (a.zone !== 'PLAY' && b.zone === 'PLAY') {
			return 1;
		}
		if (a.zone === 'GRAVEYARD' && b.zone !== 'GRAVEYARD') {
			return -1;
		}
		if (a.zone !== 'GRAVEYARD' && b.zone === 'GRAVEYARD') {
			return 1;
		}
		if (a.zone === 'DISCARD' && b.zone !== 'DISCARD') {
			return -1;
		}
		if (a.zone !== 'DISCARD' && b.zone === 'DISCARD') {
			return 1;
		}
		if (a.countered && !b.countered) {
			return -1;
		}
		if (!a.countered && b.countered) {
			return 1;
		}
		return 0;
	}
}

export interface InternalDeckZoneSection {
	header: string;
	cards: readonly DeckCard[];
	sortingFunction: (a: VisualDeckCard, b: VisualDeckCard) => number;
	order?: number;
}
