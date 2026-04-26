# 豆包生图外挂 — 规范与调用模板

> 按需加载：Step 5 完整构建阶段，识别到需要真实图片时读取本文件。

---

## 首次使用检查

**每次读取本文件时，先检查 API Key 是否已配置：**

```bash
echo $DOUBAO_API_KEY
```

- **已配置**（有输出）→ 直接继续执行流程
- **未配置**（空输出）→ 向用户提示：

```
检测到豆包生图外挂尚未配置 API Key。

此功能需要火山引擎豆包绘图 API Key（中国大陆）。
获取方式：登录 https://console.volcengine.com → 火山方舟 → API Key 管理 → 新建 API Key

获取后，请运行以下命令永久配置（二选一）：

# 方式①：写入 Claude Code 全局配置（推荐，每次自动注入）
# 编辑 ~/.claude/settings.json，在 "env" 中添加：
# "DOUBAO_API_KEY": "your-key-here"

# 方式②：临时设置（仅当前会话有效）
! export DOUBAO_API_KEY="your-key-here"

配置完成后重新告诉我，我继续为你生成图片。
```

未配置时**不要报错或跳过提示**，友好引导用户完成配置后继续。

---

## 何时触发

满足以下**全部条件**时主动询问用户是否生图：

1. 设计中存在需要**真实视觉感**的图片区域（Hero 图、产品展示图、背景插画、人物/场景照片等）
2. 用户**未提供**素材，且当前用占位符会明显降低交付质量
3. 占位色块/灰框无法传达设计意图

**不触发的情况：**
- 纯 UI 界面（图标、按钮、数据图表）——用 SVG/CSS 实现
- 用户明确说"先用占位符就好"
- 图片区域尺寸 < 200px（装饰性小图，占位符即可）

---

## API 规格

| 项目 | 值 |
|------|-----|
| Endpoint | `https://ark.cn-beijing.volces.com/api/v3/images/generations` |
| Method | POST |
| Auth | `Authorization: Bearer $DOUBAO_API_KEY` |
| Content-Type | `application/json` |
| 模型 | `doubao-seedream-3-0-t2i-250415` |
| 图片有效期 | 24 小时（必须立即下载到本地） |

### 请求参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `model` | string | 必填 | `doubao-seedream-3-0-t2i-250415` |
| `prompt` | string | 必填 | 图片描述，支持中英文，建议英文质量更高 |
| `size` | string | `1024x1024` | 见下方尺寸表 |
| `response_format` | string | `url` | `url` 或 `b64_json` |
| `seed` | integer | `-1` | -1 随机，固定值可复现 |
| `guidance_scale` | float | `2.5` | 1–10，越高越贴近 prompt |
| `watermark` | boolean | `true` | **设计用途设为 false** |

### 常用尺寸

| 用途 | size 值 |
|------|---------|
| 正方形（头像/卡片） | `1024x1024` |
| 横版 Hero/Banner | `1280x720` 或 `1920x1080` |
| 竖版海报/封面 | `768x1024` 或 `864x1152` |
| 宽屏背景 | `2048x1152` |
| 产品图（方形偏高） | `1024x1280` |

---

## Bash 调用模板

```bash
# 调用豆包生图 API，下载结果到本地
# 用法：修改 PROMPT、SIZE、OUTPUT_PATH 三个变量后执行

PROMPT="your prompt here"
SIZE="1024x1024"
OUTPUT_PATH="assets/images/generated_hero.jpg"
MODEL="doubao-seedream-3-0-t2i-250415"

# 调用 API 获取图片 URL
RESPONSE=$(curl -s -X POST "https://ark.cn-beijing.volces.com/api/v3/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOUBAO_API_KEY" \
  -d "{
    \"model\": \"$MODEL\",
    \"prompt\": \"$PROMPT\",
    \"size\": \"$SIZE\",
    \"response_format\": \"url\",
    \"guidance_scale\": 2.5,
    \"watermark\": false
  }")

# 提取 URL
IMAGE_URL=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['url'])")

# 下载到本地
mkdir -p "$(dirname $OUTPUT_PATH)"
curl -s -o "$OUTPUT_PATH" "$IMAGE_URL"
echo "图片已保存：$OUTPUT_PATH"
```

---

## 执行流程（Step 5 中嵌入）

### IG-1：识别图片需求

在设计执行清单中标注每个图片区域：
- 区域名称（如 Hero 背景、产品展示图 1）
- 建议尺寸
- 视觉描述草稿

### IG-2：向用户确认

```
检测到设计中需要 [N] 张真实图片：
① Hero 背景（1280×720）— [描述]
② 产品展示图（1024×1024）— [描述]

是否使用豆包生图来生成这些图片？
（可以逐张确认 prompt，也可以让我自动生成）
```

### IG-3：撰写高质量 Prompt

**Prompt 规范：**
- 优先英文（质量显著更高）
- 结构：`[主体] + [风格/氛围] + [光线] + [构图] + [技术参数]`
- 设计用途加上：`clean background, professional, high quality, no text`
- 避免：模糊词（"beautiful"、"good"）、过多主体堆叠

**示例 Prompt（按场景）：**

```
# Hero 科技产品图
A sleek smartphone floating in mid-air, cinematic lighting, dark gradient background, 
product photography style, sharp focus, no reflections, 8k quality

# SaaS 功能配图  
Minimalist dashboard UI on a MacBook screen, clean white desk environment,
soft natural light from left, shallow depth of field, professional product photography

# 人物/团队配图
Diverse team of professionals in a modern office, natural light, 
candid moment, shot with 35mm lens, warm tones, editorial photography style

# 抽象背景/纹理
Abstract geometric shapes in deep navy and electric blue, 
smooth gradient transitions, minimal, suitable for tech company website background
```

### IG-4：执行生成与下载

使用上方 Bash 模板，变量替换后执行：
- `OUTPUT_PATH` 规范：`assets/images/{语义名称}.jpg`
- 一次只生成一张，确认满意后再生成下一张
- 生成后立即 Read 图片验证效果

### IG-5：嵌入 HTML

```html
<!-- 直接用本地相对路径 -->
<img src="assets/images/generated_hero.jpg" alt="描述" 
     style="width:100%; height:100%; object-fit:cover; object-position:center;">
```

### IG-6：更新资产清单

生成完成后更新 `assets/MANIFEST.md`，记录图片名称、用途、生成日期。

---

## API Key 配置

API Key 需通过环境变量 `DOUBAO_API_KEY` 传入。

**设置方式（推荐）：**
```bash
# 加入 ~/.zshrc 或 ~/.bashrc（永久生效）
export DOUBAO_API_KEY="your-api-key-here"

# 或在 Claude Code 会话中临时设置
! export DOUBAO_API_KEY="your-api-key-here"
```

**验证是否已设置：**
```bash
echo $DOUBAO_API_KEY
```

若未设置，在执行生图前提示用户：
```
需要设置豆包 API Key。请运行：
! export DOUBAO_API_KEY="your-key-here"
```

---

## 常见错误处理

| 错误 | 原因 | 处理 |
|------|------|------|
| `401 Unauthorized` | API Key 错误或未设置 | 提示用户检查 `$DOUBAO_API_KEY` |
| `400 Bad Request` | 参数格式错误 | 检查 size 格式是否为 `NxN` |
| URL 下载失败 | URL 已过期（>24h） | 重新生图 |
| 图片内容不符 | Prompt 不够具体 | 参照 IG-3 规范重写 Prompt |
| `python3` 不可用 | 系统无 Python | 改用 `jq`：`echo $RESPONSE \| jq -r '.data[0].url'` |
