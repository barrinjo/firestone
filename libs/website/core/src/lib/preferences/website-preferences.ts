import { IPreferences } from '@firestone/shared/framework/common';

export class WebsitePreferences implements IPreferences {
	readonly locale: string = 'enUS';
	readonly collectionUseHighResImages: boolean = true;
	readonly overlayShowRarityColors: boolean = true;

	readonly bgsActiveRankFilter: 100 | 50 | 25 | 10 | 1;
}
