import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { BgsHeroStat } from '../../../../models/battlegrounds/stats/bgs-hero-stat';
import { BattlegroundsAppState } from '../../../../models/mainwindow/battlegrounds/battlegrounds-app-state';
import { BattlegroundsCategory } from '../../../../models/mainwindow/battlegrounds/battlegrounds-category';
import { BattlegroundsPersonalHeroesCategory } from '../../../../models/mainwindow/battlegrounds/categories/battlegrounds-personal-heroes-category';
import { MainWindowStoreEvent } from '../../../../services/mainwindow/store/events/main-window-store-event';
import { OverwolfService } from '../../../../services/overwolf.service';

@Component({
	selector: 'battlegrounds-personal-stats-heroes',
	styleUrls: [
		`../../../../../css/component/battlegrounds/desktop/categories/battlegrounds-personal-stats-heroes.component.scss`,
		`../../../../../css/global/components-global.scss`,
	],
	template: `
		<div class="battlegrounds-personal-stats-heroes">
			<battlegrounds-stats-hero-vignette
				*ngFor="let stat of stats"
				[stat]="stat"
			></battlegrounds-stats-hero-vignette>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsPersonalStatsHeroesComponent implements AfterViewInit {
	_category: BattlegroundsCategory;
	_state: BattlegroundsAppState;

	stats: readonly BgsHeroStat[];

	@Input() set category(value: BattlegroundsPersonalHeroesCategory) {
		if (value === this._category) {
			return;
		}
		this._category = value;
		this.updateValues();
	}

	@Input() set state(value: BattlegroundsAppState) {
		if (value === this._state) {
			return;
		}
		this._state = value;
		this.updateValues();
	}

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(private ow: OverwolfService) {}

	ngAfterViewInit() {
		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
	}

	private updateValues() {
		if (!this._state || !this._category) {
			return;
		}
		this.stats = this._state.stats.heroStats.filter(stat => stat.id !== 'average');
		// console.log('stats', this.stats);
	}
}
