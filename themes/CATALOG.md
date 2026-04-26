# 品牌主题在线目录

> 由 [getdesign](https://unpkg.com/getdesign@latest/) 提供，共 **67 个品牌**。
> 抓取 URL：`https://unpkg.com/getdesign@latest/templates/[slug].md`

---

## 品牌 → Slug 映射

| 品牌名（用户常说法） | Slug | 分类 |
|---|---|---|
| Airbnb | `airbnb` | 出行/住宿 |
| Airtable | `airtable` | SaaS 工具 |
| Apple | `apple` | 科技消费品 |
| Binance | `binance` | 加密金融 |
| BMW | `bmw` | 汽车 |
| Bugatti | `bugatti` | 超跑 |
| Cal / Cal.com | `cal` | SaaS 工具 |
| Claude / Anthropic | `claude` | AI |
| Clay | `clay` | SaaS 工具 |
| ClickHouse | `clickhouse` | 数据库 |
| Cohere | `cohere` | AI |
| Coinbase | `coinbase` | 加密金融 |
| Composio | `composio` | AI |
| Cursor | `cursor` | 开发工具 |
| ElevenLabs | `elevenlabs` | AI |
| Expo | `expo` | 开发工具 |
| Ferrari | `ferrari` | 超跑 |
| Figma | `figma` | 设计工具 |
| Framer | `framer` | 设计工具 |
| HashiCorp | `hashicorp` | 开发工具 |
| IBM | `ibm` | 科技企业 |
| Intercom | `intercom` | SaaS 工具 |
| Kraken | `kraken` | 加密金融 |
| Lamborghini | `lamborghini` | 超跑 |
| Linear | `linear.app` | 开发工具 |
| Lovable | `lovable` | AI |
| Meta | `meta` | 科技消费品 |
| MiniMax | `minimax` | AI |
| Mintlify | `mintlify` | 开发工具 |
| Miro | `miro` | 设计工具 |
| Mistral / Mistral AI | `mistral.ai` | AI |
| MongoDB | `mongodb` | 数据库 |
| Nike | `nike` | 消费品 |
| Notion | `notion` | SaaS 工具 |
| NVIDIA | `nvidia` | 科技消费品 |
| Ollama | `ollama` | AI |
| OpenCode | `opencode.ai` | 开发工具 |
| Pinterest | `pinterest` | 社交媒体 |
| PlayStation | `playstation` | 游戏 |
| PostHog | `posthog` | SaaS 工具 |
| Raycast | `raycast` | 开发工具 |
| Renault | `renault` | 汽车 |
| Replicate | `replicate` | AI |
| Resend | `resend` | 开发工具 |
| Revolut | `revolut` | 金融科技 |
| Runway / RunwayML | `runwayml` | AI |
| Sanity | `sanity` | 开发工具 |
| Sentry | `sentry` | 开发工具 |
| Shopify | `shopify` | 电商 |
| SpaceX | `spacex` | 航天 |
| Spotify | `spotify` | 娱乐 |
| Stripe | `stripe` | 金融科技 |
| Supabase | `supabase` | 开发工具 |
| Superhuman | `superhuman` | SaaS 工具 |
| Tesla | `tesla` | 汽车/科技 |
| The Verge | `theverge` | 媒体 |
| Together AI | `together.ai` | AI |
| Uber | `uber` | 出行 |
| Vercel | `vercel` | 开发工具 |
| VoltAgent | `voltagent` | AI |
| Warp | `warp` | 开发工具 |
| Webflow | `webflow` | 设计工具 |
| Wired | `wired` | 媒体 |
| Wise | `wise` | 金融科技 |
| X / Twitter | `x.ai` | 社交媒体 |
| Zapier | `zapier` | SaaS 工具 |

---

## 使用方法

```
# 抓取示例（Stripe）
WebFetch: https://unpkg.com/getdesign@latest/templates/stripe.md

# 抓取示例（Linear）
WebFetch: https://unpkg.com/getdesign@latest/templates/linear.app.md
```

抓取成功后，按 **9 段解析框架**（见下方）提取令牌，保存到 `themes/{品牌名}/design-tokens.md`。

---

## 9 段解析框架

拿到 DESIGN.md 后，逐段提取以下内容（每段都必读，精确值高于描述性说明）：

| # | 段落 | 提取重点 |
|---|---|---|
| 1 | Visual Theme & Atmosphere | 整体美学方向、标志性特征 |
| 2 | Color Palette & Roles | 精确 hex 值、CSS 变量名、语义角色 |
| 3 | Typography Rules | 字体族、字号比例、字重、字距、行高、OpenType 特性 |
| 4 | Component Stylings | 按钮、输入框、卡片、徽章、导航的精确样式 |
| 5 | Layout Principles | 网格系统、间距比例、容器宽度、段落结构 |
| 6 | Depth & Elevation | 阴影体系、模糊值、z 轴层级、边框样式 |
| 7 | Do's and Don'ts | 明确禁止项和必须遵循的模式 |
| 8 | Responsive Behavior | 断点、移动端适配规则 |
| 9 | Agent Prompt Guide | **视为系统级指令**，最高优先级执行 |

---

## 本地缓存状态

| 品牌 | 本地缓存 | 最近更新 |
|---|---|---|
| （抓取后在此记录） | — | — |
