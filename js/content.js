// Game content. Scripture quotations are from the King James Version (public domain).

// Verse Scramble: each verse is split into pieces in the correct order.
export const VERSES = [
  { ref: 'Psalm 119:105', parts: ['Thy word', 'is a lamp', 'unto my feet,', 'and a light', 'unto my path.'] },
  { ref: 'John 3:16', parts: ['For God so loved the world,', 'that he gave', 'his only begotten Son,', 'that whosoever believeth in him', 'should not perish,', 'but have everlasting life.'] },
  { ref: 'Philippians 4:13', parts: ['I can do', 'all things', 'through Christ', 'which strengtheneth me.'] },
  { ref: 'Proverbs 3:5', parts: ['Trust in the LORD', 'with all thine heart;', 'and lean not', 'unto thine own understanding.'] },
  { ref: 'Genesis 1:1', parts: ['In the beginning', 'God created', 'the heaven', 'and the earth.'] },
  { ref: 'Psalm 23:1', parts: ['The LORD', 'is my shepherd;', 'I shall', 'not want.'] },
  { ref: 'Matthew 6:33', parts: ['But seek ye first', 'the kingdom of God,', 'and his righteousness;', 'and all these things', 'shall be added unto you.'] },
  { ref: 'Romans 8:28', parts: ['And we know', 'that all things work together', 'for good', 'to them that love God,', 'to them who are the called', 'according to his purpose.'] },
  { ref: 'Isaiah 40:31', parts: ['But they that wait upon the LORD', 'shall renew their strength;', 'they shall mount up with wings as eagles;', 'they shall run, and not be weary;', 'and they shall walk, and not faint.'] },
  { ref: 'Joshua 1:9', parts: ['Have not I commanded thee?', 'Be strong and of a good courage;', 'be not afraid,', 'neither be thou dismayed:', 'for the LORD thy God is with thee', 'whithersoever thou goest.'] },
  { ref: 'Psalm 46:10', parts: ['Be still,', 'and know that I am God:', 'I will be exalted among the heathen,', 'I will be exalted in the earth.'] },
  { ref: 'Matthew 11:28', parts: ['Come unto me,', 'all ye that labour', 'and are heavy laden,', 'and I will give you rest.'] },
  { ref: '1 John 1:9', parts: ['If we confess our sins,', 'he is faithful and just', 'to forgive us our sins,', 'and to cleanse us', 'from all unrighteousness.'] },
  { ref: 'Romans 3:23', parts: ['For all have sinned,', 'and come short', 'of the glory of God;'] },
  { ref: 'Hebrews 11:1', parts: ['Now faith is', 'the substance', 'of things hoped for,', 'the evidence', 'of things not seen.'] },
  { ref: 'Micah 6:8', parts: ['He hath shewed thee, O man,', 'what is good;', 'and what doth the LORD require of thee,', 'but to do justly,', 'and to love mercy,', 'and to walk humbly with thy God?'] }
];

// Twelve Tribes: the map, north to south.
export const TRIBES = ['Asher', 'Naphtali', 'Dan', 'Zebulun', 'Issachar', 'Gad', 'Manasseh', 'Ephraim', 'Reuben', 'Benjamin', 'Judah', 'Simeon'];

