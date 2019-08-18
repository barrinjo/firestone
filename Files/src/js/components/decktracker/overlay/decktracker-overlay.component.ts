import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	OnDestroy,
	Renderer2,
	ViewRef,
} from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { GameState } from '../../../models/decktracker/game-state';
import { GameType } from '../../../models/enums/game-type';
import { Preferences } from '../../../models/preferences';
import { ScenarioId } from '../../../models/scenario-id';
import { DebugService } from '../../../services/debug.service';
import { DeckEvents } from '../../../services/decktracker/event-parser/deck-events';
import { Events } from '../../../services/events.service';
import { OverwolfService } from '../../../services/overwolf.service';
import { PreferencesService } from '../../../services/preferences.service';

declare var ga: any;

@Component({
	selector: 'decktracker-overlay',
	styleUrls: [
		'../../../../css/global/components-global.scss',
		'../../../../css/component/decktracker/overlay/decktracker-overlay.component.scss',
		'../../../../css/component/decktracker/overlay/decktracker-overlay-clean.scss',
	],
	template: `
		<div class="root" [ngClass]="{ 'clean': useCleanMode }">
			<div class="scalable">
				<div class="decktracker-container">
					<div class="decktracker" *ngIf="gameState">
						<decktracker-title-bar [windowId]="windowId"></decktracker-title-bar>
						<decktracker-deck-name [hero]="gameState.playerDeck.hero" [deckName]="gameState.playerDeck.name">
						</decktracker-deck-name>
						<decktracker-deck-list
							[deckState]="gameState.playerDeck"
							[displayMode]="displayMode"
							(onDisplayModeChanged)="onDisplayModeChanged($event)"
							[activeTooltip]="activeTooltip"
						>
						</decktracker-deck-list>
					</div>
				</div>

				<i class="i-54 gold-theme corner top-left">
					<svg class="svg-icon-fill">
						<use xlink:href="assets/svg/sprite.svg#golden_corner" />
					</svg>
				</i>
				<i class="i-54 gold-theme corner top-right">
					<svg class="svg-icon-fill">
						<use xlink:href="assets/svg/sprite.svg#golden_corner" />
					</svg>
				</i>
				<i class="i-54 gold-theme corner bottom-right">
					<svg class="svg-icon-fill">
						<use xlink:href="assets/svg/sprite.svg#golden_corner" />
					</svg>
				</i>
				<i class="i-54 gold-theme corner bottom-left">
					<svg class="svg-icon-fill">
						<use xlink:href="assets/svg/sprite.svg#golden_corner" />
					</svg>
				</i>
				<tooltips [module]="'decktracker'"></tooltips>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckTrackerOverlayComponent implements AfterViewInit, OnDestroy {
	// This should not be necessary, but is an additional guard
	private readonly SCENARIO_IDS_WITH_UNAVAILABLE_LISTS: number[] = [
		ScenarioId.DUNGEON_RUN,
		ScenarioId.MONSTER_HUNT,
		ScenarioId.RUMBLE_RUN,
	];

	gameState: GameState;
	windowId: string;
	activeTooltip: string;
	overlayDisplayed: boolean;
	displayMode: string;
	useCleanMode: boolean;

	private scale;
	private showTooltipTimer;
	private hideTooltipTimer;
	private gameInfoUpdatedListener: (message: any) => void;
	private showTooltipSubscription: Subscription;
	private hideTooltipSubscription: Subscription;
	private deckSubscription: Subscription;
	private preferencesSubscription: Subscription;

	constructor(
		private logger: NGXLogger,
		private prefs: PreferencesService,
		private cdr: ChangeDetectorRef,
		private events: Events,
		private ow: OverwolfService,
		private el: ElementRef,
		private renderer: Renderer2,
		private debugService: DebugService,
	) {}

	async ngAfterViewInit() {
		// We get the changes via event updates, so automated changed detection isn't useful in PUSH mode
		this.cdr.detach();

		this.windowId = (await this.ow.getCurrentWindow()).id;
		this.showTooltipSubscription = this.events.on(Events.DECK_SHOW_TOOLTIP).subscribe(data => {
			clearTimeout(this.hideTooltipTimer);
			// Already in tooltip mode
			if (this.activeTooltip) {
				this.activeTooltip = data.data[0];
				this.events.broadcast(Events.SHOW_TOOLTIP, ...data.data);
				if (!(this.cdr as ViewRef).destroyed) {
					this.cdr.detectChanges();
				}
			} else {
				this.showTooltipTimer = setTimeout(() => {
					this.activeTooltip = data.data[0];
					this.events.broadcast(Events.SHOW_TOOLTIP, ...data.data);
					if (!(this.cdr as ViewRef).destroyed) {
						this.cdr.detectChanges();
					}
				}, 500);
			}
		});
		this.hideTooltipSubscription = this.events.on(Events.DECK_HIDE_TOOLTIP).subscribe(data => {
			clearTimeout(this.showTooltipTimer);
			this.hideTooltipTimer = setTimeout(
				() => {
					// console.log('hidigin tooltip');
					this.activeTooltip = undefined;
					this.events.broadcast(Events.HIDE_TOOLTIP);
					if (!(this.cdr as ViewRef).destroyed) {
						this.cdr.detectChanges();
					}
				},
				data.data[0] ? data.data[0] : 200,
			);
		});
		const deckEventBus: EventEmitter<any> = this.ow.getMainWindow().deckEventBus;
		this.deckSubscription = deckEventBus.subscribe(async event => {
			console.log('received deck event', event.event);
			this.gameState = event.state;
			await this.processEvent(event.event);
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		});
		const preferencesEventBus: EventEmitter<any> = this.ow.getMainWindow().preferencesEventBus;
		this.preferencesSubscription = preferencesEventBus.subscribe(event => {
			console.log('received pref event', event);
			if (event.name === PreferencesService.DECKTRACKER_OVERLAY_DISPLAY) {
				this.handleDisplayPreferences(event.preferences);
			} else if (event.name === PreferencesService.DECKTRACKER_OVERLAY_SIZE) {
				this.handleDisplaySize(event.preferences);
			}
		});

		this.handleDisplayPreferences();
		this.handleDisplaySize();
		if (process.env.NODE_ENV !== 'production') {
			console.error('Should not allow debug game state from production');
			this.gameState = this.ow.getMainWindow().deckDebug.state;
			console.log('game state', this.gameState, JSON.stringify(this.gameState));
		}

		this.gameInfoUpdatedListener = this.ow.addGameInfoUpdatedListener(async (res: any) => {
			if (res && res.resolutionChanged) {
				this.logger.debug('[decktracker-overlay] received new game info', res);
				await this.changeWindowSize();
				await this.changeWindowPosition();
			}
		});

		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
		console.log('handled after view init');
	}

	ngOnDestroy(): void {
		this.ow.removeGameInfoUpdatedListener(this.gameInfoUpdatedListener);
		this.showTooltipSubscription.unsubscribe();
		this.hideTooltipSubscription.unsubscribe();
		this.deckSubscription.unsubscribe();
		this.preferencesSubscription.unsubscribe();
	}

	@HostListener('mousedown')
	dragMove() {
		this.ow.dragMove(this.windowId);
	}

	onDisplayModeChanged(pref: string) {
		this.prefs.setOverlayDisplayMode(pref);
	}

	private async processEvent(event) {
		switch (event.name) {
			case DeckEvents.MATCH_METADATA:
				console.log('received MATCH_METADATA event');
				this.handleDisplayPreferences();
				break;
			case DeckEvents.GAME_END:
				console.log('received GAME_END event');
				this.hideWindow();
				break;
		}
	}

	private async handleDisplayPreferences(preferences: Preferences = null) {
		console.log('retrieving preferences');
		preferences = preferences || (await this.prefs.getPreferences());
		this.useCleanMode = preferences.decktrackerSkin === 'clean';
		this.displayMode = this.useCleanMode ? 'DISPLAY_MODE_GROUPED' : preferences.overlayDisplayMode || 'DISPLAY_MODE_ZONE';
		console.log('switching views?', this.useCleanMode, this.displayMode);

		const shouldDisplay = await this.shouldDisplayOverlay(preferences);
		console.log('should display overlay?', shouldDisplay, preferences);
		if (!this.overlayDisplayed && shouldDisplay) {
			ga('send', 'event', 'decktracker', 'show');
			this.restoreWindow();
		} else if (this.overlayDisplayed && !shouldDisplay) {
			this.hideWindow();
		}
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private async handleDisplaySize(preferences: Preferences = null) {
		console.log('retrieving preferences');
		preferences = preferences || (await this.prefs.getPreferences());
		this.scale = preferences.decktrackerScale;
		this.onResized();
	}

	private async shouldDisplayOverlay(preferences: Preferences = null): Promise<boolean> {
		const prefs = preferences || (await this.prefs.getPreferences());
		console.log('merged prefs', prefs, this.gameState);
		if (
			!this.gameState ||
			!this.gameState.metadata ||
			!this.gameState.metadata.gameType ||
			!this.gameState.playerDeck ||
			!this.gameState.playerDeck.deckList
		) {
			return false;
		}
		switch (this.gameState.metadata.gameType as GameType) {
			case GameType.ARENA:
				return this.gameState.playerDeck.deckList.length > 0 && prefs.decktrackerShowArena;
			case GameType.CASUAL:
				return this.gameState.playerDeck.deckList.length > 0 && prefs.decktrackerShowCasual;
			case GameType.RANKED:
				return this.gameState.playerDeck.deckList.length > 0 && prefs.decktrackerShowRanked;
			case GameType.VS_AI:
				return (
					this.gameState.playerDeck.deckList.length > 0 &&
					prefs.decktrackerShowPractice &&
					this.SCENARIO_IDS_WITH_UNAVAILABLE_LISTS.indexOf(this.gameState.metadata.scenarioId) === -1
				);
			case GameType.VS_FRIEND:
				return this.gameState.playerDeck.deckList.length > 0 && prefs.decktrackerShowFriendly;
			case GameType.FSG_BRAWL:
			case GameType.FSG_BRAWL_1P_VS_AI:
			case GameType.FSG_BRAWL_2P_COOP:
			case GameType.FSG_BRAWL_VS_FRIEND:
			case GameType.TB_1P_VS_AI:
			case GameType.TB_2P_COOP:
			case GameType.TAVERNBRAWL:
				return this.gameState.playerDeck.deckList.length > 0 && prefs.decktrackerShowTavernBrawl;
		}
		return this.gameState.playerDeck.deckList.length > 0;
	}

	private async onResized() {
		const newScale = this.scale / 100;
		const element = this.el.nativeElement.querySelector('.scalable');
		this.renderer.setStyle(element, 'transform', `scale(${newScale})`);
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private async restoreWindow() {
		await this.ow.restoreWindow(this.windowId);
		await this.onResized();
	}

	private async changeWindowPosition(): Promise<void> {
		const width = Math.max(252, 252 * 2);
		const gameInfo = await this.ow.getRunningGameInfo();
		if (!gameInfo) {
			return;
		}
		const gameWidth = gameInfo.logicalWidth;
		const dpi = gameWidth / gameInfo.width;
		// https://stackoverflow.com/questions/8388440/converting-a-double-to-an-int-in-javascript-without-rounding
		const newLeft = ~~(gameWidth - width * dpi - 20); // Leave a bit of room to the right
		const newTop = 0;
		await this.ow.changeWindowPosition(this.windowId, newLeft, newTop);
	}

	private async changeWindowSize(): Promise<void> {
		const width = Math.max(252, 252 * 2); // Max scale
		const gameInfo = await this.ow.getRunningGameInfo();
		if (!gameInfo) {
			return;
		}
		const gameHeight = gameInfo.logicalHeight;
		await this.ow.changeWindowSize(this.windowId, width, gameHeight);
	}

	private hideWindow() {
		this.ow.hideWindow(this.windowId);
	}
}
