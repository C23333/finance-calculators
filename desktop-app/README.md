# FinCalc Desktop App

将 FinCalc 网站打包成桌面应用（Windows/Mac/Linux）。

## 快速开始

### 1. 准备工作

```bash
cd desktop-app
npm install
```

### 2. 构建 Web 文件

```bash
node build.js
```

这会将网站文件复制到 `web/` 目录，并移除广告和分析代码。

### 3. 添加应用图标

在 `icons/` 目录下放置以下图标文件：
- `icon.ico` - Windows 图标 (256x256)
- `icon.icns` - macOS 图标
- `icon.png` - Linux 图标 (512x512)

可以使用 https://www.icoconverter.com/ 转换图标格式。

### 4. 打包应用

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# 全平台
npm run build:all
```

打包后的文件在 `dist/` 目录。

## 开发调试

```bash
npm start
```

## 输出文件

| 平台 | 文件 |
|------|------|
| Windows | `FinCalc-Setup.exe` (安装包), `FinCalc.exe` (便携版) |
| macOS | `FinCalc.dmg`, `FinCalc.zip` |
| Linux | `FinCalc.AppImage`, `FinCalc.deb` |

## Payhip 配置

1. 注册 [Payhip](https://payhip.com) 账号
2. 绑定 PayPal 或 Stripe 收款
3. 创建产品：Add Product → Digital Download
4. 设置价格 $9.99，上传打包好的文件
5. 获取产品链接，如 `https://payhip.com/b/aB1cD`
6. 更新 `js/payhip.js` 中的配置：

```javascript
config: {
    products: {
        desktopApp: {
            productId: 'aB1cD',  // URL 中 /b/ 后面的部分
            price: 9.99
        }
    }
}
```

## Payhip 优势

- **费率低**：只收 5%（比 Gumroad 的 10% 省一半）
- **支持中国**：PayPal 收款
- **嵌入式结账**：用户不离开你的网站
- **无月费**：免费套餐够用

## 发布流程

1. 打包各平台应用
2. 在 Gumroad 产品中上传打包文件
3. 发布产品
4. 用户购买后自动获得下载链接

## 注意事项

- macOS 打包需要在 Mac 上进行（或使用 CI/CD）
- Windows 代码签名需要购买证书（可选）
- 首次打包可能需要下载 Electron 二进制文件，请耐心等待
