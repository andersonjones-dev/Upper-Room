# Upper Room

Bible party games where everyone plays on their own phone. One phone hosts and becomes "the table" (timer, scores, the map); everyone else joins with a four-letter code or by scanning a QR code. No accounts. Works on iPhone and Android in the browser, and can be added to the Home Screen.

**Version 1.4.0 games (8 of 12):** Verse Scramble, Twelve Tribes Trivia, Emoji Bible, Finish the Verse, Bible Hangman, Two Truths & a Lie, Books Sort, Bible Timeline. Pictionary, Heads Up, Bible Wordle and Exodus Escape show as "Soon" in the lobby.

**Content:** 64 KJV verses, 140 trivia questions, 104 emoji puzzles, 112 hangman words, 40 Two Truths sets, 59 timeline events and all 66 books. Verses were generated from the KJV text, so they're word-for-word exact; references were checked against it.

**Languages:** English and Kannada (ಕನ್ನಡ). Each phone picks its own with the EN | ಕನ್ನಡ switch on the start screen or in Settings, so one room can mix both. The host chooses which verse or question comes up; every phone shows it in its own language. Kannada verses come from the Kannada Bible text (ಸತ್ಯವೇದವು) with scanning errors repaired; the questions, puzzles and hangman words were translated for this app and use the Kannada Bible's spellings of names. Emoji Bible accepts answers in either language. **Bible verses** has its own setting (Settings → Bible verses: Same as app / English / ಕನ್ನಡ), so a phone can keep English menus but show Kannada verses in Verse Scramble and Finish the Verse.

**Scoring:** Verse Scramble, Books Sort, Hangman and Emoji Bible give 300 / 200 / 100 by finishing order each round (0 if not finished). Twelve Tribes, Finish the Verse, Two Truths and Timeline give 200 for the first right answer and 100 for other right answers. Total time is not used. The final results show each player's points round by round and how many rounds they won, so the ranking is easy to follow.

**Themes:** Cyberpunk Glitch and Stained Glass, each in light and dark (Luxury Noir was removed in 1.2.1). The host's theme shows on every phone in the room.

© 2026 Anderson Jones. Scripture quotations are from the King James Version (public domain).

---

## One-time setup (from your iPhone)

### 1. Publish the database rules (required, or nothing can connect)
1. Open **console.firebase.google.com** in Safari and open the **upper-room** project.
2. Tap **Build → Realtime Database → Rules**.
3. Delete everything in the box and paste the whole contents of `database.rules.json` from this repo.
4. Tap **Publish**.

### 2. Check anonymous sign-in is on
**Build → Authentication → Sign-in method → Anonymous** should say *Enabled*.

### 3. Turn on GitHub Pages
1. On GitHub, open this repo → **Settings → Pages**.
2. Under *Branch*, choose **main** and **/ (root)**, then **Save**.
3. After a minute the app is live at **https://andersonjones-dev.github.io/Upper-Room/**

### 4. Add it to your Home Screen
Open the link in Safari → Share → **Add to Home Screen**.

---

## How a game runs
1. The host taps **Host a room**, picks a game, rounds and seconds, and (for the whole room) a **Quiz book** and a **Difficulty**.
2. Players tap **Join with a code** (or scan the QR / tap the shared link), type their name and pick a colour.
3. The host taps **Start**. Rounds run on their own: intro, play, reveal, next. The host can also **Reveal now**, **Next now** or **End game**.
4. At the end: podium on the table, each player's place on their own phone. **Play again** or **Another game**.

**Testing on your own:** in the lobby, tap **Add practice bot** (up to 20 players in total). Bots are run by the host's phone: they answer at random times and get roughly two out of three right. **Remove bots** takes them all out.

**Quiz book (for church Bible quizzes):** pick one of Genesis, Exodus, Joshua, Judges, Ruth, 1 Samuel, Esther, Daniel, Matthew, Luke, John or Acts, and every game uses only that book (Books Sort always uses all 66 books). **All books** mixes everything.

**Difficulty:** every question, verse, word and event is tagged Easy, Medium or Hard. Easy uses the best-known ones; Medium adds the medium ones; Hard uses everything, takes a quarter off the timer, gives 4 Hangman lives instead of 6 and mixes 2 stray pieces from another verse into Verse Scramble.

**No repeats:** the host's phone remembers what each game has already used (per quiz book and difficulty). Nothing comes up again until everything in that set has come up once; then a new cycle starts.

If a phone drops out or the app is closed, opening it again rejoins the same room automatically.

## What's in each file
| File | What it does |
|---|---|
| `index.html` | The page shell. |
| `css/tokens.css` | The two themes' colours, fonts, spacing (light and dark). |
| `css/app.css` | How every part looks, per theme. |
| `js/app.js` | Screens, rooms, and the host's game control. |
| `js/logic.js` | Scoring and rules (tested). |
| `js/content.js` | Hangman words (with book and difficulty), Two Truths sets, timeline events, the 66 books, the tribes. |
| `js/verses.js` | 350 KJV verses (exact text, split into pieces), each tagged with a difficulty. |
| `js/trivia.js` | Trivia questions with references. |
| `js/emoji.js` | Emoji puzzles and the answers each one accepts. |
| `js/games.js` | Round set-up and right answers for each game, Hard-mode rules (tested). |
| `js/pool.js` | Quiz book and difficulty filters, the no-repeat rule, and which timeline events can be shown together (tested). |
| `js/config.js` | Firebase settings and the default theme. |
| `js/net-firebase.js` | Talks to Firebase. |
| `js/net-local.js` | Test-only stand-in for Firebase (`?net=local`). |
| `js/qr.js` | Makes the join QR code. |
| `js/i18n.js` | Every on-screen word in English and Kannada, and the language switch. |
| `js/text.js` | Gives each phone the game content in its own language. |
| `js/kn/verses.js` | The 350 verses in Kannada, split into the same number of pieces. |
| `js/kn/content.js` | Kannada questions, emoji answers, hangman words, Two Truths, timeline, books and tribes. |
| `sw.js` | Offline support and the "A new version is ready" bar. Bump `VERSION` on every change. |
| `database.rules.json` | Who can write what in the database. |

## Privacy
Players type a first name and pick a colour; nothing else is collected. Rooms are stored in Firebase while they're open; the host's **Close room** deletes the room.

## Known limits (v1)
- If the host's phone goes offline mid-game, the game pauses until it comes back (players see a note).
- Old rooms that were never closed stay in the database. They're tiny; clearing them out can come later.
- Fonts load from Google Fonts on first use, then work offline.

## Testing (for Claude)
```
node --test tests/logic.test.mjs
node tests/e2e.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots        # first three games
node tests/e2e-games.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots  # the five 1.2 games
node tests/e2e-kn.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots     # mixed English/Kannada room, all 8 games
node tests/e2e-quiz.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots   # quiz book (Ruth) + Hard, no repeats
```
