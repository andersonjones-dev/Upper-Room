# Upper Room

Bible party games where everyone plays on their own phone. One phone hosts and becomes "the table" (timer, scores, the map); everyone else joins with a four-letter code or by scanning a QR code. No accounts. Works on iPhone and Android in the browser, and can be added to the Home Screen.

**Version 2.2.0, 12 games plus Your Quiz:** Verse Scramble, Twelve Tribes Trivia, Emoji Bible, Finish the Verse, Bible Hangman, Two Truths & a Lie, Books Sort, Bible Timeline, Bible Pictionary, Heads Up, Bible Wordle and Exodus Escape, and **Your Quiz** (questions a quiz master writes). Plus a Daily Bible Wordle to play on your own, and Tournament night (several games, one champion). New in 2.2.0: Your Quiz, several quiz books at once (a drop-down instead of 12 buttons), and the word to draw in Pictionary stands out on the drawer's phone.

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

**Publish the rules again after updating to 2.2.0.** Your Quiz saves quizzes under `quizzes/`, which the old rules don't allow, so quizzes can't be saved until the new rules are published.

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

**Quiz books (for church Bible quizzes):** tap the drop-down and tick one or more of Genesis, Exodus, Joshua, Judges, Ruth, 1 Samuel, Esther, Daniel, Matthew, Luke, John and Acts; every game then uses only those books (Books Sort always uses all 66 books). **All books** mixes everything.

**Difficulty:** every question, verse, word and event is tagged Easy, Medium or Hard. Easy uses the best-known ones; Medium adds the medium ones; Hard uses everything, takes a quarter off the timer, gives 4 Hangman lives instead of 6 and mixes 2 stray pieces from another verse into Verse Scramble.

**Daily Bible Wordle:** the card on the start screen. Everyone gets the same Bible word each day (it changes at midnight on each phone), with no room needed. Six tries; tap a box to clear it and type into it; any letters are accepted. The phone keeps the streak, win % and guess counts, and **Share result** sends the coloured squares (never the letters) with a link. Every word comes up once before any repeats. The stats live on that phone only.

**Tournament night:** in the lobby, turn on **Tournament night** and tap 2 to 5 games in the order to play them (tap a name in the list to change that game's rounds and seconds). After each game its places become tournament points: 1st 10, 2nd 8, 3rd 6, then 5, 4, 3, 2 and 1; tied scores share the place and a score of 0 gets nothing. The results show the running table; after the last game (or **End tournament**) everyone sees the champion and each game's points.

**Your Quiz (for quiz masters):** **My quizzes** on the start screen, or **Write, edit or open a quiz** in the lobby when Your Quiz is picked. Write questions with 2 to 4 answers (tap the circle by the right one) and an optional Bible reference shown at the reveal, or **Paste questions** from Notes or WhatsApp: a question, then each answer on its own line with `*` before the right one, a blank line between questions, and `Ref:` for a reference. Up to 60 questions per quiz. Every change saves online by itself; the first save gives the quiz a 6-character **quiz code**. The code is the only way to open the quiz on another phone (**Open with a code**), so the app asks the quiz master to write it down. Anyone with the code can open and change the quiz; **Make a copy** gives a quiz its own new code. **Remove from this phone** only takes it off that phone's list: quizzes are never deleted online. In the lobby, pick the quiz, **In my order** or **Shuffle**, the seconds per question, and **Everyone** or **Two teams**. Scoring is like Two Truths: right answers 100, the first right answer 200, and changing your answer restarts your time. Players see the quiz master's words exactly as typed, in any language. Your Quiz can also be one of the games in a tournament.

**Old rooms:** each host phone remembers the rooms it opened. When it hosts again, it deletes its own rooms that haven't been used for a day (no database change needed). Rooms from before 2.1.0, or from phones that never host again, stay until deleted in the Firebase console.

**No repeats:** the host's phone remembers what each game has already used (per quiz book and difficulty). Nothing comes up again until everything in that set has come up once; then a new cycle starts.

If a phone drops out or the app is closed, opening it again rejoins the same room automatically.

## What's in each file
| File | What it does |
|---|---|
| `index.html` | The page shell. |
| `css/tokens.css` | The two themes' colours, fonts, spacing (light and dark). |
| `css/app.css` | How every part looks, per theme. |
| `js/app.js` | Screens, rooms, and the host's game control. |
| `js/logic.js` | Scoring and rules, the daily word and streaks, tournament points (tested). |
| `js/content.js` | Hangman words (with book and difficulty), Two Truths sets, timeline events, the 66 books, the tribes. |
| `js/verses.js` | 350 KJV verses (exact text, split into pieces), each tagged with a difficulty. |
| `js/trivia.js` | Trivia questions with references. |
| `js/emoji.js` | Emoji puzzles and the answers each one accepts. |
| `js/games.js` | Round set-up and right answers for each game, Hard-mode rules (tested). |
| `js/quiz.js` | Your Quiz: quiz codes, reading pasted questions, which questions are ready to play (tested). |
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
Players type a first name and pick a colour; nothing else is collected. Rooms are stored in Firebase while they're open; the host's **Close room** deletes the room. Quizzes written in Your Quiz are kept online under their quiz code and are never deleted by the app.

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
node tests/e2e-wordle.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots # Bible Wordle, Kannada + English (small phone)
node tests/e2e-headsup.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots # Heads Up turns, teams, mixed languages
node tests/e2e-pictionary.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots # drawing syncs, guesses, artist points
node tests/e2e-escape.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots   # Exodus Escape: split clues, wrong-code lock, shared points
node tests/e2e-quiz.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots   # book picker, quiz book (Ruth) + Hard, no repeats
node tests/e2e-yourquiz.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots # Your Quiz: write, paste, code, play, open on another phone
node tests/e2e-daily.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots  # daily Wordle: solve, stats, share, resume, Kannada
node tests/e2e-tour.cjs http://127.0.0.1:8765/upper-room/ /tmp/shots   # tournament night: list, points, ties, champion
node tests/e2e-cleanup.cjs http://127.0.0.1:8765/upper-room/           # host deletes only its own day-old rooms
```
