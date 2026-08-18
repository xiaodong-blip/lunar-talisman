import { useEffect } from 'react'

const PHRASES: Record<string, string> = {
  'Lunar Talisman 后台管理。': 'Lunar Talisman administration.',
  'Lunar Talisman 后台': 'Lunar Talisman Admin',
  'Lunar Talisman · 月之护符': 'Lunar Talisman',
  '高端七脉轮水晶饰品品牌站': 'A crystal talisman house guided by the seven chakras',
  '月之护符': 'Lunar Talisman',
  '七脉轮水晶宇宙': 'The Seven Chakra Crystal Universe',
  '脉轮疗愈、月相仪式与水晶护符交织成一条旅程；每一件水晶都对应你此刻最需要的频率。':
    'Chakra healing, lunar rituals, and crystal talismans form one journey—each piece meets the energy you need now.',
  '向下滚动进入七脉轮水晶宇宙': 'Scroll down into the seven chakra crystal universe',
  '跳转到第 1 段体验': 'Jump to experience one',
  '跳转到第 2 段体验': 'Jump to experience two',
  '跳转到第 3 段体验': 'Jump to experience three',
  '跳转到第 4 段体验': 'Jump to experience four',
  '购物车，共 0 件商品': 'Cart, 0 items',
  '购物车': 'Cart',
  '购物车与物流信息': 'Cart & Delivery',
  '继续选购': 'Continue shopping',
  '你的护符尚未被召唤': 'Your talisman is waiting to be discovered',
  '先去系列里挑选一件，再回来填写物流和留言。':
    'Choose a piece from a collection, then return to arrange delivery and leave a note.',
  '姓名': 'Name',
  '邮箱': 'Email',
  '电话': 'Phone',
  '收货地址': 'Delivery address',
  '可选': 'Optional',
  '减少数量': 'Decrease quantity',
  '增加数量': 'Increase quantity',
  '删除商品': 'Remove item',
  '关闭购物车': 'Close cart',
  '购物车抽屉': 'Cart drawer',
  '水晶旅程': 'Crystal Journey',
  '脉轮疗愈': 'Chakra Healing',
  '月相仪式': 'Lunar Rituals',
  '水晶护符': 'Crystal Talismans',
  '月之典籍': 'Moon Codex',
  '开始连接': 'Begin the Connection',
  '海底轮\nRoot Chakra': 'Root Chakra',
  '脐轮\nSacral Chakra': 'Sacral Chakra',
  '太阳轮\nSolar Plexus': 'Solar Plexus',
  '心轮\nHeart Chakra': 'Heart Chakra',
  '喉轮\nThroat Chakra': 'Throat Chakra',
  '眉心轮\nThird Eye': 'Third Eye',
  '顶轮\nCrown Chakra': 'Crown Chakra',
  '从身体底部重新扎根，把安全感、稳定感与边界感带回日常佩戴。':
    'Ground into safety, steadiness, and clear boundaries for everyday wear.',
  '七脉轮完整疗愈路径，每一件水晶都对应一个能量中心。':
    'A complete seven-chakra path, with each crystal aligned to an energy centre.',
  '从新月到满月，每件水晶都由特定月相时刻加持。':
    'From new moon to full moon, each piece is attuned to a distinct lunar moment.',
  '浏览所有水晶产品，进入每件护符自己的能量单页。':
    'Browse every crystal talisman and enter its individual ritual page.',
  '从脉轮、月相与水晶护符入口进入，找到与你当前频率共振的护符。':
    'Enter through chakras, lunar phases, or crystal talismans to find your current resonance.',
  '在新月写下意图，在满月净化水晶，让佩戴成为一段可重复的能量节奏。':
    'Set intentions at the new moon, cleanse at the full moon, and make wear a repeatable ritual.',
  '从测试、典籍与水晶入口开始，找到此刻最适合你的护符路径。':
    'Begin with the quiz, the codex, or crystals and find the talisman path for this moment.',
  '以月光为引，将七脉轮能量注入每一颗水晶。选择你的护符，开启内在的能量之旅。':
    'Guided by moonlight, each crystal carries seven-chakra energy. Choose your talisman and begin within.',
  '查看购物车、填写物流、留下留言并提交订单。':
    'Review your cart, choose a delivery region, leave a note, and place your order request.',
  '请补全姓名、邮箱和收货地址。': 'Please complete your name, email, and delivery address.',
  '购物车为空，请先加入商品。': 'Your cart is empty. Add a talisman before continuing.',
  '订单提交失败，请检查网络后重试。购物车和填写内容已保留。':
    'We could not submit your order. Your cart and details have been kept—please try again.',
  '订单已进入后台，后续可在后台查看物流与留言。':
    'Your order request has been received. Delivery updates will follow after fulfilment.',
  '已加入购物车。可以继续浏览，也可以前往结账填写物流和留言。':
    'Added to cart. Continue exploring or move to checkout to select delivery and add a note.',
  '商品小计': 'Items subtotal',
  '物流费用': 'Shipping',
  '合计': 'Total',
  '结账信息': 'Checkout details',
  '提交订单中...': 'Submitting order…',
  '提交订单': 'Submit order request',
  '收货人姓名': 'Recipient name',
  '用于订单通知': 'For order updates',
  '详细地址': 'Full delivery address',
  '物流方式': 'Shipping method',
  '标准物流': 'Standard shipping',
  '加急物流': 'Express shipping',
  '订单留言': 'Order note',
  '例如：请尽量避光包装 / 送礼备注 / 其他要求':
    'e.g. gift wrapping, low-light packaging, or other delivery notes',
  '请选择配送区域。': 'Please select a delivery region.',
  '配送区域': 'Delivery region',
  '覆盖美洲、欧洲与东南亚。': 'Available across the Americas, Europe, and Southeast Asia.',
  '返回首页': 'Return home',
  '页面未找到': 'Page not found',
  '这条能量线路暂时没有页面，返回入口继续探索。':
    'This path is not available yet. Return to the portal and keep exploring.',
  '管理流量、营收、订单与商品上传。':
    'Manage traffic, revenue, orders, fulfilment, and product publishing.',
  '管理账号': 'Admin account',
  密码: 'Password',
  '请输入管理密码': 'Enter admin password',
  '正在验证...': 'Verifying…',
  '进入后台': 'Enter admin',
  '账号或密码不正确，请使用品牌名与管理密码登录。':
    'Incorrect account or password. Please use the brand account and admin password.',
  '账号或密码不正确，请稍后重试。':
    'Incorrect account or password. Please try again shortly.',
  '近 7 日流量': 'Traffic · last 7 days',
  '访问、转化率与峰值日表现。': 'Visits, conversion rate, and peak-day performance.',
  '访问量与转化率四象限曲线图': 'Visits and conversion-rate quadrant chart',
  '高转化': 'High conversion',
  '高访问': 'High traffic',
  '平均线': 'Average',
  '营收结构': 'Revenue mix',
  '按系列查看 GMV 贡献。': 'GMV contribution by collection.',
  '订单管理': 'Order management',
  '搜索订单、查看金额，并更新履约状态。':
    'Search orders, review totals, and update fulfilment status.',
  '下载订单': 'Download orders',
  '搜索订单': 'Search orders',
  '订单号': 'Order ID',
  '客户邮箱': 'Customer email',
  '客户电话': 'Customer phone',
  '客户地址': 'Customer address',
  '商品明细': 'Line items',
  '订单状态': 'Order status',
  '物流状态': 'Shipping status',
  '物流单号': 'Tracking number',
  '物流公司': 'Shipping carrier',
  '含订单留言': 'Contains order note',
  '地址：': 'Address:',
  '留言：': 'Note:',
  '物流：': 'Shipping:',
  '无': 'None',
  '上传商品': 'Upload product',
  '录入基础信息、价格、库存和商品图。':
    'Add the core details, price, stock, and product image.',
  '商品名称': 'Product name',
  '例如：顶轮白水晶护符': 'e.g. Crown Clear Quartz Talisman',
  '系列': 'Collection',
  '状态': 'Status',
  '价格 USD': 'Price (USD)',
  '库存': 'Stock',
  '商品图片': 'Product image',
  '商品预览': 'Product preview',
  '点击上传图片': 'Click to upload an image',
  '保存中...': 'Saving…',
  '保存商品': 'Save product',
  '商品列表': 'Product list',
  '上架商品会同步到前台水晶护符入口。':
    'Published products are synchronised to the storefront crystal entry.',
  '前台商品页': 'Storefront product page',
  '查看前台': 'View storefront',
  '退出登录': 'Sign out',
  '经营控制台': 'Operations console',
  '返回网站': 'Return to site',
  '今日访问': 'Visits today',
  '本周营收': 'Revenue this week',
  '待跟进订单': 'Orders to follow up',
  '商品数量': 'Product count',
  '支持上传新增': 'New uploads supported',
  '当前后台已接入服务端订单与商品存储；支付、物流与邮件接口可在下一阶段继续接入。':
    'This admin is connected to server-side order and product storage. Payments, carriers, and email can be connected next.',
  '请先填写商品名称。': 'Please enter a product name first.',
  '商品已保存到数据库，并已同步到前台商品入口。':
    'Product saved to the database and synchronised to the storefront.',
  '商品已保存到当前浏览器；数据库同步失败，请检查后台环境变量或稍后重试。':
    'Product saved locally, but database sync failed. Check the backend environment and try again.',
  '待处理': 'Pending',
  '已付款': 'Paid',
  '备货中': 'Preparing',
  '已发货': 'Shipped',
  '运输中': 'In transit',
  '已签收': 'Delivered',
  '已完成': 'Completed',
  '待发货': 'Ready to ship',
  '上架': 'Published',
  '草稿': 'Draft',
  '官网购物车': 'Website cart',
  '官网': 'Website',
  '脉轮疗愈系列': 'Chakra Healing Collection',
  '月相仪式系列': 'Lunar Ritual Collection',
  '全部水晶护符': 'All Crystal Talismans',
  '项目入口': 'Project Portals',
  '海底轮系列': 'Root Chakra Collection',
  '脐轮系列': 'Sacral Chakra Collection',
  '太阳轮系列': 'Solar Plexus Collection',
  '心轮系列': 'Heart Chakra Collection',
  '喉轮系列': 'Throat Chakra Collection',
  '眉心轮系列': 'Third Eye Collection',
  '顶轮系列': 'Crown Chakra Collection',
  '海底轮': 'Root Chakra',
  '脐轮': 'Sacral Chakra',
  '太阳轮': 'Solar Plexus',
  '心轮': 'Heart Chakra',
  '喉轮': 'Throat Chakra',
  '眉心轮': 'Third Eye',
  '顶轮': 'Crown Chakra',
  '紫水晶': 'Amethyst',
  '玫瑰晶': 'Rose Quartz',
  '黄水晶': 'Citrine',
  '月光石': 'Moonstone',
  '红石榴石': 'Garnet',
  '白水晶': 'Clear Quartz',
  '海蓝宝': 'Aquamarine',
  '天河石': 'Amazonite',
  '红玉髓': 'Carnelian',
  '青金石': 'Lapis Lazuli',
  '粉晶': 'Rose Quartz',
  '白羊座': 'Aries',
  '金牛座': 'Taurus',
  '双子座': 'Gemini',
  '巨蟹座': 'Cancer',
  '狮子座': 'Leo',
  '处女座': 'Virgo',
  '天秤座': 'Libra',
  '天蝎座': 'Scorpio',
  '射手座': 'Sagittarius',
  '摩羯座': 'Capricorn',
  '水瓶座': 'Aquarius',
  '双鱼座': 'Pisces',
  '天蝎守护 · 紫水晶手链': 'Scorpio Guardian · Amethyst Bracelet',
  '心轮疗愈 · 玫瑰晶手链': 'Heart Healing · Rose Quartz Bracelet',
  '太阳轮 · 黄水晶勇气手链': 'Solar Plexus · Citrine Courage Bracelet',
  '新月仪式 · 净化套装': 'New Moon Ritual · Cleansing Set',
  '海底轮 · 红石榴石扎根手链': 'Root Chakra · Garnet Grounding Bracelet',
  '满月祝福 · 月光石项链': 'Full Moon Blessing · Moonstone Necklace',
  '手链': 'Bracelet',
  '项链': 'Necklace',
  '套装': 'Set',
  '仪式': 'Ritual',
  '护符': 'Talisman',
  '水晶': 'Crystal',
  '月光': 'Moonlight',
  '满月': 'Full Moon',
  '新月': 'New Moon',
  '火元素': 'Fire element',
  '水元素': 'Water element',
  '土元素': 'Earth element',
  '风元素': 'Air element',
  '以太': 'Ether',
  '直觉': 'Intuition',
  '自信': 'Confidence',
  '行动力': 'Momentum',
  '安全感': 'Safety',
  '爱与关系': 'Love & connection',
}

