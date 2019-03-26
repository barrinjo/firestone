import { Component, HostListener, Input, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewRef, EventEmitter, AfterViewInit } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

import { Set } from '../../models/set';
import { Events } from '../../services/events.service';
import { MainWindowStoreEvent } from '../../services/mainwindow/store/events/main-window-store-event';
import { SelectCollectionSetEvent } from '../../services/mainwindow/store/events/collection/select-collection-set-event';

declare var overwolf: any;

@Component({
	selector: 'set-view',
	styleUrls: [
		`../../../css/component/collection/set.component.scss`,
		`../../../css/global/components-global.scss`,
	],
	template: `
		<div *ngIf="_cardSet" class="set" [ngClass]="{'coming-soon': !released}">
			<div class="wrapper-for-flip" [@flipState]="flip">
				<div class="box-side set-view" (click)="browseSet()">
					<div class="logo-container">
						<img src="{{'/Files/assets/images/sets/' + _cardSet.id + '.png'}}" class="set-logo" />
						<span class="text set-name" *ngIf="_displayName">{{_cardSet.name}}</span>
					</div>
					<span class="cards-collected" *ngIf="released">
						{{_cardSet.ownedLimitCollectibleCards}}/{{_cardSet.numberOfLimitCollectibleCards()}}
					</span>
					<div class="frame complete-simple" *ngIf="isSimpleComplete() && !isPremiumComplete()">
						<i class="i-25 pale-gold-theme corner bottom-left">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#common_set_corner"/>
							</svg>
						</i>
						<i class="i-25 pale-gold-theme corner top-left">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#common_set_corner"/>
							</svg>
						</i>
						<i class="i-25 pale-gold-theme corner top-right">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#common_set_corner"/>
							</svg>
						</i>
						<i class="i-25 pale-gold-theme corner bottom-right">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#common_set_corner"/>
							</svg>
						</i>
					</div>
					<div class="frame complete-premium" *ngIf="isPremiumComplete()">
						<div class="outer-border"></div>

						<i class="i-22X30 gold-theme corner bottom-left">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#two_gold_leaves"/>
							</svg>
						</i>

						<i class="i-22X30 gold-theme corner top-left">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#two_gold_leaves"/>
							</svg>
						</i>

						<i class="i-22X30 gold-theme corner top-right">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#two_gold_leaves"/>
							</svg>
						</i>

						<i class="i-22X30 gold-theme corner bottom-right">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#two_gold_leaves"/>
							</svg>
						</i>

						<div class="crown">
							<i class="i-20X10 gold-theme">
								<svg class="svg-icon-fill">
									<use xlink:href="/Files/assets/svg/sprite.svg#three_gold_leaves"/>
								</svg>
							</i>
						</div>
					</div>
					<div class="coming-soon-info" *ngIf="!released">
						<i>
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#coming_soon"/>
							</svg>
						</i>
						<p>Coming soon!</p>
					</div>
				</div>
				<div class="box-side extra-info" [ngClass]="{'ftue': ftueHighlight}" *ngIf="released" (click)="browseSet()">
					<div class="title">
						<i class="i-15 pale-theme">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#timer"/>
							</svg>
						</i>
						<span>Next guaranteed:</span>
					</div>
					<div class="progression epic">
						<div class="progress-title">
							<img src="/Files/assets/images/rarity/rarity-epic-small.png" />
							<span>In {{epicTimer}} packs</span>
						</div>
						<div class="progress-bar">
							<div class="progress-bar-filled" [style.width.%]="epicFill">
							</div>
						</div>
					</div>
					<div class="progression legendary">
						<div class="progress-title">
							<img src="/Files/assets/images/rarity/rarity-legendary-small.png" />
							<span>In {{legendaryTimer}} packs</span>
						</div>
						<div class="progress-bar">
							<div class="progress-bar-filled" [style.width.%]="legendaryFill">
							</div>	
						</div>
					</div>
					<button class="browse-set-button">Browse Set</button>
				</div>
			</div>
		</div>
	`,
	animations: [
	  	trigger('flipState', [
			state('active', style({
		  		transform: 'rotateY(179deg)'
			})),
			state('inactive', style({
		  		transform: 'rotateY(0)'
			})),
			transition('active => inactive', 
				animate('600ms cubic-bezier(0.65,-0.29,0.40,1.5)', keyframes([
					style({ transform: 'rotateY(179deg)', offset: 0}),
					style({ transform: 'rotateY(0)', offset: 1}),
				])
			)),
			transition('inactive => active', 
				animate('600ms cubic-bezier(0.65,-0.29,0.40,1.5)', keyframes([
					style({ transform: 'rotateY(0)', offset: 0}),
					style({ transform: 'rotateY(179deg)', offset: 1}),
				])
			))
	  ])
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetComponent implements AfterViewInit {

	private readonly MOUSE_OVER_DELAY = 300;

	_cardSet: Set;
	_displayName = false;
	released = true;
	epicTimer: number = 10;
	epicFill: number = 0;
	legendaryTimer: number = 40;
	legendaryFill: number = 0;

	showingPityTimerFtue: boolean = false;
	flip: string = 'inactive';
	ftueHighlight: boolean = false;
	
	private movingToSet: boolean = false;
	private timeoutHandler;
	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(
		private cdr: ChangeDetectorRef, 
		private elRef: ElementRef,
		private events: Events) {
			this.events.on(Events.SHOWING_FTUE).subscribe((event) => {
				// console.log('showing ftue', this._cardSet, event);
				this.showingPityTimerFtue = true;
				if (event.data[0] == this._cardSet.id) {
					console.log('highlighting ftue', this._cardSet.id);
					this.ftueHighlight = true;
					if (!(<ViewRef>this.cdr).destroyed) {
						this.cdr.detectChanges();
					}
				}
			});
			this.events.on(Events.DISMISS_FTUE).subscribe((event) => {
				// console.log('dismissing ftue', this._cardSet);
				this.showingPityTimerFtue = false;
				setTimeout(() => {
					if (!this.movingToSet && this.flip == 'active') {
						console.log('fliplping back from event');
						this.flip = 'inactive';
						this.ftueHighlight = false;
						if (!(<ViewRef>this.cdr).destroyed) {
							this.cdr.detectChanges();
						}
					}
				});
			});
	}
	
	ngAfterViewInit() {
		this.stateUpdater = overwolf.windows.getMainWindow().mainWindowStoreUpdater;
	}

	@Input('cardSet') set cardSet(set: Set) {
		this._cardSet = set;
		// console.log('setting set', set, set.name)
		if (['Basic', 'Classic', 'Hall of Fame'].indexOf(set.name) > -1) {
			this._displayName = true;
		}
		this.epicTimer = set.pityTimer.packsUntilGuaranteedEpic;
		this.epicFill = (10 - this.epicTimer) / 10 * 100;
		this.legendaryTimer = set.pityTimer.packsUntilGuaranteedLegendary;
		this.legendaryFill = (40 - this.legendaryTimer) / 40 * 100;
	}

	isSimpleComplete() {
		if (!this.released) return false;
		return this._cardSet.ownedLimitCollectibleCards == this._cardSet.numberOfLimitCollectibleCards()
	}

	isPremiumComplete() {
		if (!this.released) return false;
		return this._cardSet.ownedLimitCollectiblePremiumCards == this._cardSet.numberOfLimitCollectibleCards()
	}

	browseSet() {
		if (this.showingPityTimerFtue || !this.released) {
			return;
		}
		if (this.timeoutHandler) {
			clearTimeout(this.timeoutHandler);
			this.timeoutHandler = null;
		}
		this.stateUpdater.next(new SelectCollectionSetEvent(this._cardSet.id));
		this.movingToSet = true;
	}

	@HostListener('mouseenter') onMouseEnter() {
		if (!this.released) return;
		this.timeoutHandler = setTimeout(() => {
			if (!this.showingPityTimerFtue) {
				this.flip = 'active';
				let rect = this.elRef.nativeElement.getBoundingClientRect();
				console.log('broadcasting set mouse over', this._cardSet.id, rect);
				this.events.broadcast(Events.SET_MOUSE_OVER, rect, this._cardSet.id);	
				if (!(<ViewRef>this.cdr).destroyed) {
					this.cdr.detectChanges();
				}
			}
		}, this.MOUSE_OVER_DELAY)
	}

	@HostListener('mouseleave')
	onMouseLeave() {
		if (!this.released) return;
		clearTimeout(this.timeoutHandler);
		if (!this.showingPityTimerFtue) {
			// console.log('flipping back');
			this.flip = 'inactive';
			if (!(<ViewRef>this.cdr).destroyed) {
				this.cdr.detectChanges();
			}
		}
	}
}
