import { CardIds, CardType } from '@firestone-hs/reference-data';
import { CardsFacadeService } from '@firestone/shared/framework/core';
import { ShortCard } from '@models/decktracker/game-state';
import { NonFunctionProperties } from '@services/utils';
import { ChoosingOptionsGameEvent } from '../mainwindow/game-events/choosing-options-game-event';
import { AttackOnBoard } from './attack-on-board';
import { BoardSecret } from './board-secret';
import { DeckCard } from './deck-card';
import { HeroCard } from './hero-card';
import { DynamicZone } from './view/dynamic-zone';

export const POGO_CARD_IDS = [
	CardIds.PogoHopper_BOT_283,
	CardIds.PogoHopper_BGS_028,
	CardIds.PogoHopper_TB_BaconUps_077,
];

export class DeckState {
	private static readonly GALAKROND_CARD_IDS = [
		CardIds.GalakrondTheUnspeakable,
		CardIds.GalakrondTheUnspeakable_GalakrondTheApocalypseToken,
		CardIds.GalakrondTheUnspeakable_GalakrondAzerothsEndToken,
		CardIds.GalakrondTheNightmare,
		CardIds.GalakrondTheNightmare_GalakrondTheApocalypseToken,
		CardIds.GalakrondTheNightmare_GalakrondAzerothsEndToken,
		CardIds.GalakrondTheTempest,
		CardIds.GalakrondTheTempest_GalakrondTheApocalypseToken,
		CardIds.GalakrondTheTempest_GalakrondAzerothsEndToken,
		CardIds.GalakrondTheWretched,
		CardIds.GalakrondTheWretched_GalakrondTheApocalypseToken,
		CardIds.GalakrondTheWretched_GalakrondAzerothsEndToken,
		CardIds.GalakrondTheUnbreakable,
		CardIds.GalakrondTheUnbreakable_GalakrondTheApocalypseToken,
		CardIds.GalakrondTheUnbreakable_GalakrondAzerothsEndToken,
	];

	private static readonly NEW_CTHUN_CARD_IDS = [
		CardIds.CthunTheShattered,
		CardIds.CthunTheShattered_BodyOfCthunToken,
		CardIds.BodyOfCthun_CthunsBodyToken,
		CardIds.CthunTheShattered_EyeOfCthunToken,
		CardIds.CthunTheShattered_HeartOfCthunToken,
		CardIds.CthunTheShattered_MawOfCthunToken,
		CardIds.MaskOfCthun,
	];

	readonly isFirstPlayer: boolean;
	readonly isActivePlayer: boolean;
	readonly isOpponent: boolean;
	readonly deckstring?: string;
	readonly duelsStartingDeckstring?: string;
	readonly sideboards?: readonly DeckSideboard[];
	readonly name?: string;
	readonly hero?: HeroCard;
	readonly heroPower: DeckCard;
	readonly weapon: DeckCard;
	readonly deckList: readonly DeckCard[] = [];
	readonly unknownRealCardsInDeck: boolean;
	// This is too cumbersome to compute for the opponent deck when the decklist is known,
	// so we just read it form the game entities
	readonly cardsLeftInDeck: number;
	readonly showDecklistWarning: boolean;

	readonly secrets: readonly BoardSecret[] = [];
	readonly secretHelperActive: boolean = true;

	readonly totalAttackOnBoard: AttackOnBoard;
	readonly galakrondInvokesCount: number = 0;
	readonly cthunAtk: number = 0;
	readonly cthunHealth: number = 0;
	readonly jadeGolemSize: number = 0;
	readonly pogoHopperSize: number = 0;
	readonly astralAutomatonsSummoned: number = 0;
	readonly earthenGolemsSummoned: number = 0;
	readonly treantsSummoned: number = 0;
	readonly fatigue: number = 0;
	readonly overloadedCrystals: number = 0;
	readonly corpsesSpent: number = 0;
	readonly abyssalCurseHighestValue: number = 0;
	readonly spellsPlayedThisMatch: readonly DeckCard[] = [];
	readonly uniqueSpellSchools: readonly string[] = [];
	readonly cardsPlayedThisMatch: readonly ShortCard[] = [];
	readonly manaSpentOnSpellsThisMatch: number = 0;
	readonly watchpostsPlayedThisMatch: number = 0;
	readonly libramsPlayedThisMatch: number = 0;
	readonly chaoticTendrilsPlayedThisMatch: number = 0;
	readonly elementalsPlayedThisTurn: number = 0;
	readonly elementalsPlayedLastTurn: number = 0;
	readonly elwynnBoarsDeadThisMatch: number = 0;
	readonly volatileSkeletonsDeadThisMatch: number = 0;
	readonly relicsPlayedThisMatch: number = 0;
	readonly heroPowerDamageThisMatch: number = 0;
	readonly heroAttacksThisMatch: number = 0;
	readonly minionsDeadSinceLastTurn: readonly ShortCard[] = [];
	readonly minionsDeadThisTurn: readonly ShortCard[] = [];
	readonly anachronosTurnsPlayed: readonly number[] = [];
	readonly bonelordFrostwhisperFirstTurnTrigger: number = null;
	readonly plaguesShuffledIntoEnemyDeck: number = 0;
	// readonly secretHelperActiveHover: boolean = false;

