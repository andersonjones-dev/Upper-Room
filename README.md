# Upper Room

Bible party games where everyone plays on their own phone. One phone hosts and becomes "the table" (timer, scores, the map); everyone else joins with a four-letter code or by scanning a QR code. No accounts. Works on iPhone and Android in the browser, and can be added to the Home Screen.

**Version 1.2.0 games (8 of 12):** Verse Scramble, Twelve Tribes Trivia, Emoji Bible, Finish the Verse, Bible Hangman, Two Truths & a Lie, Books Sort, Bible Timeline. Pictionary, Heads Up, Bible Wordle and Exodus Escape show as "Soon" in the lobby.

**Content:** 64 KJV verses, 140 trivia questions, 104 emoji puzzles, 112 hangman words, 40 Two Truths sets, 59 timeline events and all 66 books. Verses were generated from the KJV text, so they're word-for-word exact; references were checked against it.

**Themes:** Luxury Noir, Cyberpunk Glitch, Stained Glass, each in light and dark. The host's theme shows on every phone in the room.

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
1. The host taps **Host a room**, picks a game, rounds and seconds.
2. Players tap **Join with a code** (or scan the QR / tap the shared link), type their name and pick a colour.
3. The host taps **Start**. Rounds run on their own: intro, play, reveal, next. The host can also **Reveal now**, **Next now** or **End game**.
4. At the end: podium on the table, each player's place on their own phone. **Play again** or **Another game**.

**Testing on your own:** in the lobby, tap **Add practice bot** (up to 20 players in total). Bots are run by the host's phone: they answer at random times and get roughly two out of three right. **Remove bots** takes them all out.

If a phone drops out or the app is closed, opening it again rejoins the same room automatically.

## What's in each file
| File | What it does |
|---|---|
| `index.html` | The page shell. |
| `css/tokens.css` | The three themes' colours, fonts, spacing (light and dark). |
| `css/app.css` | How every part looks, per theme. |
| `js/app.js` | Screens, rooms, and the host's game control. |
| `js/logic.js` | Scoring and rules (tested). |
| `js/content.js` | Hangman words, Two Truths sets, timeline events, the 66 books, the tribes. |
| `js/verses.js` | The 64 KJV verses (exact text, split into pieces). |
| `js/trivia.js` | Trivia questions with references. |
| `js/emoji.js` | Emoji puzzles and the answers each one accepts. |
| `js/games.js` | Round set-up and right answers for each game (tested). |
| `js/config.js` | Firebase settings and the default theme. |
| `js/net-firebase.js` | Talks to Firebase. |
| `js/net-local.js` | Test-only stand-in for Firebase (`?net=local`). |
| `js/qr.js` | Makes the join QR code. |
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
```
