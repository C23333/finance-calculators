# Requirements Document

## Introduction

优化 FinCalc 网站的用户体验，提高 PC 端内容密度和页面导航效率，减少用户滚动次数，增加用户留存率。

## Glossary

- **Homepage**: 网站首页，展示所有计算器分类和入口
- **Calculator_Page**: 单个计算器页面，如 mortgage.html
- **Sidebar**: 侧边栏导航，显示计算器分类和快速跳转
- **Related_Calculators**: 相关计算器推荐模块
- **Breadcrumb**: 面包屑导航，显示当前页面层级

## Requirements

### Requirement 1: 首页 PC 端布局优化

**User Story:** As a PC 用户, I want 在一屏内看到更多计算器选项, so that 我能快速找到需要的工具而不用频繁滚动。

#### Acceptance Criteria

1. WHEN 屏幕宽度大于 1200px, THE Homepage SHALL 以 4 列网格展示计算器卡片
2. WHEN 屏幕宽度在 992px-1200px 之间, THE Homepage SHALL 以 3 列网格展示计算器卡片
3. THE Calculator_Card SHALL 减小 padding 至 20px，使单卡片更紧凑
4. THE Grid SHALL 减小 gap 至 16px，提高内容密度
5. THE Homepage SHALL 在首屏（无滚动）展示至少 8 个计算器卡片

### Requirement 2: 计算器页面侧边栏导航

**User Story:** As a 用户, I want 在计算器页面看到所有其他计算器的快速入口, so that 我能方便地切换到其他工具。

#### Acceptance Criteria

1. WHEN 屏幕宽度大于 1024px, THE Calculator_Page SHALL 显示左侧固定侧边栏
2. THE Sidebar SHALL 包含所有计算器分类和链接
3. THE Sidebar SHALL 高亮显示当前所在的计算器
4. THE Sidebar SHALL 包含返回首页的链接
5. WHEN 屏幕宽度小于 1024px, THE Sidebar SHALL 隐藏，保持原有布局

### Requirement 3: 相关计算器推荐

**User Story:** As a 用户, I want 在使用计算器后看到相关工具推荐, so that 我能发现其他有用的计算器。

#### Acceptance Criteria

1. THE Calculator_Page SHALL 在计算器下方显示 Related_Calculators 模块
2. THE Related_Calculators SHALL 显示 3-4 个与当前计算器相关的工具
3. THE Related_Calculators SHALL 以紧凑的列表或网格形式展示
4. WHEN 用户点击相关计算器, THE System SHALL 在当前标签页跳转

### Requirement 4: 面包屑导航优化

**User Story:** As a 用户, I want 清楚知道当前页面在网站中的位置, so that 我能方便地返回上级页面。

#### Acceptance Criteria

1. THE Calculator_Page SHALL 显示完整的面包屑导航
2. THE Breadcrumb SHALL 包含：首页 > 分类名 > 计算器名
3. THE Breadcrumb SHALL 每个层级都可点击跳转
4. THE Breadcrumb SHALL 在移动端也保持可见

### Requirement 5: Hero 区域精简

**User Story:** As a 用户, I want 首页 Hero 区域更紧凑, so that 我能更快看到计算器列表。

#### Acceptance Criteria

1. THE Hero_Section SHALL 减小 padding 至 48px（原 80px）
2. THE Hero_Section SHALL 保持标题和副标题的可读性
3. THE Hero_Section SHALL 在移动端保持适当的视觉效果