	// Graveyard is not so easy in fact - we want to know the cards that
	// can be interacted with, which means dead minions for Priest, or
	// discarded cards for warlock (if the warlock decks contains specific
	// cards)
	// readonly graveyard: ReadonlyArray<DeckCard> = [];
	readonly hand: readonly DeckCard[] = [];
	readonly deck: readonly DeckCard[] = [];
	readonly board: readonly DeckCard[] = [];
	readonly otherZone: readonly DeckCard[] = [];
	readonly globalEffects: readonly DeckCard[] = [];
	readonly dynamicZones: readonly DynamicZone[] = [];

	readonly currentOptions?: readonly CardOption[] = [];

	readonly cardsPlayedLastTurn: readonly DeckCard[] = [];
	readonly cardsPlayedThisTurn: readonly DeckCard[] = [];
	readonly lastDeathrattleTriggered?: string;
	readonly manaUsedThisTurn: number = 0;
	readonly manaLeft: number = 0;
	// readonly cardsPlayedThisMatch: readonly DeckCard[] = [];
	readonly damageTakenThisTurn: number;
	readonly cardsPlayedFromInitialDeck: readonly { entityId: number; cardId: string }[] = [];
	readonly turnTimings: readonly TurnTiming[] = [];
	readonly turnDuration: number;

	public static create(value: Partial<NonFunctionProperties<DeckState>>): DeckState {
		return Object.assign(new DeckState(), value);
	}

	public update(value: Partial<NonFunctionProperties<DeckState>>): DeckState {
		return Object.assign(new DeckState(), this, value);
	}

	public updateSpellsPlayedThisMatch(spell: DeckCard, allCards: CardsFacadeService): DeckState {
		if (!spell) {
			return this;
		}

		const refCard = allCards.getCard(spell.cardId);
		if (refCard.type?.toUpperCase() !== CardType[CardType.SPELL]) {
			return this;
		}

		const spellsPlayedThisMatch = [...(this.spellsPlayedThisMatch ?? []), spell];
		const uniqueSpellSchools = [
			...new Set(
				(spellsPlayedThisMatch ?? [])
					.map((card) => card.cardId)
					.map((cardId) => allCards.getCard(cardId).spellSchool)
					.filter((spellSchool) => !!spellSchool),
			),
		];
		return this.update({
			spellsPlayedThisMatch: spellsPlayedThisMatch,
			uniqueSpellSchools: uniqueSpellSchools,
		});
	}

	public findCard(entityId: number): { zone: 'hand' | 'deck' | 'board' | 'other'; card: DeckCard } {
		const zones: { id: 'hand' | 'deck' | 'board' | 'other'; cards: readonly DeckCard[] }[] = [
			{ id: 'hand', cards: this.hand },
			{ id: 'deck', cards: this.deck },
			{ id: 'board', cards: this.board },
			{ id: 'other', cards: this.otherZone },
		];
		for (const zone of zones) {
			const result = zone.cards.find((card) => card.entityId === entityId);
			if (!!result) {
				return { zone: zone.id, card: result };
			}
		}

		return null;
	}

	public totalCardsInZones(): number {
		return (
			(this.deck?.length ?? 0) +
			(this.hand?.length ?? 0) +
			(this.board?.length ?? 0) +
			(this.otherZone?.length ?? 0)
		);
	}

	public getAllCardsInDeck(): readonly { entityId: number; cardId: string }[] {
		return [
			...this.deckList,
			...this.hand,
			...this.deck,
			...this.board,
			...this.currentOptions,
			...this.otherZone.filter((card) => card.zone !== 'SETASIDE'),
		];
	}

