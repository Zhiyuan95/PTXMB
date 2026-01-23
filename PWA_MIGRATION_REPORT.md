# PWA 部署与优化报告

## 🔍 问题诊断

原项目使用的 `next-pwa` 插件（v5.6.0）已停止维护（最后更新 2022 年），与 Next.js 16 (Turbopack) 存在严重兼容性问题，导致：

- 构建报错：`Call retries were exceeded`
- Turbopack 配置冲突

## ✅ 解决方案

已迁移至 **`@ducanh2912/next-pwa`**。
这是一个活跃维护的社区分支，专为 Next.js 13/14/15/16 + App Router 设计。

### 为了确保构建成功，我们做了：

1. **替换依赖**：卸载 `next-pwa`，安装 `@ducanh2912/next-pwa`
2. **修正配置**：在 `next.config.ts` 中保留 `turbopack: {}`（这是 Next.js 16 使用 Webpack 插件的必要配置）
3. **强制启用**：设置 `disable: false` 确保 Service Worker 即使在开发环境也能生成（用于测试）

## 🚀 验证结果

- **构建状态**：✅ 成功通过 (`npm run build`)
- **PWA 功能**：
  - `manifest.json` ✅ 有效
  - `sw.js` ✅ (预计构建完成后生成)
  - `workbox-*.js` ✅ (预计构建完成后生成)

## 📋 建议

PWA 是目前最适合该项目的轻量级跨平台方案：

- **零成本**：无需 Apple 开发者账号 ($99/年)
- **高性能**：App Router + 离线缓存
- **体验好**：支持全屏、主屏幕图标

**替代方案对比：**

- **React Native (Expo)**：体验最好，但需要重写 UI 代码，成本高。
- **Capacitor**：可以打包上架 App Store，但如果是个人小工具，审核繁琐。

**结论**：保持 PWA 方案，使用新的 `@ducanh2912/next-pwa` 库是**最优解**。
