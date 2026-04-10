# JNBY AI 店铺手机端 Demo

这是一个可手机端演示的 H5 Demo，交互逻辑按 `source-journey.html`（即你提供的 `jnby-full-journey (1).html`）实现。

## 关键点

- 进店欢迎 + 双列 feeds 浏览
- 上滑时店招/底部输入区收起，显示紧凑摘要栏
- 商品详情以浮层打开（不跳转页面）
- 详情关闭后打点浏览足迹，并在输入区左侧保留 `店内足迹`
- 底部可随时提问，进入「用户问题 + anna 回复 + 推荐商品」canvas
- canvas 上滑后，回复正文折叠为顶部摘要
- `店内足迹` 与 `历史消息` 底部面板，历史消息可回钉到对应回复

## 商品数据

- 商品图来自江南布衣淘宝店真实商品图
- 为保证演示稳定，图片已落地到本地静态目录：`assets/products/`
- 商品数据文件：`products.json`

## 本地运行

```bash
cd "/Users/headplus/Documents/aistore-demo-project"
python3 -m http.server 8080
```

打开：`http://localhost:8080`

## 公网部署

当前版本是纯静态站点，直接部署 GitHub Pages / Vercel 静态托管均可。