	// TODO: Probably not the place for these methods
	public containsGalakrond(allCards?: CardsFacadeService): boolean {
		if (this.galakrondInvokesCount > 0) {
			return true;
		}

		return this.getAllCardsInDeck()
			.filter((card) => card.cardId)
			.some(
				(card) =>
					DeckState.GALAKROND_CARD_IDS.indexOf(card.cardId as CardIds) !== -1 ||
					card.cardId === CardIds.KronxDragonhoof ||
					(allCards &&
						allCards.getCard(card.cardId)?.text &&
						allCards.getCard(card.cardId)?.text?.indexOf('Invoke Galakrond') !== -1),
			);
	}

	public containsCthun(allCards: CardsFacadeService): boolean {
		if (this.cthunAtk > 0 || this.cthunHealth > 0) {
			return true;
		}

		return this.getAllCardsInDeck()
			.filter((card) => card.cardId)
			.filter((card) => !DeckState.NEW_CTHUN_CARD_IDS.includes(card.cardId as CardIds))
			.some(
				(card) =>
					card.cardId === CardIds.Cthun_OG_280 ||
					(allCards &&
						allCards.getCard(card.cardId)?.text &&
						allCards.getCard(card.cardId)?.text?.indexOf("C'Thun") !== -1),
			);
	}

	private hasRelevantCardLimited(cardIds: readonly CardIds[] | ((cardId: string) => boolean), excludesDeck = false) {
		let pool = [...this.hand, ...this.currentOptions].map((card) => card.cardId);
		if (!excludesDeck) {
			pool = pool.concat(this.deck.map((card) => card.cardId));
		}
		// console.debug(
		// 	'checking for relevant card 2',
		// 	cardIds instanceof Array ? cardIds.join('') : cardIds,
		// 	// pool.join(', '),
		// 	excludesDeck,
		// 	cardIds instanceof Array,
		// 	pool.concat(!excludesDeck ? this.getCardsInSideboards() : []).join(', '),
		// );
		return pool
			.concat(!excludesDeck ? this.getCardsInSideboards() : [])
			.filter((cardId: string) => !!cardId)
			.some((cardId) =>
				Array.isArray(cardIds) ? cardIds.includes(cardId as CardIds) : (cardIds as any)(cardId),
			);
	}

	public hasRelevantCard(
		cardIds: readonly CardIds[] | ((cardId: string) => boolean),
		options?: {
			excludesDeckInLimited?: boolean;
			onlyLimited?: boolean;
		},
	) {
		// if you have such a card in your hand and deck, or as a discover optip,; show the counter
		// console.debug(
		// 	'checking for relevant card',
		// 	this.hasRelevantCardLimited(cardIds, options?.onlyLimited && !options.excludesDeckInLimited),
		// 	options,
		// );
		if (this.hasRelevantCardLimited(cardIds, options?.onlyLimited && !options.excludesDeckInLimited)) {
			return true;
		}

		if (options?.onlyLimited) {
			return false;
		}

		return [...this.deckList, ...this.board, ...this.otherZone.filter((card) => card.zone !== 'SETASIDE')]
			.map((card) => card.cardId)
			.concat(this.getCardsInSideboards())
			.filter((cardId: string) => !!cardId)
			.some((cardId) =>
				Array.isArray(cardIds) ? cardIds.includes(cardId as CardIds) : (cardIds as any)(cardId),
			);
	}

	public hasMurozondTheInfinite() {
		return [...this.hand, ...this.currentOptions]
			.filter((card) => card.cardId)
			.some(
				(card) =>
					card.cardId === CardIds.MurozondTheInfinite_DRG_090 ||
					card.cardId === CardIds.MurozondTheInfinite_CORE_DRG_090,
			);
	}

	public firstBattlecryPlayedThisTurn(allCards: CardsFacadeService): DeckCard {
		if (!this.cardsPlayedThisTurn?.length) {
			return null;
		}

		const battlecryCards = this.cardsPlayedThisTurn.filter((card) => {
			const ref = allCards.getCard(card.cardId);
			return !!ref.mechanics?.length && ref.mechanics.includes('BATTLECRY');
		});
		if (!battlecryCards?.length) {
			return null;
		}

		return battlecryCards[0];
	}

	public getCardsInSideboards(): readonly string[] {
		return (this.sideboards ?? []).flatMap((s) => s.cards ?? []);
	}
}

export interface TurnTiming {
	readonly turn: number;
	readonly startTimestamp: number;
	readonly endTimestamp: number;
}

export interface CardOption {
	readonly entityId: number;
	readonly cardId: string;
	readonly source: string;
	readonly context: ChoosingOptionsGameEvent['additionalData']['context'];
	readonly questDifficulty?: number;
	readonly questReward?: {
		readonly EntityId: number;
		readonly CardId: string;
	};
}

export interface DeckSideboard {
	readonly keyCardId: string;
	readonly cards: readonly string[];
}
