import { BgsQuestStats } from '@firestone-hs/bgs-global-stats';
import { CardIds, normalizeHeroCardId } from '@firestone-hs/reference-data';
import { CardsFacadeService } from '@firestone/shared/framework/core';
import { BattlegroundsState } from '../../../models/battlegrounds/battlegrounds-state';
import { CardOption } from '../../../models/decktracker/deck-state';
import { GameState } from '../../../models/decktracker/game-state';
import { LocalizationFacadeService } from '../../../services/localization-facade.service';

export const buildCardChoiceValue = (
	option: CardOption,
	state: GameState,
	bgsState: BattlegroundsState,
	bgsQuests: BgsQuestStats,
	allCards: CardsFacadeService,
	i18n: LocalizationFacadeService,
): { value: string; details?: any } => {
	switch (option.source) {
		case CardIds.GuessTheWeight:
			return guessTheWeight(option, state, allCards, i18n);
		case CardIds.DiscoverQuestRewardDntToken:
			return bgQuest(option, bgsState, bgsQuests, allCards, i18n);
	}
};

export const buildCardChoiceTooltip = (
	option: CardOption,
	details: any,
	allCards: CardsFacadeService,
	i18n: LocalizationFacadeService,
): string => {
	switch (option.source) {
		case CardIds.DiscoverQuestRewardDntToken:
			return i18n.translateString('battlegrounds.in-game.quests.turn-to-complete-tooltip', {
				averageTurnsToComplete: details?.averageTurnsToComplete?.toFixed(1),
				turnsToCompleteForHero: details?.turnsToCompleteForHero?.toFixed(1),
				turnsToCompleteImpact: details?.turnsToCompleteImpact?.toFixed(1),
			});
		default:
			return null;
	}
};

const bgQuest = (
	option: CardOption,
	bgsState: BattlegroundsState,
	bgsQuests: BgsQuestStats,
	allCards: CardsFacadeService,
	i18n: LocalizationFacadeService,
): { value: string; details: any } => {
	const bgQuestCardId = option.cardId;
	const mainPlayerCardId = bgsState?.currentGame?.getMainPlayer()?.cardId;
	// TODO: handle difficulty, MMR, etc.
	const questStat = bgsQuests.questStats.find((s) => s.questCardId === bgQuestCardId);
	console.debug('questStat', questStat, bgsState?.currentGame?.getMainPlayer());
	const statForHero = questStat?.heroStats.find(
		(s) => s.heroCardId === normalizeHeroCardId(mainPlayerCardId, allCards),
	);
	console.debug('statForHero', statForHero);
	const statForDifficulty = questStat?.difficultyStats?.find((s) => s.difficulty === option.questDifficulty);
	const turnsToCompleteImpact = statForDifficulty?.impactTurnToComplete ?? 0;
	console.debug('turnsToCompleteImpact', turnsToCompleteImpact, statForDifficulty);
	const turnsToComplete = statForHero == null ? null : statForHero.averageTurnToComplete + turnsToCompleteImpact;
	const currentTurn = bgsState.currentGame.currentTurn;
	const turnsLeftToComplete = turnsToComplete == null ? null : turnsToComplete - currentTurn;
	return turnsLeftToComplete == null
		? null
		: {
				value: turnsLeftToComplete.toFixed(1),
				details: {
					averageTurnsToComplete: questStat.averageTurnToComplete,
					turnsToCompleteForHero: statForHero?.averageTurnToComplete,
					turnsToCompleteImpact: turnsToCompleteImpact,
				},
		  };
};

const guessTheWeight = (
	option: CardOption,
	state: GameState,
	allCards: CardsFacadeService,
	i18n: LocalizationFacadeService,
): { value: string } => {
	const lastDrawnCard = state.playerDeck.hand[state.playerDeck.hand.length - 1];
	const costOfLastDrawnCard = lastDrawnCard?.getEffectiveManaCost();
	if (costOfLastDrawnCard == null) {
		return null;
	}

	// Don't show any information if there are some unknowns in the deck
	const hasCardWithoutCostInDeck = state.playerDeck.deck.some((c) => c.getEffectiveManaCost() == null);
	if (hasCardWithoutCostInDeck) {
		return null;
	}

	switch (option.cardId) {
		case CardIds.GuessTheWeight_Less:
			const cardsCostingLess = state.playerDeck.deck.filter(
				(c) => c.getEffectiveManaCost() < costOfLastDrawnCard,
			).length;
			return { value: buildPercents((100 * cardsCostingLess) / state.playerDeck.deck.length) };
		case CardIds.GuessTheWeight_More:
			const cardsCostingMore = state.playerDeck.deck.filter(
				(c) => c.getEffectiveManaCost() > costOfLastDrawnCard,
			).length;
			return { value: buildPercents((100 * cardsCostingMore) / state.playerDeck.deck.length) };
	}
	return null;
};

const buildPercents = (value: number): string => {
	return value == null ? '-' : value.toFixed(1) + '%';
};
