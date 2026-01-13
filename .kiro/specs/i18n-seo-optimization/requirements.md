# Requirements Document

## Introduction

本功能旨在优化 FinCalc 网站的国际化（i18n）覆盖率和多语言 SEO，同时添加友情链接以增加流量和收入。目标是确保所有语言版本的页面都有完整的翻译，并针对各语言搜索引擎进行 SEO 优化，在不影响英文 SEO 的前提下提升其他语言的搜索排名。

## Glossary

- **I18n_System**: FinCalc 的国际化系统，负责管理多语言翻译和语言切换
- **Translation_File**: 存储在 `js/i18n/` 目录下的 JSON 翻译文件
- **SEO_Module**: 负责搜索引擎优化的 JavaScript 模块 (`js/seo.js`)
- **Hreflang_Tag**: HTML 中用于指示页面语言版本的标签
- **Structured_Data**: Schema.org 格式的结构化数据，帮助搜索引擎理解页面内容
- **Footer_Component**: 网站底部组件，包含版权信息、链接和免责声明
- **Friend_Link**: 友情链接，指向合作网站的外部链接

## Requirements

### Requirement 1: i18n 翻译完整性检查

**User Story:** As a 网站管理员, I want 检查所有语言翻译文件的完整性, so that 确保所有页面在各语言下都能正确显示。

#### Acceptance Criteria

1. THE I18n_System SHALL 提供一个翻译键对比功能，以英文翻译文件为基准
2. WHEN 运行翻译检查脚本时, THE I18n_System SHALL 输出每个语言文件缺失的翻译键列表
3. THE I18n_System SHALL 支持以下 10 种语言：en, es, zh, de, fr, pt, ja, ko, ar, hi
4. WHEN 发现缺失翻译时, THE I18n_System SHALL 生成包含缺失键和建议翻译的报告

### Requirement 2: 补全缺失的 i18n 翻译

**User Story:** As a 网站管理员, I want 补全所有缺失的翻译, so that 用户在任何语言下都能获得完整的体验。

#### Acceptance Criteria

1. THE Translation_File SHALL 包含与英文文件相同的所有翻译键
2. WHEN 添加新翻译时, THE Translation_File SHALL 使用目标语言的本地化表达
3. THE Translation_File SHALL 保持 JSON 格式的有效性和一致的缩进风格
4. WHEN 翻译涉及货币、日期或数字格式时, THE Translation_File SHALL 使用该语言地区的本地化格式说明

### Requirement 3: 多语言 SEO 元数据优化

**User Story:** As a 网站管理员, I want 为每种语言优化 SEO 元数据, so that 各语言版本的页面能在对应语言的搜索引擎中获得更好的排名。

#### Acceptance Criteria

1. THE SEO_Module SHALL 为每种语言生成本地化的 meta title 和 description
2. THE SEO_Module SHALL 在 HTML head 中包含正确的 hreflang 标签
3. WHEN 页面语言改变时, THE SEO_Module SHALL 动态更新 Open Graph 和 Twitter Card 元数据
4. THE SEO_Module SHALL 为每种语言生成本地化的 Schema.org 结构化数据
5. THE SEO_Module SHALL 保持英文版本的现有 SEO 配置不变

### Requirement 4: 多语言结构化数据

**User Story:** As a 网站管理员, I want 为每种语言提供本地化的结构化数据, so that 搜索引擎能更好地理解各语言版本的内容。

#### Acceptance Criteria

1. THE SEO_Module SHALL 根据当前语言生成对应的 Organization schema
2. THE SEO_Module SHALL 根据当前语言生成本地化的 WebSite schema
3. THE SEO_Module SHALL 根据当前语言生成本地化的 BreadcrumbList schema
4. WHEN 语言为非英语时, THE SEO_Module SHALL 在结构化数据中包含 inLanguage 属性

### Requirement 5: 添加友情链接

**User Story:** As a 网站管理员, I want 在页面底部添加友情链接, so that 可以与其他网站互换流量并提升 SEO。

#### Acceptance Criteria

1. THE Footer_Component SHALL 在底部显示友情链接区域
2. THE Footer_Component SHALL 包含指向 https://qrmaker.life/ 的链接
3. THE Friend_Link SHALL 使用 `rel="noopener"` 属性以确保安全性
4. THE Friend_Link SHALL 在新标签页中打开（`target="_blank"`）
5. THE Footer_Component SHALL 支持友情链接文本的多语言翻译
6. THE Friend_Link SHALL 使用适当的锚文本以利于 SEO

### Requirement 6: 多语言 URL 和 Canonical 标签

**User Story:** As a 网站管理员, I want 确保多语言页面有正确的 URL 结构和 canonical 标签, so that 搜索引擎不会将不同语言版本视为重复内容。

#### Acceptance Criteria

1. THE SEO_Module SHALL 为每个语言版本生成正确的 canonical URL
2. THE SEO_Module SHALL 在所有语言版本中包含完整的 hreflang 标签集
3. THE SEO_Module SHALL 包含 `x-default` hreflang 标签指向英文版本
4. WHEN 用户访问非英语页面时, THE SEO_Module SHALL 确保 canonical 标签指向当前语言版本

### Requirement 7: i18n 翻译文件的 SEO 相关键

**User Story:** As a 网站管理员, I want 在翻译文件中添加 SEO 相关的翻译键, so that 每种语言都有优化的 SEO 文本。

#### Acceptance Criteria

1. THE Translation_File SHALL 包含 `seo.title` 键用于页面标题
2. THE Translation_File SHALL 包含 `seo.description` 键用于 meta description
3. THE Translation_File SHALL 包含 `seo.keywords` 键用于关键词（如适用）
4. THE Translation_File SHALL 包含 `footer.friendLinks` 键用于友情链接区域标题
5. WHEN SEO 文本被翻译时, THE Translation_File SHALL 使用该语言的高搜索量关键词
