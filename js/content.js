// Game content. Scripture quotations and names follow the King James Version (public domain).
export { VERSES } from './verses.js';
export { TRIVIA } from './trivia.js';
export { EMOJI } from './emoji.js';

// Twelve Tribes: the map, north to south.
export const TRIBES = ['Asher', 'Naphtali', 'Dan', 'Zebulun', 'Issachar', 'Gad', 'Manasseh', 'Ephraim', 'Reuben', 'Benjamin', 'Judah', 'Simeon'];

// Books Sort: the 66 books in Bible order.
export const BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];

// Bible Hangman: [word or phrase, category]. Letters A–Z and spaces only.
export const HANGMAN = [
  ['ABRAHAM', 'Person'], ['ISAAC', 'Person'], ['JACOB', 'Person'], ['JOSEPH', 'Person'], ['MOSES', 'Person'], ['AARON', 'Person'],
  ['MIRIAM', 'Person'], ['JOSHUA', 'Person'], ['CALEB', 'Person'], ['GIDEON', 'Person'], ['SAMSON', 'Person'], ['DEBORAH', 'Person'],
  ['RUTH', 'Person'], ['NAOMI', 'Person'], ['BOAZ', 'Person'], ['SAMUEL', 'Person'], ['DAVID', 'Person'], ['GOLIATH', 'Person'],
  ['JONATHAN', 'Person'], ['SOLOMON', 'Person'], ['ELIJAH', 'Person'], ['ELISHA', 'Person'], ['JEZEBEL', 'Person'], ['NAAMAN', 'Person'],
  ['ISAIAH', 'Person'], ['JEREMIAH', 'Person'], ['EZEKIEL', 'Person'], ['DANIEL', 'Person'], ['ESTHER', 'Person'], ['MORDECAI', 'Person'],
  ['NEHEMIAH', 'Person'], ['JONAH', 'Person'], ['METHUSELAH', 'Person'], ['NOAH', 'Person'], ['ENOCH', 'Person'], ['REBEKAH', 'Person'],
  ['RACHEL', 'Person'], ['BENJAMIN', 'Person'], ['ZACCHAEUS', 'Person'], ['NICODEMUS', 'Person'], ['LAZARUS', 'Person'], ['MARTHA', 'Person'],
  ['PETER', 'Person'], ['ANDREW', 'Person'], ['THOMAS', 'Person'], ['MATTHEW', 'Person'], ['BARNABAS', 'Person'], ['STEPHEN', 'Person'],
  ['TIMOTHY', 'Person'], ['LYDIA', 'Person'], ['PRISCILLA', 'Person'], ['BARTIMAEUS', 'Person'], ['GABRIEL', 'Angel'], ['HEROD', 'Person'],
  ['PILATE', 'Person'], ['MELCHIZEDEK', 'Person'], ['NEBUCHADNEZZAR', 'Person'], ['BATHSHEBA', 'Person'], ['ABSALOM', 'Person'], ['HANNAH', 'Person'],
  ['BETHLEHEM', 'Place'], ['NAZARETH', 'Place'], ['JERUSALEM', 'Place'], ['JERICHO', 'Place'], ['EGYPT', 'Place'], ['BABYLON', 'Place'],
  ['NINEVEH', 'Place'], ['GALILEE', 'Place'], ['JORDAN', 'River'], ['SINAI', 'Mountain'], ['CARMEL', 'Mountain'], ['GETHSEMANE', 'Place'],
  ['GOLGOTHA', 'Place'], ['DAMASCUS', 'Place'], ['CANAAN', 'Place'], ['BETHANY', 'Place'], ['CAPERNAUM', 'Place'], ['SAMARIA', 'Place'],
  ['PATMOS', 'Island'], ['EDEN', 'Place'], ['GOSHEN', 'Place'], ['EMMAUS', 'Place'], ['ANTIOCH', 'Place'], ['CORINTH', 'Place'],
  ['EPHESUS', 'Place'], ['MANNA', 'Thing'], ['TABERNACLE', 'Thing'], ['COVENANT', 'Thing'], ['PASSOVER', 'Feast'], ['PENTECOST', 'Feast'],
  ['FRANKINCENSE', 'Thing'], ['MYRRH', 'Thing'], ['SHEPHERD', 'Thing'], ['PARABLE', 'Thing'], ['PROPHET', 'Thing'], ['APOSTLE', 'Thing'],
  ['SABBATH', 'Thing'], ['JUBILEE', 'Thing'], ['TRUMPET', 'Thing'], ['ALTAR', 'Thing'], ['CHARIOT', 'Thing'], ['MANGER', 'Thing'],
  ['RED SEA', 'Place'], ['MOUNT OF OLIVES', 'Place'], ['PROMISED LAND', 'Place'], ['LAST SUPPER', 'Event'], ['BURNING BUSH', 'Thing'],
  ['GOOD SAMARITAN', 'Parable'], ['PRODIGAL SON', 'Parable'], ['TEN COMMANDMENTS', 'Thing'], ['ARK OF THE COVENANT', 'Thing'], ['GARDEN OF EDEN', 'Place']
];

