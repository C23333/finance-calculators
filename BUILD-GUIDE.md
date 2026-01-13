# FinCalc 多平台打包指南

## 📱 支持平台

| 平台 | 技术方案 | 目录 |
|------|----------|------|
| Windows | Electron | `desktop-app/` |
| macOS | Electron | `desktop-app/` |
| Linux | Electron | `desktop-app/` |
| Android | Capacitor | `mobile-app/` |
| iOS | Capacitor | `mobile-app/` |

---

## 🖥️ 桌面端打包 (Windows/Mac/Linux)

### 准备工作

```bash
cd finance-calculators/desktop-app
npm install
```

### 构建 Web 文件

```bash
node build.js
```

### 添加应用图标

在 `icons/` 目录放置：
- `icon.ico` - Windows (256x256)
- `icon.icns` - macOS
- `icon.png` - Linux (512x512)

图标转换工具：https://www.icoconverter.com/

### 打包

```bash
# Windows（在 Windows 上运行）
npm run build:win

# macOS（需要在 Mac 上运行）
npm run build:mac

# Linux
npm run build:linux
```

### 输出文件

打包后在 `dist/` 目录：
- Windows: `FinCalc-Setup.exe`, `FinCalc.exe` (便携版)
- macOS: `FinCalc.dmg`
- Linux: `FinCalc.AppImage`

---

## 📱 移动端打包 (Android/iOS)

### 准备工作

```bash
cd finance-calculators/mobile-app
npm install
```

### 构建 Web 文件

```bash
node build-web.js
# 或
npm run build:web
```

### Android 打包

**需要安装：**
- Android Studio
- Java JDK 11+

```bash
# 添加 Android 平台
npm run cap:add:android

# 同步文件
npm run cap:sync

# 打开 Android Studio
npm run cap:open:android
```

在 Android Studio 中：
1. Build → Generate Signed Bundle / APK
2. 选择 APK
3. 创建或选择签名密钥
4. 选择 release
5. 生成 APK

输出：`android/app/release/app-release.apk`

### iOS 打包

**需要：**
- Mac 电脑
- Xcode
- Apple Developer 账号 ($99/年)

```bash
# 添加 iOS 平台
npm run cap:add:ios

# 同步文件
npm run cap:sync

# 打开 Xcode
npm run cap:open:ios
```

在 Xcode 中：
1. 选择你的 Team (Apple Developer 账号)
2. Product → Archive
3. Distribute App → App Store Connect 或 Ad Hoc

---

## 📤 上传到 Payhip

### 方式一：直接上传文件

1. 登录 Payhip
2. 编辑产品
3. 上传所有打包文件：
   - `FinCalc-Setup.exe` (Windows)
   - `FinCalc.dmg` (macOS)
   - `FinCalc.AppImage` (Linux)
   - `app-release.apk` (Android)
4. 用户购买后可以下载全部文件

### 方式二：外部链接

如果文件太大，可以：
1. 上传到 GitHub Releases
2. 在 Payhip 产品描述中提供下载链接
3. 或使用 Google Drive / Dropbox 分享链接

---

## 🍎 iOS 发布注意事项

iOS 应用必须通过 App Store 发布（除非企业账号）：

1. **Apple Developer 账号**：$99/年
2. **App Store 审核**：需要 1-7 天
3. **替代方案**：
   - 只发布 Android APK
   - 引导 iOS 用户使用网页版（添加到主屏幕）

### PWA 替代方案（推荐）

iOS 用户可以将网页添加到主屏幕，体验接近原生 App：

在网站添加 PWA 支持（已有基础配置），用户可以：
1. Safari 打开网站
2. 点击分享按钮
3. 选择"添加到主屏幕"

---

## 🔧 常见问题

### Q: Windows 打包报错？
确保安装了 Visual Studio Build Tools

### Q: macOS 打包需要签名？
可以不签名，但用户打开时会有安全警告。正式发布建议购买 Apple Developer 证书。

### Q: Android APK 安装提示不安全？
正常现象，非 Play Store 的 APK 都会提示。用户需要允许"未知来源"安装。

### Q: 文件太大怎么办？
- Electron 打包约 80-150MB（包含 Chromium）
- 可以使用 electron-builder 的 NSIS 压缩
- 或考虑使用 Tauri（更小，约 10MB）

---

## 📋 发布清单

- [ ] Windows exe 测试通过
- [ ] macOS dmg 测试通过
- [ ] Linux AppImage 测试通过
- [ ] Android APK 测试通过
- [ ] 上传到 Payhip
- [ ] 更新产品描述和截图
- [ ] 设置价格
- [ ] 发布
