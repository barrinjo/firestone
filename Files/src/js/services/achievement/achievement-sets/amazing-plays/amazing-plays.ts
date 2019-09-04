import { AchievementConfService } from '../../achievement-conf.service';
import { GenericSetProvider } from '../generic-set-provider';

export class AmazingPlaysSetProvider extends GenericSetProvider {
	constructor(conf: AchievementConfService) {
		super(
			'amazing_plays',
			'Amazing Plays',
			[
				'amazing_plays_win_with_one_hp',
				'amazing_plays_win_with_full_hp',
				'amazing_plays_game_tie',
				'amazing_plays_win_without_taking_damage',
				'amazing_plays_summon_highkeeper_ra',
				'amazing_plays_discard_cards',
			],
			'achievements_amazing_plays',
			conf,
		);
	}
}
