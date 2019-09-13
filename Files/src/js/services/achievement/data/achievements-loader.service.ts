import { Injectable } from '@angular/core';
import { Achievement } from '../../../models/achievement';
import { RawAchievement } from '../../../models/achievement/raw-achievement';
import { ReplayInfo } from '../../../models/replay-info';
import { Challenge } from '../achievements/challenges/challenge';
import { ChallengeBuilderService } from '../achievements/challenges/challenge-builder.service';
import amazingPlays from './amazing_plays.json';
import competitiveLadder from './competitive_ladder.json';
import dalaranHeist from './dalaran_heist.json';
import deckbuilding from './deckbuilding.json';
import dungeonRun from './dungeon_run.json';
import monsterHunt from './monster_hunt.json';
import rumbleRun from './rumble_run.json';
import tombsOfTerror from './tombs_of_terror.json';

@Injectable()
export class AchievementsLoaderService {
	public challengeModules: readonly Challenge[];

	private achievements: readonly Achievement[];

	constructor(private challengeBuilder: ChallengeBuilderService) {}

	public async getAchievement(achievementId): Promise<Achievement> {
		await this.waitForInit();
		return this.achievements.find(achievement => achievement.id === achievementId);
	}

	public async getAchievements(): Promise<readonly Achievement[]> {
		await this.waitForInit();
		return this.achievements;
	}

	public async initializeAchievements(
		inputAchievements?: readonly RawAchievement[],
	): Promise<[readonly Achievement[], readonly Challenge[]]> {
		console.log('[achievements-loader] Initializing achievements');
		const rawAchievements: readonly RawAchievement[] = inputAchievements || [
			...(dungeonRun as readonly RawAchievement[]),
			...(monsterHunt as readonly RawAchievement[]),
			...(rumbleRun as readonly RawAchievement[]),
			...(dalaranHeist as readonly RawAchievement[]),
			...(tombsOfTerror as readonly RawAchievement[]),
			...(amazingPlays as readonly RawAchievement[]),
			...(competitiveLadder as readonly RawAchievement[]),
			...(deckbuilding as readonly RawAchievement[]),
		];
		return new Promise<[readonly Achievement[], readonly Challenge[]]>(resolve => {
			this.achievements = rawAchievements.map(rawAchievement => this.wrapRawAchievement(rawAchievement));
			this.challengeModules = rawAchievements.map(rawAchievement => this.challengeBuilder.buildChallenge(rawAchievement));
			resolve([this.achievements, this.challengeModules]);
		});
	}

	private wrapRawAchievement(raw: RawAchievement): Achievement {
		const { requirements, resetEvents, ...achievement } = raw;
		return Object.assign(new Achievement(), achievement, {
			numberOfCompletions: 0,
			replayInfo: [] as readonly ReplayInfo[],
		} as Achievement);
	}

	private waitForInit(): Promise<void> {
		return new Promise<void>(resolve => {
			const dbWait = () => {
				if (this.achievements && this.challengeModules) {
					resolve();
				} else {
					// console.log('[achievements-loader] waiting for init');
					setTimeout(() => dbWait(), 50);
				}
			};
			dbWait();
		});
	}
}
