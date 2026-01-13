# Design Document: i18n SEO Optimization

## Overview

本设计文档描述了 FinCalc 网站的国际化完整性检查、多语言 SEO 优化和友情链接功能的技术实现方案。

主要目标：
1. 创建翻译完整性检查工具，确保所有语言文件覆盖完整
2. 增强 SEO 模块以支持多语言优化
3. 在页面底部添加友情链接区域

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FinCalc Website                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   i18n System   │  │   SEO Module    │  │   Footer    │ │
│  │   (js/i18n.js)  │  │   (js/seo.js)   │  │  Component  │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                    │                   │        │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌──────▼──────┐ │
│  │ Translation     │  │ Multilingual    │  │ Friend      │ │
│  │ Files (JSON)    │  │ SEO Generator   │  │ Links       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Build/Dev Tools                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │         i18n Checker Script (Node.js)                │   │
│  │         scripts/check-i18n.js                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. i18n Checker Script (`scripts/check-i18n.js`)

Node.js 脚本，用于检查翻译文件的完整性。

```javascript
// 接口定义
interface TranslationReport {
  language: string;
  missingKeys: string[];
  extraKeys: string[];
  totalKeys: number;
  coverage: number; // 百分比
}

interface CheckResult {
  timestamp: string;
  baseLanguage: string;
  reports: TranslationReport[];
  summary: {
    totalLanguages: number;
    fullyTranslated: number;
    needsWork: number;
  };
}

// 主要函数
function getAllKeys(obj: object, prefix?: string): string[];
function compareTranslations(base: object, target: object): { missing: string[], extra: string[] };
function generateReport(): CheckResult;
```

### 2. Enhanced SEO Module (`js/seo.js`)

增强现有 SEO 模块以支持多语言。

```javascript
// 新增接口
interface MultilingualSEO {
  generateLocalizedMeta(lang: string): void;
  updateHreflangTags(currentLang: string): void;
  generateLocalizedSchema(lang: string): object;
  updateCanonicalUrl(lang: string): void;
}

// 新增函数
function getLocalizedSEOData(lang: string): { title: string, description: string, keywords: string };
function injectHreflangTags(): void;
function updateOpenGraphForLanguage(lang: string): void;
function generateMultilingualBreadcrumb(lang: string): object;
```

### 3. Footer Component Enhancement

在 HTML 和 CSS 中添加友情链接区域。

```html
<!-- Footer 结构 -->
<footer>
  <div class="container">
    <p data-i18n="footer.copyright">...</p>
    <p class="footer-links">...</p>
    
    <!-- 新增：友情链接区域 -->
    <div class="friend-links">
      <span data-i18n="footer.friendLinks">Friend Links:</span>
      <a href="https://qrmaker.life/" 
         target="_blank" 
         rel="noopener" 
         data-i18n="footer.qrmaker">QR Code Generator</a>
    </div>
    
    <p class="disclaimer" data-i18n="footer.disclaimer">...</p>
  </div>
</footer>
```

### 4. Translation File Structure Enhancement

为每个语言文件添加 SEO 相关键。

```json
{
  "seo": {
    "home": {
      "title": "Free Financial Calculators - Mortgage, Loan, Investment | FinCalc",
      "description": "Free online financial calculators...",
      "keywords": "mortgage calculator, loan calculator, investment calculator"
    }
  },
  "footer": {
    "friendLinks": "Friend Links",
    "qrmaker": "QR Code Generator"
  }
}
```

## Data Models

### Translation Key Structure

```
翻译键层级结构：
├── site (网站基本信息)
├── nav (导航)
├── hero (首页横幅)
├── categories (计算器分类)
├── calculators (各计算器翻译)
├── results (结果显示)
├── common (通用文本)
├── validation (验证消息)
├── about (关于页面)
├── footer (页脚)
│   ├── copyright
│   ├── privacy
│   ├── terms
│   ├── disclaimer
│   ├── friendLinks (新增)
│   └── qrmaker (新增)
├── blog (博客)
├── sources (数据来源)
├── accessibility (无障碍)
├── newsletter (订阅)
├── download (下载)
├── legal (法律)
└── seo (新增：SEO 专用)
    └── home
        ├── title
        ├── description
        └── keywords
```

### Supported Languages

