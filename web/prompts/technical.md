# 技术规范参考

> 开始写代码前读取本文件。

---

## HTML 文件结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>描述性标题</title>
    <style>/* CSS */</style>
</head>
<body>
    <!-- 内容 -->
    <script>/* JS */</script>
</body>
</html>
```

---

## React + Babel（内联 JSX）

固定版本 CDN（保留 integrity 哈希；CDN 受限时去掉）：

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"
        integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L"
        crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"
        integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm"
        crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
        integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y"
        crossorigin="anonymous"></script>
```

### 三条硬规则

**1. 禁止 `const styles = { ... }`** — 多组件文件同名全局变量会静默相互覆盖。用组件名命名空间：

```jsx
const terminalStyles = { container: { ... } };
const headerStyles = { wrap: { ... } };
// 或直接内联 style={{...}}
```

**2. 独立 `<script type="text/babel">` 块不共享作用域** — 末尾必须显式挂载：

```jsx
function Terminal() { /* ... */ }
Object.assign(window, { Terminal });
```

**3. 禁止 `scrollIntoView`** — iframe 预览中会干扰外层滚动。改用 `element.scrollTop` 或 `window.scrollTo({...})`。

### 补充
- CDN script 不加 `type="module"` — 破坏 Babel 转译
- 引入顺序：React → ReactDOM → Babel → 各组件文件

---

## CSS 最佳实践

- 布局：CSS Grid + Flexbox
- 设计令牌：CSS 自定义属性（`--` 变量）
- 颜色扩展：用 `oklch()` 推导和谐变体，不凭空造色
- 换行：`text-wrap: pretty`
- 流体字体：`clamp()`
- 中文界面：必须显式声明 CJK 字体栈（见 references/advanced-patterns.md → Chinese Typography）
- 组件响应式：`@container` queries
- 系统偏好：`@media (prefers-color-scheme)` 和 `@media (prefers-reduced-motion)`
- **calc() 运算符两侧必须有空格**：`calc(100% - 20px)`，无空格会静默失效

---

## 常用 CDN 资源

**默认优先手写 CSS。** 以下资源按需引入：

```html
<!-- 图表（明确需要时） -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://d3js.org/d3.v7.min.js"></script>

<!-- 字体（避免 Inter/Roboto/Arial/Fraunces/system-ui） -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Tailwind（仅快速一次性原型；与设计令牌工作流冲突） -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Lucide Icons（用户明确指定时；无图标优先用占位符） -->
<script src="https://unpkg.com/lucide@latest"></script>

<!-- Popmotion（CSS/RAF 无法覆盖时的动效备选） -->
<script src="https://unpkg.com/popmotion@11.0.5/dist/popmotion.min.js"></script>
```

> 更多代码模板（设备框架、幻灯片引擎、动效时间轴、调参面板等）见 [references/advanced-patterns.md](../references/advanced-patterns.md)
