import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inflate } from 'pako';
import { ResizedEvent } from 'angular-resize-event';

import { GameState } from '../../../../models/decktracker/game-state';
import { Events } from '../../../../services/events.service';
import { DeckEvents } from '../../../../services/decktracker/event-parser/deck-events';

import fakeState from './gameState.json';

@Component({
	selector: 'decktracker-overlay-standalone',
	styleUrls: [
		'../../../../../css/global/components-global.scss',
		'../../../../../css/component/decktracker/overlay/decktracker-overlay.component.scss',
		'../../../../../css/component/decktracker/overlay/decktracker-overlay-clean.scss',
		'../../../../../css/component/decktracker/overlay/twitch/decktracker-overlay-standalone.component.scss',
	],
	template: `
        <div *ngIf="gameState" class="root clean" 
                [ngClass]="{'dragging': dragging}"
                cdkDrag 
                (cdkDragStarted)="startDragging()"
                (cdkDragReleased)="stopDragging()"
                (resized)="onResized($event)">
            <div class="scalable">
                <div class="decktracker-container">
                    <div class="decktracker" *ngIf="gameState">
                        <decktracker-deck-list 
                                [deckState]="gameState.playerDeck"
                                [displayMode]="displayMode"
                                (onDisplayModeChanged)="onDisplayModeChanged($event)"
                                [activeTooltip]="activeTooltip">
                        </decktracker-deck-list>
                    </div>
                </div>

                <i class="i-54 gold-theme corner top-left">
                    <svg class="svg-icon-fill">
                        <use xlink:href="/Files/assets/svg/sprite.svg#golden_corner"/>
                    </svg>
                </i>
                <i class="i-54 gold-theme corner top-right">
                    <svg class="svg-icon-fill">
                        <use xlink:href="/Files/assets/svg/sprite.svg#golden_corner"/>
                    </svg>
                </i>
                <i class="i-54 gold-theme corner bottom-right">
                    <svg class="svg-icon-fill">
                        <use xlink:href="/Files/assets/svg/sprite.svg#golden_corner"/>
                    </svg>
                </i>
                <i class="i-54 gold-theme corner bottom-left">
                    <svg class="svg-icon-fill">
                        <use xlink:href="/Files/assets/svg/sprite.svg#golden_corner"/>
                    </svg>
                </i>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckTrackerOverlayStandaloneComponent implements AfterViewInit {

    gameState: GameState;
    displayMode: string;
    activeTooltip: string;
    dragging: boolean;

	private showTooltipTimer;
    private hideTooltipTimer;
    
    private twitch;

	constructor(
            private cdr: ChangeDetectorRef, 
            private events: Events, 
            private el: ElementRef, 
            private renderer: Renderer2) {
		this.events.on(Events.DECK_SHOW_TOOLTIP).subscribe((data) => {
			clearTimeout(this.hideTooltipTimer);
			// Already in tooltip mode
			if (this.activeTooltip) {
				this.activeTooltip = data.data[0];
				this.events.broadcast(Events.SHOW_TOOLTIP, ...data.data);
				this.cdr.detectChanges();
			}
			else {
				this.showTooltipTimer = setTimeout(() => {
					this.activeTooltip = data.data[0];
					this.events.broadcast(Events.SHOW_TOOLTIP, ...data.data);
					this.cdr.detectChanges();
				}, 300)
			}
		});
		this.events.on(Events.DECK_HIDE_TOOLTIP).subscribe((data) => {
			clearTimeout(this.showTooltipTimer);
			this.hideTooltipTimer = setTimeout(() => {
				this.activeTooltip = undefined;
				this.events.broadcast(Events.HIDE_TOOLTIP, ...data.data);
				this.cdr.detectChanges();
			}, 200);
        });
	}

	ngAfterViewInit() {
        this.cdr.detach();
        this.twitch = (window as any).Twitch.ext;
        this.twitch.onContext((context, contextfields) => console.log('oncontext', context, contextfields));
        this.twitch.onAuthorized((auth) => console.log('on authorized', auth));
        this.twitch.listen('broadcast', (target, contentType, event) => {
            const deckEvent = JSON.parse(inflate(event, { to: 'string' }));
            console.log('received event', deckEvent);
            this.processEvent(deckEvent);
        });
        this.displayMode = 'DISPLAY_MODE_GROUPED';
        console.log('init done');
        this.addDebugGameState();
		this.cdr.detectChanges();
    }

    onResized(event: ResizedEvent) {
        console.log('resize event', event);
        // Resize the tracker
        // Standard scale when height is 1000 px
        const scale = event.newHeight / 1000;
        // console.log('proposed scale', scale);
        // Now shrink the scale is the tracker is taller than a portion of the container's height
        const containerHeight = this.el.nativeElement.parentNode.parentNode.getBoundingClientRect().height;
        // console.log('container height', containerHeight);
        const maxTrackerHeight = 0.9 * containerHeight;
        // console.log('maxTrackerHeight', maxTrackerHeight);
        const finalScale = Math.min(scale, maxTrackerHeight / event.newHeight);
        // console.log('final scale', finalScale);
        const element = this.el.nativeElement.querySelector('.scalable');
        this.renderer.setStyle(element, 'transform', `scale(${finalScale})`);
        this.cdr.detectChanges();
        this.keepOverlayInBounds();
    }

    private keepOverlayInBounds() {
        setTimeout(() => {
            // Move the tracker so that it doesn't go over the edges
            const rect = this.el.nativeElement.querySelector('.scalable').getBoundingClientRect();
            const parentRect = this.el.nativeElement.parentNode.getBoundingClientRect();
            // Get current transform values
            const transform = window.getComputedStyle(this.el.nativeElement.querySelector('.root')).transform;
            const matrix = new DOMMatrix(transform);
            const matrixCurrentLeftMove = matrix.m41;
            const matrixCurrentTopMove = matrix.m42;
            let newTranslateLeft = matrixCurrentLeftMove;
            let newTranslateTop = matrixCurrentTopMove
            if (rect.left < 0) {
                // We move it so that the left is 0
                const amountToMove = Math.abs(rect.left);
                newTranslateLeft = matrixCurrentLeftMove + amountToMove;
            } else if (rect.right > parentRect.right) {
                const amountToMove = rect.right - parentRect.right;
                newTranslateLeft = matrixCurrentLeftMove - amountToMove;
            }
            if (rect.top < 0) {
                const amountToMove = Math.abs(rect.top);
                newTranslateTop = matrixCurrentTopMove + amountToMove;
            } else if (rect.bottom > parentRect.bottom) {
                const amountToMove = rect.bottom - parentRect.bottom;
                newTranslateTop = matrixCurrentTopMove - amountToMove;
            }
            const newTransform = `translate3d(${newTranslateLeft}px, ${newTranslateTop}px, 0px)`;
            this.renderer.setStyle(this.el.nativeElement.querySelector('.root'), 'transform', newTransform);
            // this.cdr.detectChanges();
            // console.log('resizing done', rect, parentRect, matrix);
            // console.log('updating transform', newTransform, matrixCurrentLeftMove, matrixCurrentTopMove, newTranslateLeft);
        })
    }

    startDragging() {
        this.dragging = true;
        console.log('starting dragging');
        this.cdr.detectChanges();
    }

    stopDragging() {
        this.dragging = false;
        console.log('stopped dragging');
        this.cdr.detectChanges();
        this.keepOverlayInBounds();
    }

    private resizeIfNeeded() {
        setTimeout(() => {

        });
    }
    
    private async processEvent(event) {
		switch(event.event.name) {
			case DeckEvents.GAME_END:
				console.log('received GAME_END event');
                this.gameState = undefined;
                this.cdr.detectChanges();
                break;
            default:
                console.log('received deck event');
                if (event.state.playerDeck.deckList.length > 0) {
                    this.gameState = event.state;
                    this.cdr.detectChanges();
                }
                break;
		}
    }

    private addDebugGameState() {
        this.gameState = (<any>fakeState);
        console.log('loaded fake state', this.gameState);
    }
}