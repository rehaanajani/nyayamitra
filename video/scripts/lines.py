# The film's script. Timbre voices: Lakshmi narrates and is Sahay; Prakash is the judge.
# Hindi court and Sahay lines are the app's real replies from scripts/capture-log.json.
L, J, C, A, O = 'Lakshmi', 'Prakash', 'Chetana', 'Shubham', 'Devansh'
LINES = [
 # id, scene, voice, lang, spoken text, caption (English), gap after (s)
 ('adv','cold',A,'en-IN','My Lord, under Section 420 of the IPC, the accused is clearly guilty of cheating my client.','"My Lord, under Section 420 of the IPC, the accused is clearly guilty of cheating my client."',0.1),
 ('jud','cold',J,'hi-IN','रुकिए counsel। IPC 420? वो अब लागू नहीं है। एक जुलाई दो हज़ार चौबीस से cheating के लिए BNS 318 है। सही धारा से दोबारा बोलिए।','"Stop, counsel. IPC 420? That no longer applies. Since 1 July 2024, cheating is BNS 318. Say it again with the right section."',0.35),
 ('hook','hook',L,'en-IN','That judge is an AI. And it just cut off counsel for citing a law India replaced in 2024.','That judge is an AI. And it just cut off counsel for citing a law India replaced in 2024.',0.45),
 ('p1','problem',L,'en-IN','India has five point six four crore court cases pending.','India has 5.64 crore court cases pending.',0.25),
 ('p2','problem',L,'en-IN','More than eighty percent of Indians qualify for free legal aid. By 2019, only about one and a half crore had ever used it.','More than 80% of Indians qualify for free legal aid. By 2019, only about 1.5 crore had ever used it.',0.3),
 ('p3','citizen',L,'en-IN','Because when your boss stops paying you, you do not think in sections and forms. You just want someone to tell you what to do next.','Because when your boss stops paying you, you do not think in sections and forms. You just want someone to tell you what to do next.',0.3),
 ('p4','lawyer',L,'en-IN','And the young lawyer who takes that case? India\'s criminal laws changed in July 2024. New names, new numbers. And when they rehearse at midnight, nobody pushes back.','And the young lawyer who takes that case? India\'s criminal laws changed in July 2024. New names, new numbers. And when they rehearse at midnight, nobody pushes back.',0.45),
 ('s1','intro',L,'en-IN','So we built Nyaya Mitra. A friend in court, whichever side of it you\'re on.','So we built न्यायमित्र. A friend in court, whichever side of it you\'re on.',0.35),
 ('s2','sahay',L,'en-IN','Door number one, Sahay. You just talk, the way you would to a friend.','Door one: सहाय. You just talk, the way you would to a friend.',0.2),
 ('cit','sahay',C,'hi-IN','मेरे boss ने तीन महीने से salary नहीं दी।','"My boss hasn\'t paid my salary for three months."',0.15),
 ('sah','sahay',L,'hi-IN','नौकरी कहाँ थी: किसी company में, दुकान पर, contractor के पास या किसी व्यक्ति के यहाँ?','"Where was the job: a company, a shop, a contractor, or with a person?"',0.3),
 ('s3','path',L,'en-IN','She asks one thing at a time. Then she puts your path on screen: where to go, what to carry, your deadline, and a notice she drafts for you.','She asks one thing at a time. Then she puts your path on screen: where to go, what to carry, your deadline, and a notice she drafts for you.',0.2),
 ('s4','path',L,'en-IN','The steps come from a checked legal knowledge base, not the model\'s imagination. And a free lawyer is one call away, on one five one zero zero.','The steps come from a checked legal knowledge base, not the model\'s imagination. And a free lawyer is one call away, on 15100.',0.4),
 ('s5','abhyas',L,'en-IN','Door number two, Abhyas. A full hearing, in five rounds. You argue, opposing counsel hits back, and the bench scores you both.','Door two: अभ्यास. A full hearing, in five rounds. You argue, opposing counsel hits back, and the bench scores you both.',0.2),
 ('opp','abhyas',O,'hi-IN','My Lord, केवल कुछ UPI पेमेंट दिखा देने से Section 318, BNS का अपराध खत्म नहीं हो जाता।','"My Lord, showing a few UPI payments does not erase the offence under Section 318 BNS."',0.3),
 ('s6','abhyas2',L,'en-IN','In this hearing, our test lawyer argued against their own client by mistake. The bench noticed.','In this hearing, our test lawyer argued against their own client by mistake. The bench noticed.',0.15),
 ('jud2','abhyas2',J,'hi-IN','Counsel, आप अपने ही मुवक्किल के खिलाफ dishonest intention की बात कहकर उनका केस कमजोर कर रहे हैं।','"Counsel, by alleging dishonest intention against your own client, you are weakening their case."',0.3),
 ('s6b','verdict',L,'en-IN','Then it writes the verdict, and the one line you should have said.','Then it writes the verdict, and the one line you should have said.',0.35),
 ('s7','tech',L,'en-IN','Under the hood, it runs on Gyaani. Prizma listens, even when Hindi and English mix. Timbre speaks, in ten Indian languages. Evon reasons, and if a route goes down, Gemini takes over in seconds, so the conversation never stops.','Under the hood, it runs on Gnani. Prisma listens, even when Hindi and English mix. Timbre speaks, in ten Indian languages. Evon reasons, and if a route goes down, Gemini takes over in seconds, so the conversation never stops.',0.25),
 ('s8','tech',L,'en-IN','Every voice in this film is Timbre.','Every voice in this film is Timbre.',0.45),
 ('c1','close',L,'hi-IN','न्याय सबका है।','"Justice belongs to everyone."',0.2),
 ('c2','close',L,'en-IN','Justice should speak your language. Try Nyaya Mitra. The link is in the post.','Justice should speak your language. Try न्यायमित्र. The link is in the post.',2.6),
]

