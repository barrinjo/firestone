/* eslint-disable @angular-eslint/template/no-negated-async */
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import {
	BgsMetaQuestRewardStatTier,
	BgsMetaQuestRewardStatTierItem,
	buildQuestRewardTiers,
} from '@firestone/battlegrounds/data-access';
import { AbstractSubscriptionComponent } from '@firestone/shared/framework/common';
import { ILocalizationService } from '@firestone/shared/framework/core';
import { BehaviorSubject, Observable, combineLatest, filter } from 'rxjs';

@Component({
	selector: 'battlegrounds-meta-stats-quest-rewards-view',
	styleUrls: [
		`./battlegrounds-meta-stats-quest-rewards-columns.scss`,
		`./battlegrounds-meta-stats-quest-rewards-view.component.scss`,
	],
	template: `
		<section
			class="battlegrounds-meta-stats-quests"
			[attr.aria-label]="'Battlegrounds meta quest rewards stats'"
			*ngIf="{
				tiers: tiers$ | async
			} as value"
		>
			<div class="header">
				<div class="image"></div>
				<div
					class="quest-details"
					[fsTranslate]="'app.battlegrounds.tier-list.header-quest-reward-details'"
				></div>
				<div class="position" [fsTranslate]="'app.battlegrounds.tier-list.header-average-position'"></div>

				<div class="button-groups">
					<fs-text-input
						class="search"
						[value]="searchString"
						[placeholder]="'app.battlegrounds.tier-list.reward-search-placeholder' | fsTranslate"
						[debounceTime]="100"
						(fsModelUpdate)="onSearchStringUpdated($event)"
					>
					</fs-text-input>
				</div>
			</div>
			<div class="quests-list" role="list" scrollable>
				<battlegrounds-meta-stats-quest-reward-tier
					*ngFor="let tier of value.tiers; trackBy: trackByFn"
					role="listitem"
					[tier]="tier"
				></battlegrounds-meta-stats-quest-reward-tier>
			</div>
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsMetaStatsQuestRewardsViewComponent
	extends AbstractSubscriptionComponent
	implements AfterContentInit
{
	tiers$: Observable<readonly BgsMetaQuestRewardStatTier[]>;

	@Input() set stats(value: readonly BgsMetaQuestRewardStatTierItem[]) {
		this.stats$$.next(value);
	}
	@Input() searchString: string;

	private stats$$ = new BehaviorSubject<readonly BgsMetaQuestRewardStatTierItem[]>(null);
	private searchString$$ = new BehaviorSubject<string>(null);

	constructor(protected override readonly cdr: ChangeDetectorRef, private readonly i18n: ILocalizationService) {
		super(cdr);
	}

	trackByFn(index: number, stat: BgsMetaQuestRewardStatTier) {
		return stat.id;
	}

	ngAfterContentInit() {
		this.tiers$ = combineLatest([this.stats$$, this.searchString$$]).pipe(
			filter(([stats, searchString]) => !!stats),
			this.mapData(([stats, searchString]) => {
				const result = buildQuestRewardTiers(stats, searchString, this.i18n);
				console.debug('built tiers', result);
				return result;
			}),
		);
	}

	onSearchStringUpdated(value: string) {
		this.searchString$$.next(value);
	}
}
