import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { BgsHeroTier } from '@firestone-hs/bgs-global-stats';
import { BgsMetaHeroStatTierItem } from '@firestone/battlegrounds/data-access';
import { CardsFacadeService } from '@firestone/shared/framework/core';
import { Observable } from 'rxjs';
import { BgsQuestStat } from '../../../../models/battlegrounds/stats/bgs-hero-stat';
import { LocalizationFacadeService } from '../../../../services/localization-facade.service';
import { AppUiStoreFacadeService } from '../../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../../abstract-subscription-store.component';

// UNUSED

@Component({
	selector: 'battlegrounds-quests-tier-list',
	styleUrls: [
		`../../../../../css/component/battlegrounds/desktop/secondary/battlegrounds-quests-tier-list.component.scss`,
	],
	template: `
		<div class="battlegrounds-tier-list" *ngIf="stats$ | async as stats">
			<div class="title">
				{{
					'app.battlegrounds.bgs-tier-list.header'
						| owTranslate: { value: stats.totalMatches.toLocaleString('en-US') }
				}}
				<div class="info" [helpTooltip]="stats.tooltip" helpTooltipClasses="bgs-heroes-tier-list-tooltip">
					<svg>
						<use xlink:href="assets/svg/sprite.svg#info" />
					</svg>
				</div>
			</div>
			<div class="heroes" scrollable>
				<bgs-hero-tier
					*ngFor="let tier of stats.tiers || []; trackBy: trackByTierFn"
					[tier]="tier"
				></bgs-hero-tier>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsQuestsTierListComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit
{
	@Input() showFilters: boolean;

	stats$: Observable<{ tiers: readonly HeroTier[]; tooltip: string; totalMatches: number }>;

	// private percentiles: readonly MmrPercentile[] = [];

	constructor(
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly i18n: LocalizationFacadeService,
		private readonly allCards: CardsFacadeService,
	) {
		super(store, cdr);
	}

	ngAfterContentInit() {
		// this.store
		// 	.listen$(([main, nav, prefs]) => main.battlegrounds.globalStats.mmrPercentiles)
		// 	.pipe(this.mapData(([percentiles]) => percentiles))
		// 	.subscribe((percentiles) => {
		// 		this.percentiles = percentiles;
		// 	});
		// this.stats$ = combineLatest(
		// 	this.store.gameStats$(),
		// 	this.store.listen$(
		// 		([main, nav]) => main.battlegrounds.globalStats.getQuestStats(),
		// 		([main, nav]) => main.battlegrounds.globalStats.mmrPercentiles,
		// 		([main, nav]) => main.battlegrounds.globalStats.lastUpdateDate,
		// 		([main, nav, prefs]) => prefs.bgsActiveTimeFilter,
		// 		([main, nav, prefs]) => prefs.bgsActiveRankFilter,
		// 		([main, nav, prefs]) => prefs.bgsActiveHeroSortFilter,
		// 		([main, nav]) => main.battlegrounds.currentBattlegroundsMetaPatch,
		// 	),
		// ).pipe(
		// 	filter(
		// 		([gameStats, [stats, mmrPercentiles, lastUpdateDate, timeFilter, rankFilter, heroSort, patch]]) =>
		// 			!!stats?.length,
		// 	),
		// 	this.mapData(
		// 		([gameStats, [stats, mmrPercentiles, lastUpdateDate, timeFilter, rankFilter, heroSort, patch]]) => {
		// 			const questStats = buildQuestStats(
		// 				stats,
		// 				mmrPercentiles,
		// 				gameStats,
		// 				timeFilter,
		// 				rankFilter,
		// 				heroSort,
		// 				patch,
		// 				this.allCards,
		// 			);
		// 			const totalMatches = sumOnArray(questStats, (stat) => stat.totalMatches);
		// 			const groupingByTier = groupByFunction((overview: BgsQuestStat) => overview.tier);
		// 			const groupedByTier: (readonly BgsQuestStat[])[] = Object.values(groupingByTier(questStats));
		// 			const tiers: readonly HeroTier[] = [
		// 				{
		// 					tier: 'S' as BgsHeroTier,
		// 					heroes: [
		// 						...(groupedByTier.find((heroes) => heroes.find((hero) => hero.tier === 'S')) ?? []),
		// 					].sort((a, b) => a.averagePosition - b.averagePosition),
		// 				},
		// 				{
		// 					tier: 'A' as BgsHeroTier,
		// 					heroes: [
		// 						...(groupedByTier.find((heroes) => heroes.find((hero) => hero.tier === 'A')) ?? []),
		// 					].sort((a, b) => a.averagePosition - b.averagePosition),
		// 				},
		// 				{
		// 					tier: 'B' as BgsHeroTier,
		// 					heroes: [
		// 						...(groupedByTier.find((heroes) => heroes.find((hero) => hero.tier === 'B')) ?? []),
		// 					].sort((a, b) => a.averagePosition - b.averagePosition),
		// 				},
		// 				{
		// 					tier: 'C' as BgsHeroTier,
		// 					heroes: [
		// 						...(groupedByTier.find((heroes) => heroes.find((hero) => hero.tier === 'C')) ?? []),
		// 					].sort((a, b) => a.averagePosition - b.averagePosition),
		// 				},
		// 				{
		// 					tier: 'D' as BgsHeroTier,
		// 					heroes: [
		// 						...(groupedByTier.find((heroes) => heroes.find((hero) => hero.tier === 'D')) ?? []),
		// 					].sort((a, b) => a.averagePosition - b.averagePosition),
		// 				},
		// 				{
		// 					tier: 'E' as BgsHeroTier,
		// 					heroes: [
		// 						...(groupedByTier.find((heroes) => heroes.find((hero) => hero.tier === 'E')) ?? []),
		// 					].sort((a, b) => a.averagePosition - b.averagePosition),
		// 				},
		// 			].filter((tier) => !!tier.heroes?.length);
		// 			const title = this.i18n.translateString('battlegrounds.hero-selection.tier-list-title-tooltip', {
		// 				totalMatches: totalMatches.toLocaleString('en-US'),
		// 			});
		// 			const lastUpdateText = this.i18n.translateString(
		// 				'battlegrounds.hero-selection.tier-list-title-footer',
		// 				{
		// 					lastUpdateDate: new Date(lastUpdateDate).toLocaleString(this.i18n.formatCurrentLocale()),
		// 				},
		// 			);
		// 			return {
		// 				tiers: tiers,
		// 				totalMatches: totalMatches,
		// 				tooltip: `
		// 						<div class="content">
		// 							<div class="title">${title}</div>
		// 							<ul class="filters">
		// 								<li class="filter time">${getBgsTimeFilterLabelFor(timeFilter, this.i18n)}</li>
		// 								<li class="filter rank">${getBgsRankFilterLabelFor(
		// 									mmrPercentiles?.find((percentile) => percentile.percentile === rankFilter),
		// 									this.i18n,
		// 								)}</li>
		// 							</ul>
		// 							<div class="footer">${lastUpdateText}</div>
		// 						</div>
		// 					`,
		// 			};
		// 		},
		// 	),
		// );
	}

	trackByTierFn(index, item: HeroTier) {
		return item.tier;
	}

	// toggleUseTribeFilter = (newValue: boolean) => {
	// 	this.battlegroundsUpdater?.next(new BgsFilterLiveTribesEvent(newValue));
	// };

	// toggleUseMmrFilter = (newValue: boolean) => {
	// 	this.battlegroundsUpdater?.next(new BgsFilterLiveMmrEvent(newValue, this.percentiles));
	// };

	// private buildTribesFilterText(tribesFilter: readonly Race[], allTribes: readonly Race[]): string {
	// 	if (!tribesFilter?.length || tribesFilter.length === allTribes.length) {
	// 		return this.i18n.translateString('app.battlegrounds.filters.tribe.all-tribes');
	// 	}
	// 	return tribesFilter
	// 		.map((tribe) => getTribeName(tribe, this.i18n))
	// 		.sort()
	// 		.join(', ');
	// }
}

interface HeroTier {
	readonly tier: BgsHeroTier;
	readonly heroes: readonly (BgsMetaHeroStatTierItem | BgsQuestStat)[];
}
