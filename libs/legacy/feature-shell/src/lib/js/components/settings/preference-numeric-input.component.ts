import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { OverwolfService } from '@firestone/shared/framework/core';
import { Observable } from 'rxjs';
import { PreferencesService } from '../../services/preferences.service';
import { AppUiStoreFacadeService } from '../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../abstract-subscription-store.component';

@Component({
	selector: 'preference-numeric-input',
	styleUrls: [
		`../../../css/global/toggle.scss`,
		`../../../css/component/settings/settings-common.component.scss`,
		`../../../css/component/settings/preference-numeric-input.component.scss`,
	],
	template: `
		<numeric-input
			class="numeric-input"
			[label]="label"
			[labelTooltip]="tooltip"
			[value]="value$ | async"
			[minValue]="minValue"
			[incrementStep]="incrementStep"
			[disabled]="disabled"
			(valueChange)="onValueChanged($event)"
		></numeric-input>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferenceNumericInputComponent extends AbstractSubscriptionStoreComponent implements AfterContentInit {
	value$: Observable<number>;

	@Input() field: string;
	@Input() label: string;
	@Input() tooltip: string;
	@Input() minValue = 1;
	@Input() incrementStep = 1;
	@Input() disabled: boolean;

	value: boolean;

	constructor(
		private prefs: PreferencesService,
		private ow: OverwolfService,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
	) {
		super(store, cdr);
	}

	ngAfterContentInit() {
		this.value$ = this.listenForBasicPref$((prefs) => prefs[this.field]);
	}

	async onValueChanged(newValue: number) {
		await this.prefs.setValue(this.field, newValue);
	}
}