// Trivia: `a` is the index of the right option.
export const TRIVIA = [
  { q: "Who interpreted Pharaoh's dreams?", o: ['Daniel', 'Joseph', 'Moses', 'Samuel'], a: 1, ref: 'Genesis 41' },
  { q: 'How many days and nights did it rain in the flood?', o: ['Seven', 'Twelve', 'Forty', 'A hundred'], a: 2, ref: 'Genesis 7:12' },
  { q: 'Who was swallowed by a great fish?', o: ['Peter', 'Jonah', 'Elijah', 'Noah'], a: 1, ref: 'Jonah 1:17' },
  { q: 'What did David use to bring down Goliath?', o: ['A spear', 'A bow', 'A sling and a stone', 'A sword'], a: 2, ref: '1 Samuel 17:49' },
  { q: 'Who was the first king of Israel?', o: ['David', 'Saul', 'Solomon', 'Samuel'], a: 1, ref: '1 Samuel 10' },
  { q: 'In which town was Jesus born?', o: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Capernaum'], a: 2, ref: 'Matthew 2:1' },
  { q: 'Who denied Jesus three times?', o: ['Judas', 'Thomas', 'John', 'Peter'], a: 3, ref: 'Luke 22:61' },
  { q: 'What was Paul also called?', o: ['Silas', 'Saul', 'Barnabas', 'Stephen'], a: 1, ref: 'Acts 13:9' },
  { q: 'Which sea did God part for Moses and the people?', o: ['The Dead Sea', 'The Sea of Galilee', 'The Red Sea', 'The Great Sea'], a: 2, ref: 'Exodus 14' },
  { q: 'How many apostles did Jesus choose?', o: ['Seven', 'Ten', 'Twelve', 'Seventy'], a: 2, ref: 'Mark 3:14' },
  { q: "Who was thrown into the lions' den?", o: ['Daniel', 'Shadrach', 'Joseph', 'Elisha'], a: 0, ref: 'Daniel 6' },
  { q: 'What food did God send from heaven in the wilderness?', o: ['Figs', 'Manna', 'Barley loaves', 'Honey'], a: 1, ref: 'Exodus 16:31' },
  { q: 'Who was told to build an ark of gopher wood?', o: ['Abraham', 'Moses', 'Noah', 'Lot'], a: 2, ref: 'Genesis 6:14' },
  { q: 'Which king asked God for wisdom?', o: ['Saul', 'David', 'Hezekiah', 'Solomon'], a: 3, ref: '1 Kings 3:9' },
  { q: 'Which disciple wanted to see the nail prints before he believed?', o: ['Andrew', 'Thomas', 'Philip', 'Peter'], a: 1, ref: 'John 20:25' },
  { q: 'At the wedding in Cana, what did Jesus turn water into?', o: ['Wine', 'Oil', 'Milk', 'Honey'], a: 0, ref: 'John 2:9' },
  { q: 'Who climbed a sycomore tree to see Jesus?', o: ['Nicodemus', 'Bartimaeus', 'Zacchaeus', 'Matthew'], a: 2, ref: 'Luke 19:4' },
  { q: 'Whose wife looked back and became a pillar of salt?', o: ["Abraham's", "Lot's", "Noah's", "Job's"], a: 1, ref: 'Genesis 19:26' },
  { q: 'What is the first book of the New Testament?', o: ['Mark', 'Acts', 'Matthew', 'Romans'], a: 2, ref: 'Matthew 1:1' },
  { q: 'Who was sold by his brothers for twenty pieces of silver?', o: ['Benjamin', 'Reuben', 'Esau', 'Joseph'], a: 3, ref: 'Genesis 37:28' },
  { q: 'Which prophet went up to heaven by a whirlwind?', o: ['Elisha', 'Elijah', 'Isaiah', 'Jeremiah'], a: 1, ref: '2 Kings 2:11' },
  { q: 'Who led the people around the walls of Jericho?', o: ['Caleb', 'Gideon', 'Moses', 'Joshua'], a: 3, ref: 'Joshua 6' },
  { q: 'Which woman judged Israel?', o: ['Ruth', 'Deborah', 'Esther', 'Miriam'], a: 1, ref: 'Judges 4:4' },
  { q: "Who was Ruth's mother-in-law?", o: ['Orpah', 'Rachel', 'Naomi', 'Hannah'], a: 2, ref: 'Ruth 1' },
  { q: 'What did Esau sell to Jacob for a meal?', o: ['His birthright', 'His sheep', 'His coat', 'His land'], a: 0, ref: 'Genesis 25:33' },
  { q: 'On which day did God rest from his work?', o: ['The first', 'The third', 'The sixth', 'The seventh'], a: 3, ref: 'Genesis 2:2' },
  { q: 'Who betrayed Jesus with a kiss?', o: ['Peter', 'Judas Iscariot', 'Pilate', 'Caiaphas'], a: 1, ref: 'Luke 22:48' },
  { q: 'Who washed his hands before the crowd at Jesus’ trial?', o: ['Herod', 'Caiaphas', 'Pilate', 'Annas'], a: 2, ref: 'Matthew 27:24' },
  { q: 'What did God make on the first day?', o: ['Animals', 'Light', 'Man', 'The stars'], a: 1, ref: 'Genesis 1:3' },
  { q: 'How many loaves fed the five thousand?', o: ['Two', 'Five', 'Seven', 'Twelve'], a: 1, ref: 'Matthew 14:17' },
  { q: 'Whose strength was tied to his uncut hair?', o: ['Gideon', 'Absalom', 'Samson', 'Goliath'], a: 2, ref: 'Judges 16:17' },
  { q: 'Who was the mother of Samuel?', o: ['Hannah', 'Sarah', 'Rebekah', 'Leah'], a: 0, ref: '1 Samuel 1:20' }
];

// Emoji Bible: `keys` are accepted answers; every word of one key must appear in the guess.
export const EMOJI = [
  { e: '🐋🙍‍♂️', a: 'Jonah and the great fish', ref: 'Jonah 1–2', keys: ['jonah'] },
  { e: '🌧️🚢🦒🦓🌈', a: "Noah's ark", ref: 'Genesis 6–9', keys: ['noah', 'ark', 'flood'] },
  { e: '🐍🍎🌳👫', a: 'Adam and Eve in the garden', ref: 'Genesis 3', keys: ['adam', 'eve', 'eden', 'serpent', 'fall'] },
  { e: '🔥🌳👞', a: 'The burning bush', ref: 'Exodus 3', keys: ['burning bush', 'bush'] },
  { e: '🌊🚶🌊', a: 'Crossing the Red Sea', ref: 'Exodus 14', keys: ['red sea', 'parting sea', 'sea parted', 'crossing sea'] },
  { e: '🦁🦁🙏', a: "Daniel in the lions' den", ref: 'Daniel 6', keys: ['daniel', 'lion den', 'lions den'] },
  { e: '🎺🎺🧱💥', a: 'The walls of Jericho', ref: 'Joshua 6', keys: ['jericho'] },
  { e: '💇‍♂️✂️💪', a: 'Samson and Delilah', ref: 'Judges 16', keys: ['samson', 'delilah'] },
  { e: '🍞🐟🐟👥👥👥', a: 'Feeding the five thousand', ref: 'Matthew 14', keys: ['5000', 'five thousand', 'loaves', 'fishes', 'feeding'] },
  { e: '💧➡️🍷', a: 'Water into wine', ref: 'John 2', keys: ['wine', 'cana'] },
  { e: '🌳🧍👀', a: 'Zacchaeus up the tree', ref: 'Luke 19', keys: ['zacchaeus', 'zaccheus', 'zacheus', 'zacchaeous'] },
  { e: '🧥🌈👦', a: "Joseph's coat of many colours", ref: 'Genesis 37', keys: ['joseph', 'coat'] },
  { e: '⭐🐪🎁👑', a: 'The wise men', ref: 'Matthew 2', keys: ['wise men', 'magi', 'three kings', 'wisemen'] },
  { e: '🐑❓🔦', a: 'The lost sheep', ref: 'Luke 15', keys: ['lost sheep', 'sheep'] },
  { e: '🏠🪨🏠🏖️', a: 'The wise and foolish builders', ref: 'Matthew 7', keys: ['builder', 'house rock', 'wise foolish', 'rock sand'] },
  { e: '👦💰🐖🏃🤗', a: 'The prodigal son', ref: 'Luke 15', keys: ['prodigal', 'lost son'] },
  { e: '🌊🚶‍♂️⛵', a: 'Jesus walks on water', ref: 'Matthew 14', keys: ['walk water', 'walks water', 'walking water', 'walked water'] },
  { e: '🧱🧱🗼🗣️❓', a: 'The tower of Babel', ref: 'Genesis 11', keys: ['babel', 'tower'] },
  { e: '👦🪨⚔️🛡️', a: 'David and Goliath', ref: '1 Samuel 17', keys: ['david', 'goliath'] },
  { e: '🪨➡️🕳️🌅', a: 'The empty tomb', ref: 'Matthew 28', keys: ['resurrection', 'risen', 'empty tomb', 'tomb', 'easter'] },
  { e: '🔥🧍🧍🧍🧍', a: 'The fiery furnace', ref: 'Daniel 3', keys: ['furnace', 'shadrach', 'meshach', 'abednego'] },
  { e: '🫗🦶🧺', a: 'Jesus washes the disciples’ feet', ref: 'John 13', keys: ['feet', 'foot'] },
  { e: '🌾👩‍🌾💛', a: 'Ruth in the fields of Boaz', ref: 'Ruth 2', keys: ['ruth', 'boaz'] },
  { e: '👑👸📜🙏', a: 'Queen Esther', ref: 'Esther 4–5', keys: ['esther'] }
];