// Two Truths & a Lie: two true statements and one lie about a person, each with where to read it.
export const TWO_TRUTHS = [
  { who: 'Samson', t: [['He killed a young lion with nothing in his hand.', 'Judges 14:6'], ['He was a Nazarite from birth.', 'Judges 13:5']], lie: ['Delilah betrayed him for thirty pieces of silver.', 'Each Philistine lord offered her 1,100 pieces of silver. Judges 16:5'] },
  { who: 'Moses', t: [['He was hidden as a baby in an ark of bulrushes.', 'Exodus 2:3'], ['His brother Aaron spoke to the people for him.', 'Exodus 4:16']], lie: ['He led the people into the promised land.', 'He saw it from Mount Nebo; Joshua led them in. Deuteronomy 34:4'] },
  { who: 'David', t: [['He was the youngest son of Jesse.', '1 Samuel 16:11'], ['He played the harp for King Saul.', '1 Samuel 16:23']], lie: ['He built the temple in Jerusalem.', 'His son Solomon built it. 1 Kings 6:14'] },
  { who: 'Noah', t: [['He had three sons: Shem, Ham and Japheth.', 'Genesis 6:10'], ['He sent a raven and a dove out of the ark.', 'Genesis 8:8']], lie: ['It rained for seven days and nights.', 'It rained forty days and forty nights. Genesis 7:12'] },
  { who: 'Jonah', t: [['He tried to flee to Tarshish.', 'Jonah 1:3'], ['He was in the fish three days and three nights.', 'Jonah 1:17']], lie: ['Nineveh refused to repent.', 'Nineveh turned from its evil way and God spared it. Jonah 3:10'] },
  { who: 'Daniel', t: [['He was taken to Babylon as a young man.', 'Daniel 1:6'], ['He prayed three times a day.', 'Daniel 6:10']], lie: ['He was thrown into the fiery furnace.', 'That was Shadrach, Meshach and Abed-nego. Daniel 3:20'] },
  { who: 'Esther', t: [['She was brought up by her cousin Mordecai.', 'Esther 2:7'], ['She became queen.', 'Esther 2:17']], lie: ['Her husband was King Nebuchadnezzar.', 'She married King Ahasuerus. Esther 2:16'] },
  { who: 'Peter', t: [['He was a fisherman.', 'Matthew 4:18'], ['He walked on the water.', 'Matthew 14:29']], lie: ['He wrote the book of Revelation.', 'John saw the Revelation on Patmos. Revelation 1:9'] },
  { who: 'Paul', t: [['He was also called Saul.', 'Acts 13:9'], ['He was shipwrecked on the island of Melita.', 'Acts 28:1']], lie: ['He was one of the twelve disciples Jesus first chose.', 'He met the risen Jesus later, on the road to Damascus. Acts 9:3'] },
  { who: 'Ruth', t: [['She was a woman of Moab.', 'Ruth 1:4'], ['She gleaned in the field of Boaz.', 'Ruth 2:3']], lie: ['She was the mother of King David.', 'She was his great-grandmother. Ruth 4:17'] },
  { who: 'Elijah', t: [['Ravens brought him bread and flesh.', '1 Kings 17:6'], ['He went up by a whirlwind into heaven.', '2 Kings 2:11']], lie: ['He was swallowed by a great fish.', 'That was Jonah. Jonah 1:17'] },
  { who: 'Joseph', t: [['His brothers sold him for twenty pieces of silver.', 'Genesis 37:28'], ["He interpreted Pharaoh's dreams.", 'Genesis 41:25']], lie: ["He was Jacob's firstborn son.", 'Reuben was the firstborn. Genesis 35:23'] },
  { who: 'Abraham', t: [['He came from Ur of the Chaldees.', 'Genesis 11:31'], ['He was a hundred years old when Isaac was born.', 'Genesis 21:5']], lie: ['Sarah bore him twelve sons.', 'Sarah bore him one son, Isaac. Genesis 21:2'] },
  { who: 'Mary, mother of Jesus', t: [['The angel Gabriel was sent to her.', 'Luke 1:26'], ['She laid Jesus in a manger.', 'Luke 2:7']], lie: ['She lived in Jericho.', 'Gabriel came to her in Nazareth. Luke 1:26'] },
  { who: 'Zacchaeus', t: [['He was the chief among the publicans.', 'Luke 19:2'], ['He was little of stature.', 'Luke 19:3']], lie: ['He climbed an olive tree.', 'He climbed a sycomore tree. Luke 19:4'] },
  { who: 'Gideon', t: [['He asked for a sign with a fleece.', 'Judges 6:37'], ['He fought Midian with three hundred men.', 'Judges 7:7']], lie: ['He agreed to be the first king of Israel.', 'He refused to rule over them; Saul was the first king. Judges 8:23'] },
  { who: 'Solomon', t: [['He asked God for an understanding heart.', '1 Kings 3:9'], ['The queen of Sheba came to see him.', '1 Kings 10:1']], lie: ['He killed Goliath.', 'His father David did. 1 Samuel 17:50'] },
  { who: 'Jacob', t: [['He served seven years for Rachel.', 'Genesis 29:20'], ['God renamed him Israel.', 'Genesis 32:28']], lie: ['He was born before his twin, Esau.', 'Esau came out first. Genesis 25:25'] },
  { who: 'Thomas', t: [['He was one of the twelve.', 'Matthew 10:3'], ['He was also called Didymus.', 'John 20:24']], lie: ['He denied Jesus three times.', 'That was Peter. Luke 22:61'] },
  { who: 'John the Baptist', t: [['He ate locusts and wild honey.', 'Matthew 3:4'], ['His father was Zacharias.', 'Luke 1:13']], lie: ['Jesus baptized him.', 'John baptized Jesus in the Jordan. Matthew 3:13'] },
  { who: 'Lazarus', t: [['His sisters were Mary and Martha.', 'John 11:1'], ['He had lain in the grave four days.', 'John 11:17']], lie: ['He lived in Capernaum.', 'He lived in Bethany. John 11:1'] },
  { who: 'Adam', t: [['He gave names to all the cattle and birds.', 'Genesis 2:20'], ['He was formed of the dust of the ground.', 'Genesis 2:7']], lie: ['He lived a thousand years.', 'He lived nine hundred and thirty years. Genesis 5:5'] },
  { who: 'Methuselah', t: [['He lived nine hundred sixty and nine years.', 'Genesis 5:27'], ['He was the grandfather of Noah.', 'Genesis 5:25']], lie: ['He built the ark.', 'His grandson Noah built it. Genesis 6:14'] },
  { who: 'Hannah', t: [['She prayed for a son at Shiloh.', '1 Samuel 1:9'], ['She lent Samuel to the LORD.', '1 Samuel 1:28']], lie: ['She was the wife of Abraham.', 'She was the wife of Elkanah. 1 Samuel 1:2'] },
  { who: 'Deborah', t: [['She was a prophetess who judged Israel.', 'Judges 4:4'], ['She sat under a palm tree.', 'Judges 4:5']], lie: ['She killed Sisera with a tent nail.', 'Jael did. Judges 4:21'] },
  { who: 'Naaman', t: [['He was captain of the host of Syria.', '2 Kings 5:1'], ['He dipped seven times in the Jordan.', '2 Kings 5:14']], lie: ['Elijah healed him.', 'Elisha sent word for him to wash in the Jordan. 2 Kings 5:10'] },
  { who: 'Nehemiah', t: [["He was the king's cupbearer.", 'Nehemiah 1:11'], ['He led the rebuilding of the wall of Jerusalem.', 'Nehemiah 6:15']], lie: ['He was a captive in Egypt.', 'He served in Shushan the palace, in Persia. Nehemiah 1:1'] },
  { who: 'Joshua', t: [['He was one of the men sent to spy out Canaan.', 'Numbers 13:16'], ['The wall of Jericho fell flat before him.', 'Joshua 6:20']], lie: ['He was the brother of Moses.', "He was Moses' minister; Aaron was his brother. Exodus 24:13"] },
  { who: 'Matthew', t: [['He was a publican.', 'Matthew 10:3'], ['He sat at the receipt of custom when Jesus called him.', 'Matthew 9:9']], lie: ['He was the brother of Andrew.', 'Andrew was the brother of Simon Peter. Matthew 4:18'] },
  { who: 'Stephen', t: [['He was one of seven chosen to serve.', 'Acts 6:5'], ['He saw the heavens opened as he died.', 'Acts 7:56']], lie: ['He was stoned in Rome.', 'They cast him out of the city of Jerusalem. Acts 7:58'] },
  { who: 'Lydia', t: [['She was a seller of purple.', 'Acts 16:14'], ['She came from Thyatira.', 'Acts 16:14']], lie: ['Peter raised her from the dead.', 'That was Tabitha; Lydia was baptized and hosted Paul. Acts 16:15'] },
  { who: 'Elisha', t: [["He asked for a double portion of Elijah's spirit.", '2 Kings 2:9'], ['He made an iron axe head swim.', '2 Kings 6:6']], lie: ['He went up to heaven in a chariot of fire.', 'Elijah did, while Elisha watched. 2 Kings 2:11'] },
  { who: 'Rahab', t: [['She lived in Jericho.', 'Joshua 2:1'], ['She hid two spies on her roof.', 'Joshua 2:6']], lie: ['She hung a white cloth from her window.', 'She bound a line of scarlet thread in the window. Joshua 2:21'] },
  { who: 'King Saul', t: [['He was of the tribe of Benjamin.', '1 Samuel 9:21'], ['He was taller than any of the people.', '1 Samuel 9:2']], lie: ['Nathan anointed him king.', 'Samuel anointed him. 1 Samuel 10:1'] },
  { who: 'Nicodemus', t: [['He came to Jesus by night.', 'John 3:2'], ['He was a Pharisee.', 'John 3:1']], lie: ['He was a fisherman from Galilee.', 'He was a ruler of the Jews. John 3:1'] },
  { who: 'Martha', t: [['She was the sister of Lazarus.', 'John 11:1'], ['She was cumbered about much serving.', 'Luke 10:40']], lie: ["She anointed Jesus' feet with ointment.", 'Her sister Mary did. John 12:3'] },
  { who: 'Barnabas', t: [['He was sent out with Saul.', 'Acts 13:2'], ['He was from Cyprus.', 'Acts 4:36']], lie: ['He wrote the letter to the Romans.', 'Paul wrote it. Romans 1:1'] },
  { who: 'Timothy', t: [['His mother was Eunice.', '2 Timothy 1:5'], ['His grandmother was Lois.', '2 Timothy 1:5']], lie: ['He was one of the twelve apostles.', 'He was Paul’s son in the faith, called later. 1 Timothy 1:2'] },
  { who: 'Job', t: [['He lived in the land of Uz.', 'Job 1:1'], ['He had seven sons and three daughters.', 'Job 1:2']], lie: ['He cursed God when he lost everything.', 'In all this Job sinned not. Job 1:22'] },
  { who: 'Cain', t: [['He was a tiller of the ground.', 'Genesis 4:2'], ['He was the firstborn of Adam and Eve.', 'Genesis 4:1']], lie: ['He was killed by his brother Abel.', 'Cain killed Abel. Genesis 4:8'] }
];

