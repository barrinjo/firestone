import { AfterContentInit, ChangeDetectorRef, Component } from '@angular/core';
import { AbstractSubscriptionComponent } from '@firestone/shared/framework/common';
import { WebsiteBootstrapService } from '@firestone/website/core';
import Plausible from 'plausible-tracker';
import { Observable, from, startWith } from 'rxjs';

@Component({
	selector: 'website-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent extends AbstractSubscriptionComponent implements AfterContentInit {
	initComplete$: Observable<boolean>;

	constructor(
		protected override readonly cdr: ChangeDetectorRef,
		private readonly bootstrap: WebsiteBootstrapService,
	) {
		super(cdr);
	}

	ngAfterContentInit(): void {
		const plausible = Plausible({
			domain: 'firestoneapp.gg',
			trackLocalhost: true,
			apiHost: 'https://apps.zerotoheroes.com',
		});
		plausible.trackPageview();

		this.initComplete$ = from(this.bootstrap.init()).pipe(
			startWith(false),
			this.mapData((initComplete) => initComplete),
		);
	}
}