| Code | Language | Native Name | Direction | Locale |
|------|----------|-------------|-----------|--------|
| en | English | English | ltr | en-US |
| es | Spanish | Español | ltr | es-ES |
| zh | Chinese | 中文 | ltr | zh-CN |
| de | German | Deutsch | ltr | de-DE |
| fr | French | Français | ltr | fr-FR |
| pt | Portuguese | Português | ltr | pt-BR |
| ja | Japanese | 日本語 | ltr | ja-JP |
| ko | Korean | 한국어 | ltr | ko-KR |
| ar | Arabic | العربية | rtl | ar-SA |
| hi | Hindi | हिन्दी | ltr | hi-IN |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Translation Key Completeness

*For any* translation file and the English base file, the set of keys in the translation file should be a superset of or equal to the set of keys in the English file.

**Validates: Requirements 1.1, 2.1**

### Property 2: JSON Format Validity

*For any* translation file, parsing it as JSON should succeed without errors, and the structure should maintain consistent indentation.

**Validates: Requirements 2.3**

### Property 3: Hreflang Tag Completeness

*For any* page in any language, the HTML head should contain hreflang tags for all 10 supported languages plus x-default.

**Validates: Requirements 3.2, 6.2, 6.3**

### Property 4: Canonical URL Correctness

*For any* non-English language page, the canonical URL should contain the language code prefix (e.g., `/es/`, `/zh/`).

**Validates: Requirements 6.1, 6.4**

### Property 5: Structured Data Language Attribute

*For any* non-English language, the generated Schema.org structured data should contain the `inLanguage` property matching the current language code.

**Validates: Requirements 3.4, 4.1, 4.2, 4.3, 4.4**

### Property 6: SEO Translation Keys Presence

*For any* translation file, it should contain the keys `seo.home.title`, `seo.home.description`, and `footer.friendLinks`.

**Validates: Requirements 7.1, 7.2, 7.4**

### Property 7: Friend Link Attributes

*For any* friend link element in the footer, it should have `target="_blank"` and `rel="noopener"` attributes.

**Validates: Requirements 5.3, 5.4**

### Property 8: Multilingual Meta Update

*For any* language switch operation, the Open Graph `og:locale` meta tag should update to match the new language's locale format.

**Validates: Requirements 3.3**

## Error Handling

### i18n Checker Script

1. **Missing Translation File**: 如果某语言文件不存在，报告中标记为 "File Not Found"
2. **Invalid JSON**: 如果 JSON 解析失败，输出详细错误信息和行号
3. **Empty Translation**: 如果翻译值为空字符串，标记为警告

### SEO Module

1. **Missing Translation Key**: 回退到英文值，并在控制台输出警告
2. **Invalid Language Code**: 使用默认语言 (en)
3. **DOM Element Not Found**: 静默跳过，不影响其他功能

### Footer Component

1. **Translation Missing**: 显示英文默认文本
2. **Link Error**: 确保链接始终可点击，即使翻译缺失

## Testing Strategy

### Unit Tests

使用 Jest 进行单元测试：

1. **i18n Checker Tests**
   - 测试 `getAllKeys` 函数正确提取所有嵌套键
   - 测试 `compareTranslations` 正确识别缺失和多余的键
   - 测试报告生成格式正确

2. **SEO Module Tests**
   - 测试 hreflang 标签生成
   - 测试 canonical URL 生成
   - 测试结构化数据生成

### Property-Based Tests

使用 fast-check 进行属性测试：

1. **Translation Completeness Property**
   - 生成随机翻译对象，验证键比较逻辑
   - 最少 100 次迭代

2. **JSON Validity Property**
   - 验证所有翻译文件可被正确解析
   - 最少 100 次迭代

### Integration Tests

1. **End-to-End Language Switch**
   - 切换语言后验证所有 SEO 元素更新
   - 验证友情链接文本更新

2. **Footer Rendering**
   - 验证友情链接在所有语言下正确显示
   - 验证链接属性正确

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: ['js/**/*.js', 'scripts/**/*.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
};
```

### Property Test Annotation Format

每个属性测试必须包含以下注释：

```javascript
/**
 * Feature: i18n-seo-optimization
 * Property 1: Translation Key Completeness
 * Validates: Requirements 1.1, 2.1
 */
```