// Bible Timeline: events in Bible order (the list order IS the answer).
export const TIMELINE = [
  ['Creation', 'Genesis 1'], ['Adam and Eve leave Eden', 'Genesis 3'], ['Cain kills Abel', 'Genesis 4'], ["Noah's flood", 'Genesis 7'],
  ['The tower of Babel', 'Genesis 11'], ['God calls Abram', 'Genesis 12'], ['Sodom is destroyed', 'Genesis 19'], ['Isaac is born', 'Genesis 21'],
  ['Abraham offers Isaac', 'Genesis 22'], ["Jacob's ladder dream", 'Genesis 28'], ['Joseph is sold into Egypt', 'Genesis 37'], ['Joseph rules in Egypt', 'Genesis 41'],
  ['Moses is born', 'Exodus 2'], ['The burning bush', 'Exodus 3'], ['The plagues on Egypt', 'Exodus 7–11'], ['The first Passover', 'Exodus 12'],
  ['Crossing the Red Sea', 'Exodus 14'], ['The Ten Commandments', 'Exodus 20'], ['The golden calf', 'Exodus 32'], ['The twelve spies', 'Numbers 13'],
  ['Moses dies on Mount Nebo', 'Deuteronomy 34'], ['The walls of Jericho fall', 'Joshua 6'], ['Deborah judges Israel', 'Judges 4'], ["Gideon's three hundred", 'Judges 7'],
  ['Samson brings down the house', 'Judges 16'], ['Samuel is born', '1 Samuel 1'], ['Saul becomes king', '1 Samuel 10'], ['David defeats Goliath', '1 Samuel 17'],
  ['David is made king over Israel', '2 Samuel 5'], ['Solomon builds the temple', '1 Kings 6'], ['The kingdom divides', '1 Kings 12'], ['Elijah on Mount Carmel', '1 Kings 18'],
  ['Elijah is taken up to heaven', '2 Kings 2'], ['Israel is carried away to Assyria', '2 Kings 17'], ['Josiah finds the book of the law', '2 Kings 22'], ['Jerusalem falls to Babylon', '2 Kings 25'],
  ['The exiles return to build the temple', 'Ezra 1'], ['Esther becomes queen', 'Esther 2'], ['Nehemiah rebuilds the wall', 'Nehemiah 6'],
  ['John the Baptist is born', 'Luke 1'], ['Jesus is born in Bethlehem', 'Luke 2'], ['The wise men visit', 'Matthew 2'], ['The boy Jesus in the temple', 'Luke 2'],
  ['Jesus is baptized', 'Matthew 3'], ['Jesus is tempted in the wilderness', 'Matthew 4'], ['Water into wine at Cana', 'John 2'], ['Feeding the five thousand', 'Matthew 14'],
  ['Lazarus is raised', 'John 11'], ['Jesus rides into Jerusalem', 'Matthew 21'], ['The Last Supper', 'Matthew 26'], ['The crucifixion', 'Matthew 27'],
  ['The resurrection', 'Matthew 28'], ['The ascension', 'Acts 1'], ['Pentecost', 'Acts 2'], ['Stephen is stoned', 'Acts 7'],
  ['Saul meets Jesus on the Damascus road', 'Acts 9'], ['Paul and Silas in prison at Philippi', 'Acts 16'], ['Paul is shipwrecked', 'Acts 27'], ["John's vision on Patmos", 'Revelation 1']
];
