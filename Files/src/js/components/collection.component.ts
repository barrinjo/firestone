import { Component, NgZone, OnInit } from '@angular/core';

import * as Raven from 'raven-js';

import { CollectionManager } from '../services/collection/collection-manager.service';
import { AllCardsService } from '../services/all-cards.service';
import { Events } from '../services/events.service';

import { Card } from '../models/card';
import { Set, SetCard } from '../models/set';

declare var overwolf: any;
declare var ga: any;

@Component({
	selector: 'collection',
	styleUrls: [
		`../../css/component/collection.component.scss`,
	],
	template: `
		<div class="collection">
			<section class="main" [ngClass]="{'divider': _selectedView == 'cards'}">
				<collection-menu
					[displayType]="_menuDisplayType"
					[selectedSet]="_selectedSet"
					[selectedFormat]="_selectedFormat"
					[searchString]="searchString">
				</collection-menu>
				<ng-container [ngSwitch]="_selectedView">
					<sets *ngSwitchCase="'sets'" [selectedFormat]="_selectedFormat"></sets>
					<cards *ngSwitchCase="'cards'" [cardList]="_cardList" [set]="_selectedSet" [searchString]="searchString"></cards>
				</ng-container>
			</section>
			<section class="secondary">
				<card-search>Search card</card-search>
				<card-history></card-history>
				<div class="ads" id="ad-div"></div>
			</section>
		</div>
	`,
})
// 7.1.1.17994
export class CollectionComponent {

	private _menuDisplayType = 'menu';
	private _selectedView = 'sets';
	private _selectedSet: Set;
	private _selectedFormat: string;
	private searchString: string;

	private _cardList: SetCard[];

	constructor(private _events: Events) {
		ga('send', 'event', 'collection', 'show');

		// console.log('constructing');
		this._events.on(Events.SET_SELECTED).subscribe(
			(data) => {
				// console.log(`selecting set, showing cards`, data);
				this._menuDisplayType = 'breadcrumbs';
				this._selectedView = 'cards';
				this._selectedSet = data.data[0];
				this._selectedFormat = this._selectedSet.standard ? 'standard' : 'wild';
				this._cardList = this._selectedSet.allCards;
			}
		)

		this._events.on(Events.FORMAT_SELECTED).subscribe(
			(data) => {
				// console.log(`selecting format in collection`, data);
				this._menuDisplayType = 'breadcrumbs';
				this._selectedView = 'sets';
				this._selectedFormat = data.data[0];
				this._selectedSet = null;
				this._cardList = null;
			}
		)

		this._events.on(Events.MODULE_SELECTED).subscribe(
			(data) => {
				this._menuDisplayType = 'menu';
				this._selectedView = 'sets';
				this._selectedFormat = null;
				this._selectedSet = null;
				this._cardList = null;
			}
		)

		this._events.on(Events.SHOW_CARDS).subscribe(
			(data) => {
				this._menuDisplayType = 'breadcrumbs';
				this._selectedView = 'cards';
				this._selectedFormat = null;
				this._selectedSet = null;
				this._cardList = data.data[0];
				this.searchString = data.data[1];
			}
		)
	}
}
