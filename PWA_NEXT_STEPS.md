# PWA 下一步操作指南

## ✅ 当前状态

PWA 配置已完全就绪！所有必需的文件都已到位：

- ✅ `manifest.json` - 应用清单
- ✅ `next.config.ts` - PWA 插件配置
- ✅ `app/layout.tsx` - PWA 元数据
- ✅ **应用图标** - 已从 AppImages 复制到正确位置

---

## 📋 下一步操作

### 1. 本地测试 PWA（可选）

```bash
# 停止开发服务器
Ctrl+C

# 构建生产版本（PWA 只在生产模式下工作）
npm run build

# 启动生产服务器
npm start
```

然后访问 `http://localhost:3000`，打开 Chrome DevTools：

- **Application** 标签 → **Manifest** → 查看应用清单
- **Service Workers** → 确认 Service Worker 已注册

---

### 2. 部署到 Vercel ⭐推荐

```bash
# 提交所有更改
git add .
git commit -m "feat: add PWA support with app icons"

# 推送到 GitHub
git push
```

**Vercel 会自动：**

- 检测到新的提交
- 构建生产版本
- 部署到您的域名
- 启用 PWA 功能

---

### 3. 在手机上测试安装

部署完成后（约 2-3 分钟）：

#### Android (Chrome):

1. 用手机浏览器访问您的 Vercel URL
2. 浏览器底部会弹出 **"添加 菩提心妙宝 到主屏幕"** 横幅
3. 点击"添加"
4. 主屏幕会出现应用图标
5. 点击图标启动，全屏显示（无浏览器地址栏）

#### iOS (Safari):

1. 用 Safari 访问您的 Vercel URL
2. 点击底部的 **分享** 按钮
3. 选择 **"添加到主屏幕"**
4. 点击"添加"
5. 主屏幕会出现应用图标

---

### 4. 验证 PWA 功能

安装后测试：

- ✅ 应用图标显示正确（金色莲花/法轮）
- ✅ 全屏启动（无浏览器 UI）
- ✅ 启动画面显示（暖色调背景）
- ✅ 离线功能：访问页面后，关闭网络，刷新仍可访问

---

## 🎉 完成！

PWA 现在已完全配置好。用户可以：

- **继续当网站用**（浏览器访问）
- **安装成 APP**（添加到主屏幕）

两种方式使用同一份代码，无需维护两个版本！

---

## 📝 可选：清理文件

如果您想保持项目整洁，可以删除 `public/icons/AppImages` 文件夹（已复制所需文件）：

```bash
Remove-Item -Recurse -Force public\icons\AppImages
```

但保留也没问题，不影响功能。