const orderedPhrases = Object.entries(PHRASES).sort(([left], [right]) => right.length - left.length)
const han = /[\u3400-\u9fff]/

function translate(value: string) {
  let next = value
  for (const [source, target] of orderedPhrases) {
    next = next.replaceAll(source, target)
  }

  next = next
    .replace(/库存\s*(\d+)/g, '$1 in stock')
    .replace(/共\s*(\d+)\s*件商品/g, '$1 items')
    .replace(/(\d+)\s*单需备货/g, '$1 orders need fulfilment')
    .replace(/今天\s*·\s*/g, 'Today · ')
    .replace(/昨日/g, 'yesterday')
    .replace(/上周/g, 'last week')

  return next
}

function fallbackFor(tagName: string, source: string) {
  const tag = tagName.toUpperCase()
  const compact = source.replace(/\s+/g, '')

  if (/^(H1|H2|H3|H4|H5|H6)$/.test(tag)) {
    if (compact.includes('海底轮')) return 'Root Chakra Talisman'
    if (compact.includes('脐轮')) return 'Sacral Chakra Talisman'
    if (compact.includes('太阳轮')) return 'Solar Plexus Talisman'
    if (compact.includes('心轮')) return 'Heart Chakra Talisman'
    if (compact.includes('喉轮')) return 'Throat Chakra Talisman'
    if (compact.includes('眉心轮')) return 'Third Eye Talisman'
    if (compact.includes('顶轮')) return 'Crown Chakra Talisman'
    return 'Lunar Talisman'
  }

  if (tag === 'P') {
    return 'A crystal talisman shaped by moonlight, intention, and your present energy.'
  }

  if (tag === 'BUTTON' || tag === 'OPTION') return 'Explore'
  if (tag === 'LABEL') return 'Details'
  return 'Crystal Talisman'
}

