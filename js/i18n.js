// Interface text in English and Kannada. Each phone picks its own language (saved on that phone only),
// so one room can mix both: the host decides *which* verse or question comes up, and every phone
// shows it in its own language.

export const STR = {
  en: {
    settings: 'Settings', back: 'Back', close: 'Close', language: 'Language', langNote: 'Each phone picks its own language.',
    heroTitle: 'Gather<br>the room.', heroSub: 'Everyone plays on their own phone. This one becomes the table.',
    hostRoom: 'Host a room', connecting: 'Connecting…', joinCode: 'Join with a code', aboutLink: '© 2026 Anderson Jones · About',
    gamesReady: '{n} games ready', moreSoon: '{n} more on the way',
    joinTitle: 'Join a room', joinHint: "Type the code on the host's screen.", roomCode: 'Room code', yourName: 'Your name', yourColour: 'Your colour',
    join: 'Join', joining: 'Joining…', noAccount: 'No account needed. iPhone and Android, right in the browser.',
    codeFour: 'Room codes have four letters.', needName: 'Type your name so others know who you are.',
    noRoom: "No room with code {c}. Check the host's screen.", joinFail: "Couldn't join. Check your internet and try again.",
    offlineErr: "You're offline. Hosting and joining need the internet.", serverErr: "Can't reach the game server. Check your internet and try again.",
    createErr: "Couldn't create a room. Check the database rules are published.", noFreeCode: "Couldn't find a free room code. Try again.",
    writeErr: "Couldn't reach the game server. Trying again may help.", hostErr: "Couldn't reach the game server.",
    reconnecting: 'Reconnecting to the game server…', roomN: 'Room {c}', closedT: 'This room has closed', closedB: 'The host ended room {c}.',
    backStart: 'Back to start', hostPlayingPill: "You're hosting and playing", revealNow: 'Reveal now', notInRoom: "You're not in this room",
    hostOff: "The host's phone is offline. Waiting for it to come back…",
    bot: 'Bot', away: 'Away', ready: 'Ready', waitingPlayersHint: 'Waiting for players. Share the code or let them scan the QR.',
    addBot: 'Add practice bot', removeBot: 'Remove bot', removeBots: 'Remove bots', soon: 'Soon', comingSoon: '{g}, coming soon',
    shareInvite: 'Share invite', showQr: 'Show QR code', pickGame: 'Pick a game', onePlayer: '1 player', nPlayers: '{n} players',
    questions: 'Questions', rounds: 'Rounds', secsEach: 'Seconds each', teams: 'Teams', shuffleTeams: 'Shuffle teams', noOneYet: 'No one yet',
    switchOwn: 'Players can also switch team on their own phone.', playAsWell: 'Play as well as host',
    hpOn: 'Your phone shows your own answers during each round, and the table between rounds.', hpOff: 'Just host: this phone stays the table.',
    tapClose: 'Tap again to close the room', closeRoom: 'Close room', startG: 'Start {g}', waitingPlayers: 'Waiting for players',
    youreOn: "You're on", getReady: 'Get ready', nQs: '{n} questions · {s}s each', nRounds: '{n} rounds · {s}s each', startingIn: 'Starting in',
    endGame: 'End game', nextIn: 'Next round in', resultsIn: 'Results in', nextNow: 'Next now', seeResults: 'See results',
    qOf: 'Question {i} of {n}', rOf: 'Round {i} of {n}', answersIn: 'Answers in', votesIn: 'Votes in', xOfY: '{a} of {b}', timeLeft: 'Time left',
    hiddenWord: 'Hidden word', livesLeft: '{a} of {b} lives left', setting: 'Setting up…', gettingReady: 'Getting ready…',
    rebuild: 'Rebuild this verse', piecesFast: '{n} pieces · fastest correct order wins', doneT: 'Done · {t}', placing: 'Placing…', thinking: 'Thinking…',
    noOne: 'No one got it', wasFirst: '{n} was first', claims: '{team} claims {won}. {ref}.', and: ' and ', answerWas: 'The answer was {a}. {ref}.',
    landNS: 'The land · north to south', open: 'Open',
    finishVerse: 'Finish the verse · {ref}', bonusTo: 'Bonus to {team}. The answer was {l}.', answerWasL: 'The answer was {l}.',
    aboutWho: 'Two truths and a lie about', isTrue: '{l} is true · {ref}', wasLie: '{l} was the lie', spotted: 'Spotted it', first: 'First',
    whereGo: 'Where does it go?', pickGap: 'Pick the gap on your phone', placedRight: '{n} placed it right, in gap {g}.', goesGap: 'It goes in gap {g}.',
    nLetters: '{n} letters', nWords: ' · {n} words', solvedT: 'Solved · {t}', outT: 'Out', livesN: '{n} lives',
    putOrder: 'Put these in Bible order', checkedN: 'Checked {n}×', sorting: 'Sorting…', bibleOrder: 'Bible order',
    whichStory: 'Which Bible story?', emojiClue: 'Emoji clue', solvedL: 'Solved', noOneYetAns: 'No one yet. Answers appear here as they come in.',
    noOneThis: 'No one got this one.', level: 'The teams are level, {a}–{b}{w}.', wins: '{team} wins, {a}–{b}{w}.', inTribes: ' in tribes', inPoints: ' in points',
    tonight: "Tonight's table", takesIt: '{n} takes it.', gameOver: 'Game over.', anotherGame: 'Another game', playAgain: 'Play again',
    room: 'Room', menuLeave: 'Settings and leave room', youreIn: "You're in.", choosing: 'The host is choosing a game', upNext: 'Up next',
    switchTeam: 'Switch team', readyWaiting: 'Ready · waiting for the host', imReady: "I'm ready",
    firstRight: 'First right answer · +{p}', rightP: 'Right · +{p}', outOfTime: 'Out of time', notThisTime: 'Not this time',
    quizBook: 'Quiz book', allBooks: 'All books', difficulty: 'Difficulty', lv_e: 'Easy', lv_m: 'Medium', lv_h: 'Hard',
    lvHint_e: 'Easy: the best-known stories, verses and people.', lvHint_m: 'Medium: easy and medium questions.',
    lvHint_h: 'Hard: everything, with shorter timers, 4 Hangman lives and 2 stray pieces in Verse Scramble.',
    onlyBook: 'Every game uses only {b}.', bkAllBooks: 'Books Sort always uses all 66 books.',
    tapInOrderDecoy: 'Tap the pieces in order. Two of them don’t belong.',
    wdEnter: 'Enter', wdDelete: 'Delete', wdShort: 'Not enough letters', wdNotWord: 'Not a word in the list', wdRight: 'right place', wdIn: 'in the word, wrong place', wdNot: 'not in the word',
    wdGuessN: 'Guess {n} of {m}', wdSolvedN: 'Solved in {n} · {t}', wdOut: 'Out of guesses', wdGuessing: 'Everyone is guessing the same word', wdTries: '{n} tries each. Fewest guesses wins.', theWord: 'The word',
    lockedIn: 'Locked in', tapInOrder: 'Tap the pieces in order', buildsHere: 'Your verse builds here. Tap a placed piece to take it back.',
    yourVerse: 'Your verse', lockedInT: 'Locked in · {t}', watchTable: 'Watch the table.', notQuite: 'Not quite',
    plus3: 'Plus 3 seconds. Tap a piece to take it back and try again.', clearAns: 'Clear my answer', roundOver: 'Round over',
    finishedIn: 'You finished in {t}.', noPoints: 'No points this round', beQuicker: 'Be quicker next time.',
    claimedLand: 'You claimed land for {team}. {ref}.', itWas: 'It was {a}. {ref}.', answerInWait: 'Answer in · waiting for the others',
    pointsFor: 'Points for {team}.', itEnds: 'It ends: {a}', spotLie: 'Spot the lie · {d}', yourTime: 'Your time {t}. ', lieWas: '{l} was the lie. {x}',
    voteIn: 'Vote in · you can change it until the reveal', tapLie: 'Tap the lie · your vote is secret',
    yourCard: 'Your card', gapN: 'Gap {g}.', yourAnswer: 'Your answer', placeHere: 'Place here',
    solvedIn: 'Solved in {t}.', answerWasW: 'The answer was {w}.', outOfLives: 'Out of lives', itWasW: 'It was {w}.', inWord: ', in the word', notInWord: ', not in the word',
    dragOrTap: 'Drag a book, or tap two to swap', position: '{b}, position {i}', allSix: 'All six in order · {t}', nInPlace: '{n} of 6 in place',
    plus3b: 'Plus 3 seconds. Keep going and check again.', checkOrder: 'Check my order', wereInPlace: '{n} of 6 were in place.',
    gotIt: 'You got it · {o}', waitOthers: 'Wait for the others or the timer.', guessB: 'Guess', notIt: 'Not it',
    tryAgainSpell: 'Try again. Spelling close enough counts if the key name is right.',
    youFinished: 'You finished', nPoints: '{n} points', points: 'Points', roundsScored: 'Rounds scored', playersL: 'Players',
    hostCanStart: 'The host can start another game. Stay here to play again.', leaveRoom: 'Leave room',
    themeNoteHost: 'Your theme shows on every phone in this room.', themeNotePlayer: "While you're in a room, the host's theme is shown. Your choice applies outside rooms.",
    theme: 'Theme', cyber: 'Cyberpunk', glass: 'Stained Glass', lightDark: 'Light or dark', auto: 'Auto', light: 'Light', dark: 'Dark',
    version: 'Version {v}', scriptureNote: 'English scripture is from the King James Version (public domain). Kannada scripture is from the Kannada Bible (ಸತ್ಯವೇದವು).',
    sendFeedback: 'Send feedback: andy.andersonjones@gmail.com', scanToJoin: 'Scan to join', qrLabel: 'QR code to join room {c}',
    shareText: 'Join my Upper Room game. Code: {c}', newVersion: 'A new version is ready', update: 'Update', updating: 'Updating…', someone: 'Someone',
    byRound: 'Points by round', nFirsts: '{n} × first', roundsOf: 'scored in {a} of {b}', firsts: 'Firsts',
    ruleRank: 'Each round: 1st 300 · 2nd 200 · other finishers 100 · not finished 0. Tall bars are first places.',
    ruleTrivia: 'Each round: first right answer 200 · other right answers 100 · wrong or no answer 0. Tall bars are first places.',
    bibleVerses: 'Bible verses', sameAsApp: 'Same as app', verseNote: 'Verse Scramble and Finish the Verse show verses in this language.',
    secs: '{n}s', ordinal: '{n}'
  },
  kn: {
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', back: 'ಹಿಂದೆ', close: 'ಮುಚ್ಚಿ', language: 'ಭಾಷೆ', langNote: 'ಪ್ರತಿ ಫೋನ್ ತನ್ನದೇ ಭಾಷೆಯನ್ನು ಆರಿಸಿಕೊಳ್ಳುತ್ತದೆ.',
    heroTitle: 'ಎಲ್ಲರನ್ನೂ<br>ಒಟ್ಟುಗೂಡಿಸಿ.', heroSub: 'ಪ್ರತಿಯೊಬ್ಬರೂ ತಮ್ಮ ಫೋನ್‌ನಲ್ಲೇ ಆಡುತ್ತಾರೆ. ಈ ಫೋನ್ ಆಟದ ಮೇಜು ಆಗುತ್ತದೆ.',
    hostRoom: 'ರೂಮ್ ಆಯೋಜಿಸಿ', connecting: 'ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ…', joinCode: 'ಕೋಡ್ ಬಳಸಿ ಸೇರಿ', aboutLink: '© 2026 Anderson Jones · ಮಾಹಿತಿ',
    gamesReady: '{n} ಆಟಗಳು ಸಿದ್ಧ', moreSoon: 'ಇನ್ನೂ {n} ಬರಲಿವೆ',
    joinTitle: 'ರೂಮ್‌ಗೆ ಸೇರಿ', joinHint: 'ಆಯೋಜಕರ ಪರದೆಯ ಮೇಲಿರುವ ಕೋಡ್ ನಮೂದಿಸಿ.', roomCode: 'ರೂಮ್ ಕೋಡ್', yourName: 'ನಿಮ್ಮ ಹೆಸರು', yourColour: 'ನಿಮ್ಮ ಬಣ್ಣ',
    join: 'ಸೇರಿ', joining: 'ಸೇರಲಾಗುತ್ತಿದೆ…', noAccount: 'ಖಾತೆ ಬೇಕಿಲ್ಲ. iPhone ಮತ್ತು Android, ಬ್ರೌಸರ್‌ನಲ್ಲೇ.',
    codeFour: 'ರೂಮ್ ಕೋಡ್‌ನಲ್ಲಿ ನಾಲ್ಕು ಅಕ್ಷರಗಳಿರುತ್ತವೆ.', needName: 'ನೀವು ಯಾರೆಂದು ಇತರರಿಗೆ ತಿಳಿಯಲು ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ.',
    noRoom: '{c} ಕೋಡ್‌ನ ರೂಮ್ ಇಲ್ಲ. ಆಯೋಜಕರ ಪರದೆಯನ್ನು ನೋಡಿ.', joinFail: 'ಸೇರಲಾಗಲಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    offlineErr: 'ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಆಯೋಜಿಸಲು ಮತ್ತು ಸೇರಲು ಇಂಟರ್ನೆಟ್ ಬೇಕು.', serverErr: 'ಆಟದ ಸರ್ವರ್ ತಲುಪಲಾಗುತ್ತಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    createErr: 'ರೂಮ್ ರಚಿಸಲಾಗಲಿಲ್ಲ. ಡೇಟಾಬೇಸ್ ನಿಯಮಗಳು ಪ್ರಕಟವಾಗಿವೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.', noFreeCode: 'ಖಾಲಿ ರೂಮ್ ಕೋಡ್ ಸಿಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    writeErr: 'ಆಟದ ಸರ್ವರ್ ತಲುಪಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ನೋಡಿ.', hostErr: 'ಆಟದ ಸರ್ವರ್ ತಲುಪಲಾಗಲಿಲ್ಲ.',
    reconnecting: 'ಆಟದ ಸರ್ವರ್‌ಗೆ ಮರುಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ…', roomN: 'ರೂಮ್ {c}', closedT: 'ಈ ರೂಮ್ ಮುಚ್ಚಲಾಗಿದೆ', closedB: 'ಆಯೋಜಕರು ರೂಮ್ {c} ಅನ್ನು ಮುಚ್ಚಿದರು.',
    backStart: 'ಆರಂಭಕ್ಕೆ ಹಿಂತಿರುಗಿ', hostPlayingPill: 'ನೀವು ಆಯೋಜಿಸುತ್ತಾ ಆಡುತ್ತಿದ್ದೀರಿ', revealNow: 'ಈಗಲೇ ಉತ್ತರ ತೋರಿಸಿ', notInRoom: 'ನೀವು ಈ ರೂಮ್‌ನಲ್ಲಿ ಇಲ್ಲ',
    hostOff: 'ಆಯೋಜಕರ ಫೋನ್ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ಅದು ಮರಳಿ ಬರುವವರೆಗೆ ಕಾಯಲಾಗುತ್ತಿದೆ…',
    bot: 'ಬಾಟ್', away: 'ದೂರ', ready: 'ಸಿದ್ಧ', waitingPlayersHint: 'ಆಟಗಾರರಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ. ಕೋಡ್ ಹಂಚಿಕೊಳ್ಳಿ ಅಥವಾ QR ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಹೇಳಿ.',
    addBot: 'ಅಭ್ಯಾಸ ಬಾಟ್ ಸೇರಿಸಿ', removeBot: 'ಬಾಟ್ ತೆಗೆಯಿರಿ', removeBots: 'ಬಾಟ್‌ಗಳನ್ನು ತೆಗೆಯಿರಿ', soon: 'ಶೀಘ್ರ', comingSoon: '{g}, ಶೀಘ್ರದಲ್ಲಿ ಬರಲಿದೆ',
    shareInvite: 'ಆಹ್ವಾನ ಹಂಚಿಕೊಳ್ಳಿ', showQr: 'QR ಕೋಡ್ ತೋರಿಸಿ', pickGame: 'ಆಟ ಆರಿಸಿ', onePlayer: '1 ಆಟಗಾರ', nPlayers: '{n} ಆಟಗಾರರು',
    questions: 'ಪ್ರಶ್ನೆಗಳು', rounds: 'ಸುತ್ತುಗಳು', secsEach: 'ಪ್ರತಿಯೊಂದಕ್ಕೆ ಸೆಕೆಂಡುಗಳು', teams: 'ತಂಡಗಳು', shuffleTeams: 'ತಂಡಗಳನ್ನು ಮರುಹಂಚಿ', noOneYet: 'ಇನ್ನೂ ಯಾರೂ ಇಲ್ಲ',
    switchOwn: 'ಆಟಗಾರರು ತಮ್ಮ ಫೋನ್‌ನಲ್ಲೇ ತಂಡ ಬದಲಿಸಬಹುದು.', playAsWell: 'ಆಯೋಜಿಸುತ್ತಾ ಆಡಿ',
    hpOn: 'ಪ್ರತಿ ಸುತ್ತಿನಲ್ಲಿ ನಿಮ್ಮ ಫೋನ್ ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ತೋರಿಸುತ್ತದೆ; ಸುತ್ತುಗಳ ನಡುವೆ ಆಟದ ಮೇಜನ್ನು ತೋರಿಸುತ್ತದೆ.', hpOff: 'ಆಯೋಜನೆ ಮಾತ್ರ: ಈ ಫೋನ್ ಆಟದ ಮೇಜಾಗಿಯೇ ಇರುತ್ತದೆ.',
    tapClose: 'ರೂಮ್ ಮುಚ್ಚಲು ಮತ್ತೆ ಒತ್ತಿ', closeRoom: 'ರೂಮ್ ಮುಚ್ಚಿ', startG: '{g} ಆರಂಭಿಸಿ', waitingPlayers: 'ಆಟಗಾರರಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ',
    youreOn: 'ನಿಮ್ಮ ತಂಡ', getReady: 'ಸಿದ್ಧರಾಗಿ', nQs: '{n} ಪ್ರಶ್ನೆಗಳು · ಪ್ರತಿಯೊಂದಕ್ಕೆ {s} ಸೆ', nRounds: '{n} ಸುತ್ತುಗಳು · ಪ್ರತಿಯೊಂದಕ್ಕೆ {s} ಸೆ', startingIn: 'ಆರಂಭಕ್ಕೆ',
    endGame: 'ಆಟ ಮುಗಿಸಿ', nextIn: 'ಮುಂದಿನ ಸುತ್ತು', resultsIn: 'ಫಲಿತಾಂಶ', nextNow: 'ಈಗಲೇ ಮುಂದೆ', seeResults: 'ಫಲಿತಾಂಶ ನೋಡಿ',
    qOf: 'ಪ್ರಶ್ನೆ {i} / {n}', rOf: 'ಸುತ್ತು {i} / {n}', answersIn: 'ಬಂದ ಉತ್ತರಗಳು', votesIn: 'ಬಂದ ಮತಗಳು', xOfY: '{a} / {b}', timeLeft: 'ಉಳಿದ ಸಮಯ',
    hiddenWord: 'ಗುಪ್ತ ಪದ', livesLeft: '{b}ರಲ್ಲಿ {a} ಜೀವ ಉಳಿದಿವೆ', setting: 'ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ…', gettingReady: 'ಸಿದ್ಧವಾಗುತ್ತಿದೆ…',
    rebuild: 'ಈ ವಚನವನ್ನು ಜೋಡಿಸಿ', piecesFast: '{n} ತುಂಡುಗಳು · ಸರಿಯಾದ ಕ್ರಮವನ್ನು ಬೇಗ ಜೋಡಿಸಿದವರು ಗೆಲ್ಲುವರು', doneT: 'ಮುಗಿಸಿದರು · {t}', placing: 'ಜೋಡಿಸುತ್ತಿದ್ದಾರೆ…', thinking: 'ಯೋಚಿಸುತ್ತಿದ್ದಾರೆ…',
    noOne: 'ಯಾರಿಗೂ ಸಿಗಲಿಲ್ಲ', wasFirst: '{n} ಮೊದಲಿಗರು', claims: '{team} {won} ಪಡೆಯಿತು. {ref}.', and: ' ಮತ್ತು ', answerWas: 'ಉತ್ತರ: {a}. {ref}.',
    landNS: 'ದೇಶ · ಉತ್ತರದಿಂದ ದಕ್ಷಿಣಕ್ಕೆ', open: 'ಖಾಲಿ',
    finishVerse: 'ವಚನ ಪೂರ್ಣಗೊಳಿಸಿ · {ref}', bonusTo: '{team}ಕ್ಕೆ ಬೋನಸ್. ಉತ್ತರ {l}.', answerWasL: 'ಉತ್ತರ {l}.',
    aboutWho: 'ಎರಡು ಸತ್ಯ, ಒಂದು ಸುಳ್ಳು', isTrue: '{l} ಸತ್ಯ · {ref}', wasLie: '{l} ಸುಳ್ಳಾಗಿತ್ತು', spotted: 'ಕಂಡುಹಿಡಿದವರು', first: 'ಮೊದಲು',
    whereGo: 'ಇದು ಎಲ್ಲಿ ಬರುತ್ತದೆ?', pickGap: 'ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಸ್ಥಳ ಆರಿಸಿ', placedRight: '{n} ಜನರು ಸರಿಯಾಗಿ ಇಟ್ಟರು: ಸ್ಥಳ {g}.', goesGap: 'ಇದು ಸ್ಥಳ {g}ರಲ್ಲಿ ಬರುತ್ತದೆ.',
    nLetters: '{n} ಅಕ್ಷರಗಳು', nWords: ' · {n} ಪದಗಳು', solvedT: 'ಬಿಡಿಸಿದರು · {t}', outT: 'ಹೊರಗೆ', livesN: '{n} ಜೀವ',
    putOrder: 'ಇವುಗಳನ್ನು ಬೈಬಲ್ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ', checkedN: '{n} ಬಾರಿ ಪರಿಶೀಲಿಸಿದರು', sorting: 'ಜೋಡಿಸುತ್ತಿದ್ದಾರೆ…', bibleOrder: 'ಬೈಬಲ್ ಕ್ರಮ',
    whichStory: 'ಯಾವ ಬೈಬಲ್ ಕಥೆ?', emojiClue: 'ಎಮೋಜಿ ಸುಳಿವು', solvedL: 'ಬಿಡಿಸಿದವರು', noOneYetAns: 'ಇನ್ನೂ ಯಾರೂ ಇಲ್ಲ. ಉತ್ತರಗಳು ಬಂದಂತೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
    noOneThis: 'ಇದು ಯಾರಿಗೂ ಸಿಗಲಿಲ್ಲ.', level: 'ತಂಡಗಳು ಸಮಬಲ,{w} {a}–{b}.', wins: '{team} ಗೆದ್ದಿತು,{w} {a}–{b}.', inTribes: ' ಕುಲಗಳಲ್ಲಿ', inPoints: ' ಅಂಕಗಳಲ್ಲಿ',
    tonight: 'ಇಂದಿನ ಮೇಜು', takesIt: '{n} ಗೆದ್ದರು!', gameOver: 'ಆಟ ಮುಗಿಯಿತು.', anotherGame: 'ಇನ್ನೊಂದು ಆಟ', playAgain: 'ಮತ್ತೆ ಆಡಿ',
    room: 'ರೂಮ್', menuLeave: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ರೂಮ್ ಬಿಡಿ', youreIn: 'ನೀವು ಸೇರಿದ್ದೀರಿ.', choosing: 'ಆಯೋಜಕರು ಆಟ ಆರಿಸುತ್ತಿದ್ದಾರೆ', upNext: 'ಮುಂದಿನ ಆಟ',
    switchTeam: 'ತಂಡ ಬದಲಿಸಿ', readyWaiting: 'ಸಿದ್ಧ · ಆಯೋಜಕರಿಗಾಗಿ ಕಾಯುತ್ತಿದ್ದೀರಿ', imReady: 'ನಾನು ಸಿದ್ಧ',
    firstRight: 'ಮೊದಲ ಸರಿ ಉತ್ತರ · +{p}', rightP: 'ಸರಿ · +{p}', outOfTime: 'ಸಮಯ ಮುಗಿಯಿತು', notThisTime: 'ಈ ಬಾರಿ ಇಲ್ಲ',
    quizBook: 'ಕ್ವಿಜ್ ಪುಸ್ತಕ', allBooks: 'ಎಲ್ಲಾ ಪುಸ್ತಕಗಳು', difficulty: 'ಕಠಿಣತೆ', lv_e: 'ಸುಲಭ', lv_m: 'ಮಧ್ಯಮ', lv_h: 'ಕಠಿಣ',
    lvHint_e: 'ಸುಲಭ: ಎಲ್ಲರಿಗೂ ಗೊತ್ತಿರುವ ಕಥೆಗಳು, ವಚನಗಳು, ವ್ಯಕ್ತಿಗಳು.', lvHint_m: 'ಮಧ್ಯಮ: ಸುಲಭ ಮತ್ತು ಮಧ್ಯಮ ಪ್ರಶ್ನೆಗಳು.',
    lvHint_h: 'ಕಠಿಣ: ಎಲ್ಲಾ ಪ್ರಶ್ನೆಗಳು; ಕಡಿಮೆ ಸಮಯ, ಹ್ಯಾಂಗ್‌ಮ್ಯಾನ್‌ನಲ್ಲಿ 4 ಜೀವಗಳು, ವಚನ ಜೋಡಣೆಯಲ್ಲಿ 2 ಬೇರೆ ತುಂಡುಗಳು.',
    onlyBook: 'ಎಲ್ಲಾ ಆಟಗಳು {b} ಪುಸ್ತಕದಿಂದ ಮಾತ್ರ.', bkAllBooks: 'ಪುಸ್ತಕಗಳ ಕ್ರಮ ಆಟ ಯಾವಾಗಲೂ 66 ಪುಸ್ತಕಗಳನ್ನೂ ಬಳಸುತ್ತದೆ.',
    tapInOrderDecoy: 'ತುಂಡುಗಳನ್ನು ಕ್ರಮವಾಗಿ ಒತ್ತಿ. ಅವುಗಳಲ್ಲಿ ಎರಡು ಈ ವಚನದವಲ್ಲ.',
    wdEnter: 'ನಮೂದಿಸಿ', wdDelete: 'ಅಳಿಸಿ', wdShort: 'ಅಕ್ಷರಗಳು ಸಾಲದು', wdNotWord: 'ಪಟ್ಟಿಯಲ್ಲಿ ಈ ಪದ ಇಲ್ಲ', wdRight: 'ಸರಿಯಾದ ಸ್ಥಾನ', wdIn: 'ಪದದಲ್ಲಿದೆ, ಬೇರೆ ಸ್ಥಾನ', wdNot: 'ಪದದಲ್ಲಿಲ್ಲ',
    wdGuessN: '{m}ರಲ್ಲಿ {n}ನೇ ಪ್ರಯತ್ನ', wdSolvedN: '{n} ಪ್ರಯತ್ನದಲ್ಲಿ · {t}', wdOut: 'ಪ್ರಯತ್ನಗಳು ಮುಗಿದವು', wdGuessing: 'ಎಲ್ಲರೂ ಒಂದೇ ಪದವನ್ನು ಊಹಿಸುತ್ತಿದ್ದಾರೆ', wdTries: 'ಪ್ರತಿಯೊಬ್ಬರಿಗೆ {n} ಪ್ರಯತ್ನಗಳು. ಕಡಿಮೆ ಪ್ರಯತ್ನದವರು ಗೆಲ್ಲುವರು.', theWord: 'ಪದ',
    lockedIn: 'ಖಚಿತವಾಯಿತು', tapInOrder: 'ತುಂಡುಗಳನ್ನು ಕ್ರಮವಾಗಿ ಒತ್ತಿ', buildsHere: 'ನಿಮ್ಮ ವಚನ ಇಲ್ಲಿ ಜೋಡಣೆಯಾಗುತ್ತದೆ. ಹಿಂತೆಗೆಯಲು ಇಟ್ಟ ತುಂಡನ್ನು ಒತ್ತಿ.',
    yourVerse: 'ನಿಮ್ಮ ವಚನ', lockedInT: 'ಖಚಿತವಾಯಿತು · {t}', watchTable: 'ಆಟದ ಮೇಜನ್ನು ನೋಡಿ.', notQuite: 'ಸರಿಯಿಲ್ಲ',
    plus3: '3 ಸೆಕೆಂಡು ದಂಡ. ತುಂಡನ್ನು ಒತ್ತಿ ಹಿಂತೆಗೆದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', clearAns: 'ನನ್ನ ಉತ್ತರ ಅಳಿಸಿ', roundOver: 'ಸುತ್ತು ಮುಗಿಯಿತು',
    finishedIn: 'ನಿಮ್ಮ ಸಮಯ: {t}.', noPoints: 'ಈ ಸುತ್ತಿನಲ್ಲಿ ಅಂಕಗಳಿಲ್ಲ', beQuicker: 'ಮುಂದಿನ ಬಾರಿ ಇನ್ನೂ ಬೇಗ!',
    claimedLand: 'ನೀವು {team}ಕ್ಕೆ ಭೂಮಿ ಪಡೆದಿರಿ. {ref}.', itWas: 'ಉತ್ತರ: {a}. {ref}.', answerInWait: 'ಉತ್ತರ ಕಳುಹಿಸಲಾಗಿದೆ · ಇತರರಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ',
    pointsFor: '{team}ಕ್ಕೆ ಅಂಕಗಳು.', itEnds: 'ಕೊನೆಯ ಭಾಗ: {a}', spotLie: 'ಸುಳ್ಳನ್ನು ಹುಡುಕಿ · {d}', yourTime: 'ನಿಮ್ಮ ಸಮಯ {t}. ', lieWas: '{l} ಸುಳ್ಳಾಗಿತ್ತು. {x}',
    voteIn: 'ಮತ ಕಳುಹಿಸಲಾಗಿದೆ · ಉತ್ತರ ತೋರಿಸುವವರೆಗೆ ಬದಲಿಸಬಹುದು', tapLie: 'ಸುಳ್ಳನ್ನು ಒತ್ತಿ · ನಿಮ್ಮ ಮತ ರಹಸ್ಯ',
    yourCard: 'ನಿಮ್ಮ ಕಾರ್ಡ್', gapN: 'ಸ್ಥಳ {g}.', yourAnswer: 'ನಿಮ್ಮ ಉತ್ತರ', placeHere: 'ಇಲ್ಲಿ ಇಡಿ',
    solvedIn: 'ಬಿಡಿಸಿದ ಸಮಯ {t}.', answerWasW: 'ಉತ್ತರ: {w}.', outOfLives: 'ಜೀವಗಳು ಮುಗಿದವು', itWasW: 'ಉತ್ತರ: {w}.', inWord: ', ಪದದಲ್ಲಿದೆ', notInWord: ', ಪದದಲ್ಲಿಲ್ಲ',
    dragOrTap: 'ಪುಸ್ತಕವನ್ನು ಎಳೆಯಿರಿ, ಅಥವಾ ಎರಡನ್ನು ಒತ್ತಿ ಅದಲುಬದಲು ಮಾಡಿ', position: '{b}, ಸ್ಥಾನ {i}', allSix: 'ಆರೂ ಕ್ರಮದಲ್ಲಿವೆ · {t}', nInPlace: '6ರಲ್ಲಿ {n} ಸರಿಯಾದ ಸ್ಥಾನದಲ್ಲಿವೆ',
    plus3b: '3 ಸೆಕೆಂಡು ದಂಡ. ಮುಂದುವರಿಸಿ, ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.', checkOrder: 'ನನ್ನ ಕ್ರಮ ಪರಿಶೀಲಿಸಿ', wereInPlace: '6ರಲ್ಲಿ {n} ಸರಿಯಾದ ಸ್ಥಾನದಲ್ಲಿದ್ದವು.',
    gotIt: 'ಸರಿ! · {o}', waitOthers: 'ಇತರರಿಗಾಗಿ ಅಥವಾ ಸಮಯ ಮುಗಿಯುವವರೆಗೆ ಕಾಯಿರಿ.', guessB: 'ಉತ್ತರಿಸಿ', notIt: 'ಇದಲ್ಲ',
    tryAgainSpell: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. ಮುಖ್ಯ ಹೆಸರು ಸರಿಯಿದ್ದರೆ ಸಾಕು; ಇಂಗ್ಲಿಷ್‌ನಲ್ಲೂ ಉತ್ತರಿಸಬಹುದು.',
    youFinished: 'ನಿಮ್ಮ ಸ್ಥಾನ', nPoints: '{n} ಅಂಕಗಳು', points: 'ಅಂಕಗಳು', roundsScored: 'ಅಂಕ ಪಡೆದ ಸುತ್ತುಗಳು', playersL: 'ಆಟಗಾರರು',
    hostCanStart: 'ಆಯೋಜಕರು ಇನ್ನೊಂದು ಆಟ ಆರಂಭಿಸಬಹುದು. ಮತ್ತೆ ಆಡಲು ಇಲ್ಲೇ ಇರಿ.', leaveRoom: 'ರೂಮ್ ಬಿಡಿ',
    themeNoteHost: 'ನಿಮ್ಮ ಥೀಮ್ ಈ ರೂಮ್‌ನ ಎಲ್ಲಾ ಫೋನ್‌ಗಳಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.', themeNotePlayer: 'ರೂಮ್‌ನಲ್ಲಿರುವಾಗ ಆಯೋಜಕರ ಥೀಮ್ ಕಾಣಿಸುತ್ತದೆ. ನಿಮ್ಮ ಆಯ್ಕೆ ರೂಮ್‌ನ ಹೊರಗೆ ಅನ್ವಯಿಸುತ್ತದೆ.',
    theme: 'ಥೀಮ್', cyber: 'ಸೈಬರ್‌ಪಂಕ್', glass: 'ಬಣ್ಣದ ಗಾಜು', lightDark: 'ಬೆಳಕು ಅಥವಾ ಕತ್ತಲು', auto: 'ಸ್ವಯಂ', light: 'ಬೆಳಕು', dark: 'ಕತ್ತಲು',
    version: 'ಆವೃತ್ತಿ {v}', scriptureNote: 'ಕನ್ನಡ ವಚನಗಳು ಸತ್ಯವೇದವು ಪಠ್ಯದಿಂದ. ಇಂಗ್ಲಿಷ್ ವಚನಗಳು King James Version (ಸಾರ್ವಜನಿಕ ಸ್ವತ್ತು).',
    sendFeedback: 'ಪ್ರತಿಕ್ರಿಯೆ ಕಳುಹಿಸಿ: andy.andersonjones@gmail.com', scanToJoin: 'ಸೇರಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', qrLabel: 'ರೂಮ್ {c}ಗೆ ಸೇರಲು QR ಕೋಡ್',
    shareText: 'ನನ್ನ Upper Room ಆಟಕ್ಕೆ ಸೇರಿ. ಕೋಡ್: {c}', newVersion: 'ಹೊಸ ಆವೃತ್ತಿ ಸಿದ್ಧವಿದೆ', update: 'ಅಪ್‌ಡೇಟ್', updating: 'ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತಿದೆ…', someone: 'ಯಾರೋ',
    byRound: 'ಸುತ್ತುವಾರು ಅಂಕಗಳು', nFirsts: '{n} ಬಾರಿ ಮೊದಲು', roundsOf: '{b}ರಲ್ಲಿ {a} ಸುತ್ತುಗಳಲ್ಲಿ ಅಂಕ', firsts: 'ಮೊದಲ ಸ್ಥಾನ',
    ruleRank: 'ಪ್ರತಿ ಸುತ್ತು: 1ನೇ 300 · 2ನೇ 200 · ಮುಗಿಸಿದ ಇತರರು 100 · ಮುಗಿಸದಿದ್ದರೆ 0. ಎತ್ತರದ ಕಂಬಿಗಳು ಮೊದಲ ಸ್ಥಾನಗಳು.',
    ruleTrivia: 'ಪ್ರತಿ ಸುತ್ತು: ಮೊದಲ ಸರಿ ಉತ್ತರ 200 · ಇತರ ಸರಿ ಉತ್ತರಗಳು 100 · ತಪ್ಪು ಅಥವಾ ಉತ್ತರವಿಲ್ಲದಿದ್ದರೆ 0. ಎತ್ತರದ ಕಂಬಿಗಳು ಮೊದಲ ಸ್ಥಾನಗಳು.',
    bibleVerses: 'ಬೈಬಲ್ ವಚನಗಳು', sameAsApp: 'ಆ್ಯಪ್‌ನಂತೆ', verseNote: 'ವಚನ ಜೋಡಣೆ ಮತ್ತು ವಚನ ಪೂರ್ಣಗೊಳಿಸಿ ಆಟಗಳಲ್ಲಿ ವಚನಗಳು ಈ ಭಾಷೆಯಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
    secs: '{n} ಸೆ', ordinal: '{n}ನೇ'
  }
};

