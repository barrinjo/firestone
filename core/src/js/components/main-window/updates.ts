export interface Update {
	readonly sections: readonly UpdateSection[];
	readonly version: string;
}

export interface UpdateSection {
	readonly type: 'intro' | 'main' | 'minor' | 'beta' | 'future';
	readonly header?: string;
	readonly updates?: readonly UpdateSectionItem[];
	readonly text?: string;
}

export interface UpdateSectionItem {
	readonly category:
		| 'general'
		| 'replays'
		| 'achievements'
		| 'duels'
		| 'decktracker'
		| 'battlegrounds'
		| 'collection';
	readonly details: UpdateSectionItemDetails[];
}

export interface UpdateSectionItemDetails {
	readonly type: 'feature' | 'bug' | 'ui' | 'content' | 'misc';
	readonly text: string;
}

export const updates: readonly Update[] = [
	{
		version: '7.8.0',
		sections: [
			// {
			// 	type: 'intro',
			// 	header: 'Message from the dev',
			// 	text: `
			// 		I'd like to welcome everyone who got to try Firestone because of the lifetime packs received feature. I'm glad to have you here :)
			// 		<br/>
			// 		<br/>
			// 		This updates mostly brings small-ish Quality of Life improvements. I'll probably have another couples of small update following over the next months to fix / improve existing features, so if you have any feedback or ideas, please don't hesitate to send them to me!
			// 		<br/>
			// 		<br/>
			// 		Take care,
			// 		<br/>
			// 		Seb.
			// 	`,
			// },
			{
				type: 'main',
				header: 'Main updates',
				updates: [
					{
						category: 'collection',
						details: [
							{
								type: 'feature',
								text: `Pity timers are now synchronized across computers (they still need you to open your packs with Firestone running).`,
							},
						],
					},
				],
			},
			{
				type: 'minor',
				header: 'Minor updates',
				updates: [
					{
						category: 'decktracker',
						details: [
							{
								type: 'feature',
								text: `Add support for Whizbang decks.`,
							},
							{
								type: 'bug',
								text: `Fix an issue where global effect cards (like Incanter's Flow) were not applied to the deck when played by Trick Totem.`,
							},
							{
								type: 'content',
								text: `Flag more cards created by the opponent's hand (Knight of Anointment, Warsong Wrangler, Taelan Fordring, Northwatch Commander, Tamsin Roane, Thrive in the Shadows).`,
							},
						],
					},
					{
						category: 'general',
						details: [
							{
								type: 'feature',
								text: `Add social share / screenshot buttons to the menu bar, so they are available on all pages easily.`,
							},
							{
								type: 'ui',
								text: `Add a link to go premium on the left menu.`,
							},
							{
								type: 'misc',
								text: `Fix a perf issue that would sometimes occur when using the mousewheel to scroll through the packs list.`,
							},
						],
					},
					{
						category: 'duels',
						details: [
							{
								type: 'feature',
								text: `The active and passive treasures are now grouped by pool, as it doesn't make a lot of sense to compare treasures between pools. There is also a specific filter to only see the Ultra Rare treasures separately.`,
							},
							{
								type: 'feature',
								text: `Show the number of matches used to compute the stats, and add a toggle to hide the ones with few data points.`,
							},
						],
					},
					{
						category: 'collection',
						details: [
							{
								type: 'feature',
								text: `Add a toggle to show only the main card packs in the Card Packs screen.`,
							},
							{
								type: 'feature',
								text: `Add notification when receiving single cards (like in season rewards), and single card rewards now appear in the card history.`,
							},
						],
					},
					{
						category: 'achievements',
						details: [
							{
								type: 'feature',
								text: `Add a global search.`,
							},
							{
								type: 'feature',
								text: `Show the current progress when browsing the HS native achievements.`,
							},
						],
					},
					{
						category: 'battlegrounds',
						details: [
							{
								type: 'feature',
								text: `Add an "unsupported composition" message when the simulator encounters a board state which it knows it can't simulate properly (for now, it's Scallywag + Khadgar /Baron).`,
							},
						],
					},
					{
						category: 'replays',
						details: [
							{
								type: 'bug',
								text: `Fix an issue where the "decklist" filter was not working.`,
							},
						],
					},
				],
			},
			// {
			// 	type: 'future',
			// 	header: "What's next",
			// 	text: `
			// 		A few features are on alpha / beta testing phase today:
			// 		<br/>
			// 		<ul>
			// 			<li>(Battlegrounds) A way to highlight specific minions or tribes in the tavern.</li>
			// 			<li>(Constructed) A way to guess the opponent's archetype from the card they have played, and the ability to override their decklist with a popular list from that archetype.</li>
			// 			<li>A way to track the current progress you're making towards achievements while in a match.
			// 		</ul>
			// 		<br/>
			// 		If you are interested in helping me test and polish these, feel free to ping me on Discord :)
			// 		<br/>
			// 		<br/>
			// 		Stay safe,
			// 		<br/>
			// 		Seb.
			// 	`,
			// },
		],
	},
];
