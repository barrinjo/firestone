import { AchievementSet } from "../../../models/achievement-set";
import { SetProvider, IndexedVisualAchievement } from "./set-provider";
import { VisualAchievement, CompletionStep } from "../../../models/visual-achievement";
import { Achievement } from "../../../models/achievement";
import { CompletedAchievement } from "../../../models/completed-achievement";
import { AllCardsService } from "../../all-cards.service";
import { FilterOption } from "../../../models/filter-option";
import { AchievementConfService } from "../achievement-conf.service";

export abstract class AbstractBossSetProvider extends SetProvider {

    private cardsService: AllCardsService;
    private logoName: string;
    private conf: AchievementConfService;

    constructor(
            id: string, categoryId, 
            displayName: string, 
            types: string[], 
            cardsService: AllCardsService, 
            conf: AchievementConfService) {
        super(id, displayName, types);
        this.logoName = categoryId;
        this.cardsService = cardsService;
        this.conf = conf;
    }

    // Used only for display
    public provide(allAchievements: Achievement[], completedAchievemnts?: CompletedAchievement[]): AchievementSet {
        const fullAchievements = this.visualAchievements(allAchievements, completedAchievemnts);
        const filterOptions: ReadonlyArray<FilterOption> = this.filterOptions();
        return new AchievementSet(this.id, this.displayName, this.logoName, fullAchievements, filterOptions);
    }

    protected filterOptions(): ReadonlyArray<FilterOption> {
        return [
            {
                value: 'ALL_ACHIEVEMENTS', 
                label: 'All achievements', 
                filterFunction: (a) => true, 
                emptyStateIcon: 'empty_state_Only_cards_I_have_illustration', 
                emptyStateTitle: 'Holy Moly, you are epic!', 
                emptyStateText: '100% of achievements in this category complete.' 
            },
            { 
                value: 'ONLY_MISSING', 
                label: 'Locked achievements', 
                filterFunction: (a: VisualAchievement) => {
                    return a.completionSteps.map((step) => step.numberOfCompletions).reduce((a, b) => a + b, 0) === 0;
                }, 
                emptyStateIcon: 'empty_state_Only_cards_I_don’t_have_illustration', 
                emptyStateTitle: 'Tons of achievements await you!', 
                emptyStateText: 'Find them listed here once completed.'
            },
            { 
                value: 'ENCOUNTERED_ONLY', 
                label: 'Encountered only', 
                filterFunction: (a: VisualAchievement) => {
                    return a.completionSteps[0].numberOfCompletions > 0 && a.completionSteps[1].numberOfCompletions === 0;
                }, 
                emptyStateIcon: 'empty_state_Only_cards_I_have_illustration', 
                emptyStateTitle: 'Tons of achievements await you!', 
                emptyStateText: 'Find them listed here once completed.'
            },
            { 
                value: 'ONLY_COMPLETED', 
                label: 'Completed achievements', 
                filterFunction: (a: VisualAchievement) => {
                    return a.completionSteps[0].numberOfCompletions > 0 && a.completionSteps[1].numberOfCompletions > 0;
                }, 
                emptyStateIcon: 'empty_state_Only_cards_I_have_illustration', 
                emptyStateTitle: 'Tons of achievements await you!', 
                emptyStateText: 'Find them listed here once completed.'
            },
        ];
    }

    protected convertToVisual(achievement: Achievement, index: number, mergedAchievements: Achievement[]): IndexedVisualAchievement {
        const encountedId = this.types[0] + '_' + achievement.cardId;
        const victoryId = this.types[1] + '_' + achievement.cardId;
        const encounterAchievement = mergedAchievements.filter((ach) => ach.id == encountedId)[0];
        const victoryAchievement = mergedAchievements.filter((ach) => ach.id == victoryId)[0];
        const cardText = this.cardsService.getCard(achievement.cardId).text || '...';
        const text = cardText.replace('<i>', '').replace('</i>', '').replace('[x]', '');
        // console.log('converting to visualachievement', achievement, index, mergedAchievements);
        const replayInfo = [ ...(encounterAchievement.replayInfo || []), ...(victoryAchievement.replayInfo || [])]
                .sort((a, b) => a.creationTimestamp - b.creationTimestamp);
        const completionSteps = [
            { 
                id: encountedId, 
                numberOfCompletions: encounterAchievement.numberOfCompletions,
                iconSvgSymbol: this.conf.icon(encounterAchievement.type),
                text(showTimes: boolean = false): string {
                    const times = showTimes ? `${encounterAchievement.numberOfCompletions} times` : ``;
                    return `You met ${achievement.name} ${times}`;
                },
            } as CompletionStep,
            { 
                id: victoryId, 
                numberOfCompletions: victoryAchievement.numberOfCompletions,
                iconSvgSymbol: this.conf.icon(victoryAchievement.type),
                text(showTimes: boolean = false): string {
                    const times = showTimes ? `${victoryAchievement.numberOfCompletions} times` : ``;
                    return `You defeated ${achievement.name} ${times}`;
                },
            } as CompletionStep,
        ]
        return {
            achievement: new VisualAchievement(
                achievement.id,
                achievement.name, 
                this.id, 
                achievement.cardId,
                achievement.cardType,
                text,
                completionSteps,
                replayInfo),
            index: index 
        };
    }

    protected isAchievementVisualRoot(achievement: Achievement): boolean {
        return achievement.type == this.types[0];
    }
}