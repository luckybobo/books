const fs = require('fs');
const path = require('path');

// 创建目录结构
const dirs = [
  'database',
  'database/chapters',
  'database/chapters/book_001',
  'database/chapters/book_002',
  'images',
  'images/authors',
  'public'
];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ 创建目录: ${dir}`);
  }
});

// 创建 novels.json
const novelsData = {
  "books": [
    {
      "id": "book_001",
      "title": "细雨中的城",
      "author": "林清玄",
      "authorId": "author_001",
      "cover": null,
      "summary": "一座永远下着细雨的城市，两个灵魂的相遇与错过。",
      "chapters": [
        {
          "id": "ch_001_01",
          "number": 1,
          "title": "第一章 初遇",
          "file": "chapter_01.txt"
        },
        {
          "id": "ch_001_02",
          "number": 2,
          "title": "第二章 老街",
          "file": "chapter_02.txt"
        },
        {
          "id": "ch_001_03",
          "number": 3,
          "title": "第三章 河畔",
          "file": "chapter_03.txt"
        }
      ]
    },
    {
      "id": "book_002",
      "title": "星海彼岸",
      "author": "陈之砚",
      "authorId": "author_002",
      "cover": null,
      "summary": "在浩瀚星海中寻找新家园的科幻史诗",
      "chapters": [
        {
          "id": "ch_002_01",
          "number": 1,
          "title": "序章 启程",
          "file": "chapter_01.txt"
        },
        {
          "id": "ch_002_02",
          "number": 2,
          "title": "第二章 异星降临",
          "file": "chapter_02.txt"
        }
      ]
    }
  ],
  "authors": [
    {
      "id": "author_001",
      "name": "林清玄",
      "photo": null,
      "bio": "当代著名散文家、诗人。1953年出生于台湾高雄，毕业于世界新闻专科学校。其文笔清丽，情感细腻，擅长在日常生活的细节中发现诗意与哲理。作品多次入选两岸三地的语文教材，影响深远。代表作品有《心的菩提》《如意菩提》《在这坚硬的世界里，修得一颗柔软心》等。",
      "works": ["心的菩提", "如意菩提", "凤眼菩提", "星月菩提", "在这坚硬的世界里"],
      "birthYear": 1953,
      "readers": 1250000
    },
    {
      "id": "author_002",
      "name": "陈之砚",
      "photo": null,
      "bio": "新生代科幻作家，1988年生于北京。清华大学物理系毕业，后转入文学创作。其作品将硬核科学与人文思考完美结合，被誉为中国科幻文学的新希望。曾获银河奖、星云奖等多项科幻文学大奖。",
      "works": ["星海彼岸", "量子迷雾", "时间褶皱", "深空回响"],
      "birthYear": 1988,
      "readers": 890000
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, 'database', 'novels.json'),
  JSON.stringify(novelsData, null, 2),
  'utf8'
);
console.log('✅ 创建 novels.json');

// 创建章节文本文件
const chapters = {
  'book_001': {
    'chapter_01.txt': `细雨绵绵，落在青石板上。

她撑着油纸伞，从巷口缓缓走来。空气里弥漫着桂花的香气，整座城市仿佛安静下来。

"又见到你了。"他心里默念。

这是他们的第七次偶遇，在这座永远下着雨的城市里。每次相遇都像是命运精心安排的巧合，却又转瞬即逝。

她走近了，雨滴在伞面上跳跃，发出细碎的声响。他的心跳随着那节奏加快。

"你好。"她微笑着说，声音轻柔得像三月的风。

"你好。"他回应，却发现自己的声音有些干涩。

就这样，又一场雨中的相遇，开始了他们之间的故事。`,

    'chapter_02.txt': `老街的石板路被雨水冲刷得发亮。

两旁的小店陆续亮起灯火，温暖而朦胧。他们的目光在咖啡馆的玻璃窗上短暂交汇。

"要进来坐坐吗？"她指着街角的咖啡馆。

他点点头。咖啡馆里飘着咖啡和旧书的味道，墙上挂着这座古城的老照片。他们选了靠窗的位置坐下。

"我常来这里。"她说，"下雨的时候，坐在这里看街上的人来人往，感觉很特别。"

窗外，雨丝斜织，街灯的光晕在雨幕中扩散。他们聊了很久，关于这座城，关于各自的生活。时间在雨声中悄悄流逝。`,

    'chapter_03.txt': `夜色渐深，他们坐在河边的长椅上。

水波映着月光，话语像细流般流淌。雨终于停了，空气中残留着湿润的清新。

"这座城总在下雨，"她说，"但和你在一起的时刻，却感觉很晴朗。"

他转头看着她，月光在她的侧脸上勾勒出柔和的轮廓。他忽然明白，有些相遇，注定会改变一个人的轨迹。

河面上，一只小船缓缓划过，船头的灯笼在水面上投下摇曳的光影。远处传来悠扬的笛声，仿佛在为这个夜晚伴奏。

"明天还会下雨吗？"她问。

"会吧。"他说，"但我们可以一起撑伞。"`
  },
  'book_002': {
    'chapter_01.txt': `宇宙飞船"远望号"缓缓驶离港口。

他望向窗外的蓝色星球，心中百感交集。这颗孕育了人类文明的星球，如今正在逐渐变得陌生。资源的枯竭、气候的剧变，让人类不得不将目光投向星海深处。

"全体船员注意，我们已进入预定轨道，即将开始曲速航行。"舰长的声音在广播中响起。

他闭上眼睛，感受着飞船轻微的震动。未知的星海，藏着人类的未来，也藏着他个人的命运。

窗外，地球在视野中渐渐缩小，最终成为浩瀚宇宙中的一个蓝点。前方，是无尽的星辰大海。`,

    'chapter_02.txt': `经过三个月的航行，"远望号"终于抵达了目标星系。

眼前的星球被红色的土壤覆盖，双月悬于夜空，散发着柔和的光芒。探测器显示这里有生命迹象，整个团队紧张而兴奋。

"准备登陆。"舰长下令。

登陆舱脱离母舰，向着这颗红色星球缓缓降落。透过舷窗，他看到了前所未见的地貌——巨大的水晶山脉，流淌着荧光液体的河流。

"这简直像梦境。"身旁的生物学家喃喃道。

但谁也不知道，这片美丽的异星土地上，究竟隐藏着什么秘密。`
  }
};

for (const [bookId, bookChapters] of Object.entries(chapters)) {
  for (const [fileName, content] of Object.entries(bookChapters)) {
    const filePath = path.join(__dirname, 'database', 'chapters', bookId, fileName);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 创建章节文件: ${filePath}`);
  }
}

console.log('\n🎉 数据库初始化完成！');
console.log('📚 现在可以运行: npm start');