function translateTextNode(node: Text) {
  const current = node.nodeValue || ''
  if (node.parentElement?.closest('[data-no-auto-translate]')) return
  if (!han.test(current)) return

  const translated = translate(current)
  const next = han.test(translated)
    ? fallbackFor(node.parentElement?.tagName || '', translated)
    : translated

  if (next !== current) node.nodeValue = next
}

function translateElementAttributes(element: Element) {
  if (element.closest('[data-no-auto-translate]')) return
  for (const attribute of ['placeholder', 'aria-label', 'title', 'alt']) {
    const current = element.getAttribute(attribute)
    if (!current || !han.test(current)) continue
    const translated = translate(current)
    const next = han.test(translated)
      ? attribute === 'placeholder'
        ? 'Enter details'
        : attribute === 'alt'
          ? 'Lunar Talisman crystal'
          : 'Explore Lunar Talisman'
      : translated
    if (next !== current) element.setAttribute(attribute, next)
  }
}

function translateTree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text)
    return
  }

  if (!(root instanceof Element || root instanceof DocumentFragment)) return
  if (root instanceof Element) translateElementAttributes(root)
  root.querySelectorAll('*').forEach(translateElementAttributes)

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  for (const node of nodes) {
    translateTextNode(node)
  }
}

export function useEnglishUi() {
  useEffect(() => {
    document.documentElement.lang = 'en'
    translateTree(document.body)

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData') {
          translateTree(record.target)
        }
        if (record.type === 'attributes' && record.target instanceof Element) {
          translateElementAttributes(record.target)
        }
        for (const node of record.addedNodes) translateTree(node)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'],
    })
    return () => observer.disconnect()
  }, [])
}
