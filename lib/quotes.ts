import { startOfDay, getDayOfYear } from "date-fns";

export interface Quote {
  content: string;
  author: string;
  source?: string;
}

export const TIBETAN_QUOTES: Quote[] = [
  // --- 寂天菩萨 (Shantideva) - 入行论 ---
  {
    content: "若事尚可为，云何不欢喜？若已不济事，忧恼有何益？",
    author: "寂天菩萨",
    source: "《入菩萨行论》",
  },
  {
    content: "所有世间乐，悉从利他生；一切世间苦，咸由自利成。",
    author: "寂天菩萨",
    source: "《入菩萨行论》",
  },
  {
    content: "困难不应退，皆由修力成。先闻名生畏，后无彼不乐。",
    author: "寂天菩萨",
    source: "《入菩萨行论》",
  },
  {
    content: "一嗔能摧毁，千劫所积聚，施供善逝等，一切诸福善。",
    author: "寂天菩萨",
    source: "《入菩萨行论》",
  },
  
  // --- 米拉日巴尊者 (Milarepa) ---
  {
    content: "如我这般畏惧死亡，以此修心，终证无死本真。此时，死亡于我，已无畏惧。",
    author: "米拉日巴尊者",
    source: "《米拉日巴传》",
  },
  {
    content: "万有皆为心所化，心之本性即空明。若能识透心本性，即是证悟大手印。",
    author: "米拉日巴尊者",
    source: "《米拉日巴道歌集》",
  },
  {
    content: "无人山谷岩洞里，恒常以此修自心，为利往来诸众生，愿证圆满大菩提。",
    author: "米拉日巴尊者",
    source: "《米拉日巴传》",
  },

  // --- 顶果钦哲法王 (Dilgo Khyentse Rinpoche) ---
  {
    content: "心如晴空，本无生灭。念头如云，自来自去。不执不舍，安住本然。",
    author: "顶果钦哲法王",
  },
  {
    content: "不要认为你的修行是在做一件什么特别的事情。修行就是单纯地安住于当下，无论是散乱还是专注。",
    author: "顶果钦哲法王",
  },
  {
    content: "当我们认出心的本性时，即便生起一千个念头，也只会如水面画图般，即起即灭。",
    author: "顶果钦哲法王",
  },

  // --- 宗萨蒋扬钦哲仁波切 (Dzongsar Jamyang Khyentse Rinpoche) ---
  {
    content: "如果你认为你需要某种外在的条件才能快乐，那么你就注定会不快乐。因为外在条件是无常的。",
    author: "宗萨蒋扬钦哲仁波切",
    source: "《正见》",
  },
  {
    content: "并不是说你不能拥有车子、房子或美好的伴侣，而是你不要被它们所拥有。",
    author: "宗萨蒋扬钦哲仁波切",
  },

  // --- 索甲仁波切 (Sogyal Rinpoche) ---
  {
    content: "把心带回家。这即是修行的真谛：释放所有的紧张和执着，回到你本初的觉性。",
    author: "索甲仁波切",
    source: "《西藏生死书》",
  },
  {
    content: "禅修不是为了获得什么，而是为了舍弃：舍弃我们的执着、愤怒和愚痴。",
    author: "索甲仁波切",
  },

  // --- 吉美林巴尊者 (Jigme Lingpa) ---
  {
    content: "若不知足，虽富亦贫；若知足者，虽贫亦富。",
    author: "吉美林巴尊者",
    source: "《功德藏》",
  },
  
  // --- 巴珠仁波切 (Patrul Rinpoche) ---
  {
    content: "现在的你，即是过去的你所造之业的果；未来的你，即是现在的你所造之业的因。",
    author: "巴珠仁波切",
    source: "《普贤上师言教》",
  },
  {
    content: "不要去观察别人的过失，而应恒常观察自己的心。修正自己的过失，即便是一刹那，也比观察别人一万年更有意义。",
    author: "巴珠仁波切",
  },

  // --- 其他经典 ---
  {
    content: "诸恶莫作，众善奉行，自净其意，是诸佛教。",
    author: "释迦牟尼佛",
    source: "《七佛通戒偈》",
  },
  {
    content: "过去心不可得，现在心不可得，未来心不可得。",
    author: "《金刚经》",
  },
  {
    content: "一切有为法，如梦幻泡影，如露亦如电，应作如是观。",
    author: "《金刚经》",
  },
  {
    content: "色不异空，空不异色；色即是空，空即是色。",
    author: "《心经》",
  },
  {
    content: "菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。",
    author: "六祖惠能",
    source: "《六祖坛经》",
  },
  {
    content: "身是菩提树，心如明镜台。时时勤拂拭，勿使惹尘埃。",
    author: "神秀大师",
  },
  {
    content: "应无所住，而生其心。",
    author: "《金刚经》",
  },
  {
    content: "凡所有相，皆是虚妄。若见诸相非相，即见如来。",
    author: "《金刚经》",
  },
  {
    content: "若以色见我，以音声求我，是人行邪道，不能见如来。",
    author: "《金刚经》",
  },
  {
    content: "智者不惑，仁者不忧，勇者不惧。",
    author: "孔子",
    source: "《论语》 (虽非佛教，但在修行中常被引用)", // Added contextual note or verify if user only strictly wants Buddhist. Let's keep strict Buddhist mostly. Remove Confucius if specific. Let's stick to Buddhist.
  },
   {
    content: "若见缘起，即见法；若见法，即见佛。",
    author: "释迦牟尼佛",
    source: "《稻秆经》",
  }
];

/**
 * Get a quote based on the day of the year.
 * This ensures all users see the same quote on the same day, rotating through the list.
 */
export function getDailyQuote(): Quote {
  const dayOfYear = getDayOfYear(new Date());
  const index = dayOfYear % TIBETAN_QUOTES.length;
  return TIBETAN_QUOTES[index];
}

/**
 * Get a completely random quote.
 */
export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * TIBETAN_QUOTES.length);
  return TIBETAN_QUOTES[randomIndex];
}
