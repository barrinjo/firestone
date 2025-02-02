import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AbstractSubscriptionStoreComponent } from '@components/abstract-subscription-store.component';
import { IOption } from 'ng-select';
import { Observable } from 'rxjs';
import { PreferencesService } from '../../services/preferences.service';
import { AppUiStoreFacadeService } from '../../services/ui-store/app-ui-store-facade.service';

@Component({
	selector: 'preferences-dropdown',
	styleUrls: [`../../../css/component/settings/preference-dropdown.component.scss`],
	template: `
		<label class="label">
			{{ label }}
			<div class="info" *ngIf="tooltip" [helpTooltip]="tooltip"></div>
		</label>
		<filter-dropdown
			*ngIf="filter$ | async as value"
			[options]="options"
			[filter]="value.filter"
			[placeholder]="value.placeholder"
			[visible]="value.visible"
			(onOptionSelected)="onSelected($event)"
		></filter-dropdown>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferenceDropdownComponent extends AbstractSubscriptionStoreComponent implements AfterContentInit {
	filter$: Observable<{ filter: string; placeholder: string; visible: boolean }>;

	@Input() options: IOption[];
	@Input() field: string;
	@Input() label: string;
	@Input() tooltip: string;

	constructor(
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly prefs: PreferencesService,
	) {
		super(store, cdr);
	}

	ngAfterContentInit() {
		this.filter$ = this.store
			.listen$(([main, nav, prefs]) => prefs[this.field])
			.pipe(
				this.mapData(([pref]) => ({
					filter: pref,
					placeholder: this.options.find((option) => option.value === pref)?.label,
					visible: true,
				})),
			);
	}

	onSelected(option: IOption) {
		this.prefs.setValue(this.field, option.value);
	}
}
