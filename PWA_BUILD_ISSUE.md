# PWA 本地构建问题说明

## 问题

本地构建时遇到 `next-pwa` 兼容性错误：

```
Error: Call retries were exceeded
```

这是 `next-pwa` v5.6.0 与 Next.js 16.1.2 之间的已知兼容性问题。

## 解决方案

### 方案 1：直接部署到 Vercel ⭐推荐

**为什么推荐：**

- Vercel 构建环境与本地不同，通常能成功构建
- PWA 需要 HTTPS 环境才能完整测试（Vercel 自动提供）
- 可以直接在手机上验证"添加到主屏幕"功能

**操作步骤：**

```bash
git add .
git commit -m "feat: add PWA support"
git push
```

等待 Vercel 自动部署（2-3 分钟），然后在手机浏览器访问您的域名测试。

---

### 方案 2：暂时禁用 PWA 进行本地测试

如果您想先在本地验证其他功能（非 PWA），可以临时禁用：

**修改 `next.config.ts`：**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

测试完后再恢复 PWA 配置。

---

### 方案 3：降级 next-pwa

安装更稳定的旧版本：

```bash
npm uninstall next-pwa
npm install next-pwa@5.5.0
```

但可能缺少某些新特性。

---

## 推荐行动

**直接选择方案 1**，因为：

1. PWA 本来就需要在生产环境测试
2. Vercel 构建更可靠
3. 节省时间，直接看到最终效果
