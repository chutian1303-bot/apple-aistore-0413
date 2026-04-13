# Apple 产品体验馆 Demo

一个可直接手机演示的 H5 Demo，面向 Apple 场景的 AI 产品顾问。页面包含商品浏览、详情推荐、问答交互、历史回看与足迹追踪等完整闭环，适合线下演示和方案讲解。

线上体验地址：  
`https://chutian1303-bot.github.io/aistore-demo-apple/`

## 本次 Demo 功能

- Apple 商品瀑布流展示：覆盖 iPhone、MacBook、iPad、Watch、AirPods 与配件。
- AI 产品顾问问答：支持自然语言提问，返回简要建议与推荐商品。
- 商品详情浮层：包含配置建议、机型对比、优惠提示与配件搭配。
- 历史消息与店内足迹：支持回看和快速回跳，便于讲解“问答 -> 推荐 -> 浏览”路径。
- 移动端体验优化：店招可折叠，交互适配手机安全区与输入法。

## 关键文件

- `index.html`：页面结构
- `styles.css`：样式与动画
- `app.js`：交互逻辑与本地推荐规则
- `products.json`：Apple 商品知识库（商品名/价格/图片/链接）
- `scripts/sync-apple-products.mjs`：从 Apple 官网同步商品库
- `source-journey.html`：用户动线草图页

## 更新商品库

```bash
cd "/Users/chuaihui/Desktop/codex project/aistore-demo-apple"
node ./scripts/sync-apple-products.mjs
```

运行后会自动覆盖 `products.json`，数据来源为 Apple 官网购买页与商品配置页。

## 本地运行

```bash
cd "/Users/chuaihui/Desktop/codex project/aistore-demo-apple"
python3 -m http.server 8080
```

打开：`http://localhost:8080`

## 说明

当前版本为演示环境，商品与价格来自 Apple 官网页面抓取结果；库存、促销和可售地区请以 Apple 官方实时页面为准。
