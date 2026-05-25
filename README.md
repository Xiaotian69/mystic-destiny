# 命理星象 · Mystic Destiny

> 一个古典东方命理与现代 AI 融合的占卜 H5 应用，基于 DeepSeek 大模型，单文件零依赖，双击即开。

## 项目简介

**命理星象**是一款集八字推演、塔罗解读、星座分析、运势日历于一体的命理占卜应用。原为微信小程序，后完整转换为标准 HTML5 单页应用，无需服务器，无需安装，浏览器直接打开即用。

## 在线体验

在线地址：

```text
https://xiaotian69.github.io/mystic-destiny/
```

电脑本地打开 `index.html` 可用于预览；手机端请使用上面的 HTTPS 在线地址。不要在微信/手机浏览器里直接打开本地 HTML 文件，否则移动浏览器可能会拦截 AI 请求并显示 `Load failed`。

如需重播开场粒子动画，在地址后追加 `?intro=1`：

```text
https://xiaotian69.github.io/mystic-destiny/?intro=1
```

---

## 功能列表

### 🏠 今日运势（主页）

| 功能 | 说明 |
|------|------|
| **五行运势引擎** | 根据生辰八字，结合今日干支五行，动态计算事业 / 感情 / 财运 / 健康四维运势评分 |
| **运势星级** | 综合评分 1–5 星，配以宜忌建议文字 |
| **背景随运势变化** | 5 星金光漫射 · 4 星暖金 · 2 星暗紫 · 1 星寒紫，沉浸感十足 |
| **每日签文** | 5 大元素各 8 条签文（共 40 条），摇筒动画 + 种子随机，每日一签 |
| **运势卡片生成** | 一键生成精美竖版分享卡片，包含日期 / 农历 / 星级 / 宜忌，截图保存 |
| **彩蛋系统** | 在聊天框输入特定咒语触发隐藏界面（UI 配色全变） |

### 🔮 命理分析（三合一）

| 功能 | 说明 |
|------|------|
| **八字推演** | 输入生年月日时，展示天干地支、五行属性、生克关系分析 |
| **塔罗解读** | 4 种牌阵（1 / 3 / 5 / 7 张），22 张大阿卡纳完整收录，先提问后抽牌 |
| **塔罗牌面** | 每张牌独立 SVG 几何插画，金色 / 紫色 / 青色美学，无需图片资源 |
| **AI 自动解读** | 抽完牌后自动触发 DeepSeek AI 逐牌详细解析，牌阵越大解读越丰富 |
| **星座分析** | 12 星座选择，AI 结合星象给出个性化解读 |

### 💬 玄学大师（AI 对话）

- 现代心理学 + 东方命理双重视角，温暖通俗，绝不装腔作势
- 每次对话带入生辰信息作为背景，分析更精准
- 返回格式：`【标题】` 金色加粗 + 三段式结构（分析 → 建议 → 鼓励）

### 📅 运势日历

- 月份导航，31 天格子视图
- 每天运势颜色标注（基于五行干支推算）
- 点击日期查看当日详细运势

### 👤 我的（用户中心）

- 生辰信息录入与保存（`localStorage`）
- 连续访问天数统计
- 成就系统：6 枚成就徽章展示

### 🌟 成就系统

| 成就 | 触发条件 |
|------|----------|
| 📜 命理初探 | 第一次完成八字推演 |
| 🌟 七星连珠 | 连续 7 天打开命理星象 |
| 🃏 命运见证者 | 集齐全部 22 张大阿卡纳 |
| ✨ 大吉之日 | 首次获得 5 星满分运势 |
| 📿 日日占卜 | 连续 5 天摇签问卦 |
| 🔮 塔罗达人 | 完成 5 次塔罗解读 |

解锁成就时顶部弹出金色动画通知，成就永久保存。

### ✨ 开场仪式动画

- 首次访问时触发：Canvas 星粒子从中心爆散 + Logo 文字依次升起
- 约 3.4 秒后自动跳过，或点击屏幕立即跳过
- 再次访问直接进入主页，不重复播放

---

## 项目结构

```
taluo_00/
├── index.html      # 主体单文件 SPA（所有 HTML / CSS / JS）
├── worker.js       # Cloudflare Worker 代理（隐藏 DeepSeek API Key）
├── README.md       # 本文档
└── miniprogram/    # 原微信小程序源码（仅供参考，不再使用）
```

---

## 本地运行

```bash
# 直接双击 index.html 用浏览器打开即可
# 推荐 Chrome / Edge / Firefox 最新版

# 如需本地服务器（解决部分浏览器限制）：
npx serve .
# 或
python -m http.server 8080
```

**手机体验**：用 Chrome DevTools → Toggle Device Toolbar，选择 iPhone 12 / Pixel 5 等设备模拟。

---

## AI 接入配置

本项目使用 **Cloudflare Worker** 作为 API 代理，保护 DeepSeek API Key 不暴露在前端代码中。

### 部署 Cloudflare Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → 创建 Worker（选 "Start with Hello World!"）
3. 将 `worker.js` 内容粘贴至在线编辑器，保存并部署
4. 进入 Worker 的 **Settings → Variables and Secrets**
5. 添加变量：`DEEPSEEK_API_KEY` = 你的 DeepSeek API Key（类型选 Secret）
6. 复制 Worker 部署地址（形如 `https://xxx.workers.dev`）
7. 在 `index.html` 中找到以下行并替换为你的 Worker 地址：

```javascript
const DEEPSEEK_WORKER_URL = 'https://divine-cell-3e23.andyzhao722.workers.dev';
```

### DeepSeek API

- 官网：https://platform.deepseek.com/
- 注册后在 API Keys 页面创建密钥
- 默认模型：`deepseek-v4-flash`（可在 Worker 环境变量中用 `DEEPSEEK_MODEL=deepseek-v4-pro` 切换）

---

## 技术规格

| 项目 | 说明 |
|------|------|
| 框架 | 无框架，原生 HTML / CSS / JS |
| 依赖 | 零依赖（无 npm，无构建工具） |
| AI 模型 | DeepSeek（默认 `deepseek-v4-flash`） |
| 代理 | Cloudflare Workers |
| 存储 | `localStorage`（生辰、成就、签文记录等） |
| 字体 | 系统字体栈（无外部字体请求） |
| 图片 | 零图片（塔罗牌面全为内联 SVG） |
| 兼容性 | Chrome 90+ / Firefox 88+ / Safari 14+ |

### 设计规范

| 颜色变量 | 值 |
|----------|----|
| `--bg-primary` | `#1A1033`（深紫底色） |
| `--gold` | `#C8A951`（金色主题） |
| `--gold-border` | `rgba(200,169,81,0.2)` |
| 单位换算 | `750rpx = 100vw`，`1rpx ≈ 0.1333vw` |

---

## 小程序 → H5 转换参考

| 微信小程序 | H5 替代 |
|------------|---------|
| `<view>` | `<div>` |
| `<text>` | `<span>` |
| `<image>` | `<img>` |
| `<swiper>` | CSS `scroll-snap` |
| `<picker>` | `<select>` 或自定义下拉 |
| `wx:for` | JS `forEach` 动态渲染 |
| `wx:if` | `display:none` |
| `bindtap` | `onclick` |
| `rpx` | `vw` |
| `wx.showToast` | 自定义 toast 函数 |
| `wx.cloud.*` | Cloudflare Worker + DeepSeek |
| `getApp()` | `window.App` 全局对象 |
| `this.setData()` | 直接 DOM 操作 |
| `wx.navigateTo` | JS 路由（section 显隐） |

---

## License

MIT — 个人项目，自由使用。
