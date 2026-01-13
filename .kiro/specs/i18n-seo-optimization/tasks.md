# Implementation Plan: i18n SEO Optimization

## Overview

本实现计划将分步骤完成 i18n 完整性检查、多语言 SEO 优化和友情链接功能。

## Tasks

- [x] 1. 创建 i18n 翻译检查工具
  - [x] 1.1 创建 `scripts/check-i18n.js` 脚本
    - 实现 `getAllKeys` 函数递归提取所有翻译键
    - 实现 `compareTranslations` 函数对比两个翻译对象
    - 实现报告生成和输出功能
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 运行检查脚本并记录缺失翻译
    - 执行脚本获取所有语言的缺失键列表
    - 记录每个语言文件需要补充的翻译
    - _Requirements: 1.1, 1.2_

- [x] 2. 补全缺失的 i18n 翻译
  - [x] 2.1 为所有语言文件添加 SEO 相关翻译键
    - 添加 `seo.home.title` - 本地化的页面标题
    - 添加 `seo.home.description` - 本地化的 meta description
    - 添加 `seo.home.keywords` - 本地化的关键词
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 2.2 为所有语言文件添加友情链接翻译
    - 添加 `footer.friendLinks` - 友情链接区域标题
    - 添加 `footer.qrmaker` - QR Code Generator 的本地化名称
    - _Requirements: 5.5, 7.4_

  - [x] 2.3 补全其他缺失的翻译键
    - 根据检查脚本输出补全各语言缺失的翻译
    - 确保所有语言文件与英文文件键一致
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Checkpoint - 验证翻译完整性
  - 运行 check-i18n.js 确认所有语言翻译完整
  - 确保所有 JSON 文件格式有效
  - 如有问题请询问用户

- [x] 4. 增强 SEO 模块支持多语言
  - [x] 4.1 添加 hreflang 标签动态生成功能
    - 在 `js/seo.js` 中添加 `injectHreflangTags` 函数
    - 动态为所有 10 种语言生成 hreflang 标签
    - 添加 x-default 指向英文版本
    - 注意：index.html 已有静态 hreflang 标签，此功能用于动态页面
    - _Requirements: 3.2, 6.2, 6.3_

  - [x] 4.2 添加多语言结构化数据生成
    - 修改 Organization schema 添加 inLanguage 属性
    - 修改 WebSite schema 添加 inLanguage 属性（index.html 已有部分实现）
    - 修改 BreadcrumbList schema 使用本地化名称
    - _Requirements: 3.4, 4.1, 4.2, 4.3, 4.4_

  - [x] 4.3 添加动态 canonical URL 生成
    - 根据当前语言生成正确的 canonical URL
    - 非英语页面 canonical 包含语言前缀
    - _Requirements: 6.1, 6.4_

  - [x] 4.4 添加 Open Graph 多语言支持
    - 语言切换时更新 og:locale
    - 更新 og:title 和 og:description 为本地化版本
    - _Requirements: 3.1, 3.3_

- [x] 5. 添加友情链接到页面底部
  - [x] 5.1 修改 `index.html` 添加友情链接区域
    - 在 footer 中添加 friend-links div
    - 添加指向 qrmaker.life 的链接
    - 设置 target="_blank" 和 rel="noopener"
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [x] 5.2 添加友情链接 CSS 样式
    - 在 `css/style.css` 中添加 .friend-links 样式
    - 确保样式与现有 footer 风格一致
    - _Requirements: 5.1_

  - [x] 5.3 更新其他 HTML 页面的 footer
    - 更新计算器页面的 footer (20 files)
    - 更新博客页面的 footer (90 files including all language versions)
    - 更新隐私政策和服务条款页面的 footer
    - 使用 scripts/add-friend-links.js 批量更新
    - _Requirements: 5.1, 5.2_

- [x] 6. Checkpoint - 验证 SEO 和友情链接
  - ✅ 验证 hreflang 标签功能已在 js/seo.js 中实现
  - ✅ 验证友情链接在所有页面显示 (index, privacy, terms, 20 calculators, 90 blog pages)
  - ✅ 所有 JSON 翻译文件有效且完整

- [x] 7. 更新英文翻译文件确保完整
  - [x] 7.1 确认 `js/i18n/en.json` 包含所有新增键
    - ✅ seo.home.title, seo.home.description, seo.home.keywords 已存在
    - ✅ footer.friendLinks 和 footer.qrmaker 已存在
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8. Final Checkpoint - 完整性验证
  - ✅ 运行 check-i18n.js 验证 - 所有 9 种非英语语言 100% 覆盖
  - ✅ 验证英文 SEO 配置未受影响
  - ✅ 所有 HTML 页面已添加友情链接

## Notes

- 所有翻译应使用目标语言的本地化表达
- SEO 优化不应影响现有英文版本的搜索排名
- 友情链接使用 noopener 确保安全性
- 每个 Checkpoint 用于验证阶段性成果
- index.html 已有静态 hreflang 标签，部分博客页面已有 inLanguage 属性
- 现有 footer 翻译键（copyright, privacy, terms, disclaimer）已存在于所有语言文件中