// Game names, modes and how-to text.
export const GAME_TEXT = {
  kn: {
    pc: ['ಬೈಬಲ್ ಚಿತ್ರಾಟ'], vs: ['ವಚನ ಜೋಡಣೆ', 'ಒಂದು ವಚನವನ್ನು ತುಂಡುಗಳಾಗಿ ಕತ್ತರಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಅವುಗಳನ್ನು ಕ್ರಮವಾಗಿ ಒತ್ತಿ. ಸರಿಯಾದ ಕ್ರಮವನ್ನು ಬೇಗ ಜೋಡಿಸಿದವರು ಗೆಲ್ಲುವರು.'],
    bk: ['ಪುಸ್ತಕಗಳ ಕ್ರಮ', 'ಬೈಬಲ್‌ನ ಆರು ಪುಸ್ತಕಗಳು, ಕಲಸಿಹೋಗಿವೆ. ಎಳೆದು, ಅಥವಾ ಎರಡನ್ನು ಒತ್ತಿ ಅದಲುಬದಲು ಮಾಡಿ, ಬೈಬಲ್ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ. ತಪ್ಪು ಪರಿಶೀಲನೆಗೆ 3 ಸೆಕೆಂಡು ದಂಡ.'],
    tt: ['ಎರಡು ಸತ್ಯ, ಒಂದು ಸುಳ್ಳು', 'ಒಬ್ಬ ಬೈಬಲ್ ವ್ಯಕ್ತಿಯ ಬಗ್ಗೆ ಮೂರು ಹೇಳಿಕೆಗಳು. ಎರಡು ಸತ್ಯ. ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಸುಳ್ಳಿಗೆ ಮತ ನೀಡಿ. ಮೊದಲ ಸರಿ ಉತ್ತರಕ್ಕೆ ಬೋನಸ್; ಮತ ಬದಲಿಸಿದರೆ ನಿಮ್ಮ ಸಮಯ ಮತ್ತೆ ಆರಂಭವಾಗುತ್ತದೆ.'],
    fv: ['ವಚನ ಪೂರ್ಣಗೊಳಿಸಿ', 'ವಚನದ ಆರಂಭ ತೋರಿಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಸರಿಯಾದ ಕೊನೆಯ ಭಾಗವನ್ನು ಆರಿಸಿ. ಪ್ರತಿ ಸರಿ ಉತ್ತರಕ್ಕೆ ನಿಮ್ಮ ತಂಡಕ್ಕೆ ಅಂಕ; ಮೊದಲ ಸರಿ ಉತ್ತರಕ್ಕೆ ಬೋನಸ್.'],
    tl: ['ಬೈಬಲ್ ಕಾಲರೇಖೆ', 'ನಾಲ್ಕು ಘಟನೆಗಳು ಬೈಬಲ್ ಕ್ರಮದಲ್ಲಿ ತೋರಿಸಲಾಗುತ್ತವೆ. ಹೊಸ ಘಟನೆ ಬರಬೇಕಾದ ಸ್ಥಳವನ್ನು ಒತ್ತಿ. ಮೊದಲ ಸರಿ ಉತ್ತರಕ್ಕೆ ಬೋನಸ್.'],
    hu: ['ಹೆಡ್ಸ್ ಅಪ್'], wd: ['ಬೈಬಲ್ ವರ್ಡಲ್', 'ಎಲ್ಲರೂ ತಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಒಂದೇ ಬೈಬಲ್ ಪದವನ್ನು ಆರು ಪ್ರಯತ್ನಗಳಲ್ಲಿ ಊಹಿಸುತ್ತಾರೆ. ಬಣ್ಣದ ಚೌಕಗಳು ಸರಿಯಾದ ಸ್ಥಾನದ ಅಕ್ಷರಗಳನ್ನೂ ಪದದಲ್ಲಿರುವ ಆದರೆ ಬೇರೆ ಸ್ಥಾನದ ಅಕ್ಷರಗಳನ್ನೂ ತೋರಿಸುತ್ತವೆ. ಕಡಿಮೆ ಪ್ರಯತ್ನದಲ್ಲಿ ಬಿಡಿಸಿದವರು ಗೆಲ್ಲುವರು; ಸಮವಾದರೆ ಸಮಯ ನಿರ್ಧರಿಸುತ್ತದೆ.'],
    em: ['ಎಮೋಜಿ ಬೈಬಲ್', 'ಎಮೋಜಿಗಳಿಂದ ಬೈಬಲ್ ಕಥೆಯನ್ನು ಊಹಿಸಿ. ಉತ್ತರ ಟೈಪ್ ಮಾಡಿ (ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್); ಮೊದಲು ಸರಿ ಉತ್ತರಿಸಿದವರಿಗೆ ಹೆಚ್ಚು ಅಂಕ.'],
    ex: ['ಐಗುಪ್ತದಿಂದ ಪಾರು'], tr: ['ಹನ್ನೆರಡು ಕುಲಗಳು', 'ಎರಡು ತಂಡಗಳು. ಪ್ರತಿ ಪ್ರಶ್ನೆಗೆ ಮೊದಲ ಸರಿ ಉತ್ತರ ನೀಡಿದ ತಂಡ ನಕ್ಷೆಯಲ್ಲಿ ಭೂಮಿಯನ್ನು ಪಡೆಯುತ್ತದೆ.'],
    hg: ['ಬೈಬಲ್ ಪದ ಊಹೆ', 'ಎಲ್ಲರೂ ತಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಒಂದೇ ಗುಪ್ತ ಪದವನ್ನು ಒಂದೊಂದು ಅಕ್ಷರವಾಗಿ ಬಿಡಿಸುತ್ತಾರೆ. ಆರು ತಪ್ಪು ಅಕ್ಷರಗಳಾದರೆ ನೀವು ಹೊರಗೆ. ಬೇಗ ಬಿಡಿಸಿದವರು ಗೆಲ್ಲುವರು.']
  }
};
export const MODE_KN = { Draw: 'ಚಿತ್ರ', Race: 'ಓಟ', Vote: 'ಮತ', Teams: 'ತಂಡಗಳು', Place: 'ಇರಿಸಿ', Daily: 'ದಿನದ ಆಟ', Buzz: 'ಬಜ್', 'Co-op': 'ಸಹಕಾರ' };
export const TEAM_KN = { ruby: 'ಮಾಣಿಕ್ಯ ತಂಡ', sapphire: 'ನೀಲಮಣಿ ತಂಡ' };
export const COLOR_KN = { ruby: 'ಕೆಂಪು', sapphire: 'ನೀಲಿ', emerald: 'ಹಸಿರು', amber: 'ಹಳದಿ', amethyst: 'ನೇರಳೆ', teal: 'ನೀಲಿಹಸಿರು' };
export const CAT_KN = { Person: 'ವ್ಯಕ್ತಿ', Place: 'ಸ್ಥಳ', Thing: 'ವಸ್ತು', Angel: 'ದೇವದೂತ', River: 'ನದಿ', Mountain: 'ಬೆಟ್ಟ', Island: 'ದ್ವೀಪ', Feast: 'ಹಬ್ಬ', Event: 'ಘಟನೆ', Parable: 'ಸಾಮ್ಯ' };

let lang = 'en';
try { const l = localStorage.getItem('ur.lang'); if (l && STR[l]) lang = l; } catch (e) { /* private mode */ }
if (typeof document !== 'undefined') document.documentElement.lang = lang;

export const getLang = () => lang;

// Bible verse language, separate from the interface: 'auto' (same as the app), 'en' or 'kn'.
let versePref = 'auto';
try { const v = localStorage.getItem('ur.verseLang'); if (v === 'en' || v === 'kn') versePref = v; } catch (e) { /* private mode */ }
export const getVersePref = () => versePref;
export const getVerseLang = () => (versePref === 'auto' ? lang : versePref);
export function setVersePref(v) {
  versePref = v === 'en' || v === 'kn' ? v : 'auto';
  try { localStorage.setItem('ur.verseLang', versePref); } catch (e) { /* private mode */ }
}
export function setLang(l) {
  if (!STR[l]) return;
  lang = l;
  try { localStorage.setItem('ur.lang', l); } catch (e) { /* private mode */ }
  if (typeof document !== 'undefined') document.documentElement.lang = l;
}
export function t(key, vars = {}) {
  let s = STR[lang][key] ?? STR.en[key] ?? key;
  for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
