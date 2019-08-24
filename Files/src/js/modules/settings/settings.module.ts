import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { init } from '@sentry/browser';
import { SettingsAchievementsCaptureComponent } from '../../components/settings/achievements/settings-achievements-capture.component';
import { SettingsAchievementsMenuComponent } from '../../components/settings/achievements/settings-achievements-menu.component';
import { SettingsAchievementsSoundCaptureComponent } from '../../components/settings/achievements/settings-achievements-sound-capture.component';
import { SettingsAchievementsStorageComponent } from '../../components/settings/achievements/settings-achievements-storage.component';
import { SettingsAchievementsVideoCaptureComponent } from '../../components/settings/achievements/settings-achievements-video-capture.component';
import { SettingsAchievementsComponent } from '../../components/settings/achievements/settings-achievements.component';
import { SettingsCollectionMenuComponent } from '../../components/settings/collection/settings-collection-menu.component';
import { SettingsCollectionNotificationComponent } from '../../components/settings/collection/settings-collection-notification';
import { SettingsCollectionComponent } from '../../components/settings/collection/settings-collection.component';
import { SettingsBroadcastComponent } from '../../components/settings/decktracker/settings-broadcast';
import { SettingsDecktrackerAppearanceComponent } from '../../components/settings/decktracker/settings-decktracker-appearance';
import { SettingsDecktrackerFeaturesComponent } from '../../components/settings/decktracker/settings-decktracker-features.component';
import { SettingsDecktrackerLaunchComponent } from '../../components/settings/decktracker/settings-decktracker-launch';
import { SettingsDecktrackerMenuComponent } from '../../components/settings/decktracker/settings-decktracker-menu.component';
import { SettingsDecktrackerComponent } from '../../components/settings/decktracker/settings-decktracker.component';
import { SettingsGeneralBugReportComponent } from '../../components/settings/general/settings-general-bug-report.component';
import { SettingsGeneralLaunchComponent } from '../../components/settings/general/settings-general-launch.component';
import { SettingsGeneralMenuComponent } from '../../components/settings/general/settings-general-menu.component';
import { SettingsGeneralComponent } from '../../components/settings/general/settings-general.component';
import { ModalVideoSettingsChangedComponent } from '../../components/settings/modal/modal-video-settings-changed.component';
import { SettingsModalComponent } from '../../components/settings/modal/settings-modal.component';
import { SettingsAppSelectionComponent } from '../../components/settings/settings-app-selection.component';
import { SettingsComponent } from '../../components/settings/settings.component';
import { DebugService } from '../../services/debug.service';
import { Events } from '../../services/events.service';
import { GenericIndexedDbService } from '../../services/generic-indexed-db.service';
import { LogsUploaderService } from '../../services/logs-uploader.service';
import { TwitchAuthService } from '../../services/mainwindow/twitch-auth.service';
import { OverwolfService } from '../../services/overwolf.service';
import { SimpleIOService } from '../../services/plugins/simple-io.service';
import { PreferencesService } from '../../services/preferences.service';
import { S3FileUploadService } from '../../services/s3-file-upload.service';
import { SharedModule } from '../shared/shared.module';

init({
	dsn: 'https://53b0813bb66246ae90c60442d05efefe@sentry.io/1338840',
	enabled: process.env.NODE_ENV === 'production',
	release: process.env.APP_VERSION,
});

console.log('version is ' + process.env.APP_VERSION);

@NgModule({
	imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule, FormsModule, ReactiveFormsModule, SharedModule],
	declarations: [
		SettingsComponent,
		SettingsAppSelectionComponent,

		SettingsGeneralComponent,
		SettingsGeneralMenuComponent,
		SettingsGeneralLaunchComponent,
		SettingsGeneralBugReportComponent,

		SettingsCollectionComponent,
		SettingsCollectionMenuComponent,
		SettingsCollectionNotificationComponent,

		SettingsAchievementsComponent,
		SettingsAchievementsMenuComponent,
		SettingsAchievementsCaptureComponent,
		SettingsAchievementsVideoCaptureComponent,
		SettingsAchievementsSoundCaptureComponent,
		SettingsAchievementsStorageComponent,
		SettingsModalComponent,
		ModalVideoSettingsChangedComponent,

		SettingsDecktrackerComponent,
		SettingsDecktrackerMenuComponent,
		SettingsDecktrackerLaunchComponent,
		SettingsDecktrackerAppearanceComponent,
		SettingsDecktrackerFeaturesComponent,
		SettingsBroadcastComponent,
	],
	bootstrap: [SettingsComponent],
	providers: [
		DebugService,
		Events,
		GenericIndexedDbService,
		OverwolfService,
		PreferencesService,
		TwitchAuthService,
		LogsUploaderService,
		S3FileUploadService,
		SimpleIOService,
	],
})
export class SettingsModule {}