# The 60-second LinkedIn cut. Ids that also appear above reuse the same recording.
SHORT = [
 ('adv6','cold',A,'en-IN','My Lord, under Section 420 of the IPC,','"My Lord, under Section 420 of the IPC,"',0.0),
 ('jud6','cold',J,'hi-IN','रुकिए counsel। IPC 420? वो अब लागू नहीं है। Cheating के लिए BNS 318 है।','"Stop, counsel. IPC 420? That no longer applies. Cheating is BNS 318."',0.25),
 ('h6','hook',L,'en-IN','That judge is an AI. And it just caught a law India replaced in 2024.','That judge is an AI. And it just caught a law India replaced in 2024.',0.3),
 ('p6','problem',L,'en-IN','India has five point six four crore court cases pending. And when your boss stops paying you, you just want to know what\'s next.','India has 5.64 crore court cases pending. And when your boss stops paying you, you just want to know what\'s next.',0.3),
 ('s16','intro',L,'en-IN','So we built Nyaya Mitra. A friend in court.','So we built न्यायमित्र. A friend in court.',0.25),
 ('s26','sahay',L,'en-IN','Door number one, Sahay. You just talk.','Door one: सहाय. You just talk.',0.1),
 ('cit','sahay',C,'hi-IN','मेरे boss ने तीन महीने से salary नहीं दी।','"My boss hasn\'t paid my salary for three months."',0.15),
 ('s36','path',L,'en-IN','She asks one thing at a time, then gives you the path: where to go, what to carry, your deadline.','She asks one thing at a time, then gives you the path: where to go, what to carry, your deadline.',0.25),
 ('s56','abhyas',L,'en-IN','Door number two, Abhyas. You argue, the other side hits back, the bench scores you.','Door two: अभ्यास. You argue, the other side hits back, the bench scores you.',0.2),
 ('s66','abhyas2',L,'en-IN','Argue against your own client? The bench notices.','Argue against your own client? The bench notices.',0.1),
 ('jud2','abhyas2',J,'hi-IN','Counsel, आप अपने ही मुवक्किल के खिलाफ dishonest intention की बात कहकर उनका केस कमजोर कर रहे हैं।','"Counsel, by alleging dishonest intention against your own client, you are weakening their case."',0.25),
 ('t6','tech',L,'en-IN','Every voice you just heard is Gyaani Timbre.','Every voice you just heard is Gnani Timbre.',0.25),
 ('c26','close',L,'en-IN','Justice should speak your language. The link is in the post.','Justice should speak your language. The link is in the post.',1.6),
]
