import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
} from '@angular/core';
import { CurrentView } from '../../models/mainwindow/collection/current-view.type';
import { MainWindowStoreEvent } from '../../services/mainwindow/store/events/main-window-store-event';
import { OverwolfService } from '../../services/overwolf.service';

declare let amplitude;

@Component({
	selector: 'collection-menu-selection',
	styleUrls: [
		`../../../css/global/menu.scss`,
		`../../../css/component/collection/collection-menu-selection.component.scss`,
	],
	template: `
		<ul class="menu-selection">
			<li [ngClass]="{ 'selected': selectedTab === 'sets' }" (mousedown)="selectTab('sets')">
				<span>Sets</span>
			</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionMenuSelectionComponent implements AfterViewInit {
	@Input() selectedTab: CurrentView;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(private ow: OverwolfService, private cdr: ChangeDetectorRef) {}

	ngAfterViewInit() {
		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
	}

	selectTab(stage: CurrentView) {
		// this.stateUpdater.next(new CollectionSelectCurrentTabEvent(stage));
	}
}
