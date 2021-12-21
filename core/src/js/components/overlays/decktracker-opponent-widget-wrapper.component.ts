import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Renderer2,
} from '@angular/core';
import { SceneMode } from '@firestone-hs/reference-data';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Preferences } from '../../models/preferences';
import { OverwolfService } from '../../services/overwolf.service';
import { PreferencesService } from '../../services/preferences.service';
import { AppUiStoreFacadeService } from '../../services/ui-store/app-ui-store-facade.service';
import { AbstractWidgetWrapperComponent } from './_widget-wrapper.component';

@Component({
	selector: 'decktracker-opponent-widget-wrapper',
	styleUrls: ['../../../css/component/overlays/decktracker-player-widget-wrapper.component.scss'],
	template: `
		<decktracker-overlay-opponent
			class="widget"
			*ngIf="showOpponentDecktracker$ | async"
			cdkDrag
			(cdkDragStarted)="startDragging()"
			(cdkDragReleased)="stopDragging()"
			(cdkDragEnded)="dragEnded($event)"
		></decktracker-overlay-opponent>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecktrackerOpponentWidgetWrapperComponent
	extends AbstractWidgetWrapperComponent
	implements AfterContentInit {
	protected defaultPositionLeftProvider = (gameWidth: number, gameHeight: number) => 0;
	protected defaultPositionTopProvider = (gameWidth: number, gameHeight: number) => 50;
	protected positionUpdater = (left: number, top: number) => this.prefs.updateOpponentTrackerPosition(left, top);
	protected positionExtractor = async (prefs: Preferences) => prefs.opponentOverlayPosition;
	protected getRect = () => this.el.nativeElement.querySelector('.widget')?.getBoundingClientRect();

	showOpponentDecktracker$: Observable<boolean>;

	constructor(
		protected readonly ow: OverwolfService,
		protected readonly el: ElementRef,
		protected readonly prefs: PreferencesService,
		protected readonly renderer: Renderer2,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
	) {
		super(ow, el, prefs, renderer, store, cdr);
	}

	ngAfterContentInit(): void {
		// console.debug('store', this.store);
		const displayFromGameModeSubject: BehaviorSubject<boolean> = this.ow.getMainWindow().decktrackerDisplayEventBus;
		const displayFromGameMode$ = displayFromGameModeSubject.asObservable();
		this.showOpponentDecktracker$ = combineLatest(
			this.store.listen$(
				([main, nav, pref]) => main.currentScene,
				// Show from prefs
				([main, nav, pref]) => pref.opponentTracker,
				([main, nav, pref]) => pref.decktrackerCloseOnGameEnd,
			),
			this.store.listenDeckState$(
				(deckState) => deckState?.opponentTrackerClosedByUser,
				(deckState) => deckState?.gameStarted,
				(deckState) => deckState?.gameEnded,
				(deckState) => deckState?.isBattlegrounds(),
				(deckState) => deckState?.isMercenaries(),
				(deckState) => deckState?.opponentDeck?.totalCardsInZones(),
			),
			displayFromGameMode$,
		).pipe(
			// tap((info) => console.debug('info', info)),
			this.mapData(
				([
					[currentScene, displayFromPrefs, decktrackerCloseOnGameEnd],
					[closedByUser, gameStarted, gameEnded, isBgs, isMercs, totalCardsInZones],
					displayFromGameMode,
				]) => {
					if (closedByUser || !gameStarted || isBgs || isMercs || !displayFromGameMode || !displayFromPrefs) {
						console.debug(closedByUser, gameStarted, isBgs, isMercs, displayFromGameMode, displayFromPrefs);
						return false;
					}

					if (!decktrackerCloseOnGameEnd) {
						console.debug(decktrackerCloseOnGameEnd, displayFromGameMode);
						return displayFromGameMode;
					}

					// We explicitely don't check for null, so that if the memory updates are broken
					// we still somehow show the info
					if (currentScene !== SceneMode.GAMEPLAY) {
						console.debug(currentScene);
						return false;
					}

					console.debug(gameEnded, totalCardsInZones);
					return !gameEnded && totalCardsInZones > 0;
				},
			),
		);
	}
}
