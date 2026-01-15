# Implementation Plan: UX 优化 - 提高内容密度和导航效率

## Overview

本计划将优化 FinCalc 网站的用户体验，主要针对 PC 端内容密度低、导航不便的问题。采用渐进式实现，每个任务独立可测试。

## Tasks

- [x] 1. 首页 PC 端布局优化
  - [x] 1.1 修改 CSS 网格布局，PC 端改为 4 列
    - 修改 `.grid` 的 `grid-template-columns`
    - 添加媒体查询：>1200px 4列，992-1200px 3列
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 减小卡片尺寸和间距
    - `.calc-card` padding 从 28px 改为 20px
    - `.grid` gap 从 20px 改为 16px
    - `.calc-icon` 尺寸从 48px 改为 40px
    - _Requirements: 1.3, 1.4_

  - [x] 1.3 精简 Hero 区域
    - `.hero` padding 从 80px 改为 48px
    - 调整标题和副标题字号
    - _Requirements: 5.1, 5.2_

- [x] 2. Checkpoint - 验证首页优化
  - 在浏览器中测试首页，确认一屏可见 8+ 个计算器
  - 测试响应式布局在不同屏幕宽度下的表现

- [x] 3. 创建侧边栏导航组件
  - [x] 3.1 创建侧边栏 CSS 样式
    - 创建 `css/sidebar.css`
    - 定义侧边栏布局、分类样式、高亮状态
    - _Requirements: 2.1, 2.3_

  - [x] 3.2 创建侧边栏 HTML 模板
    - 创建 `includes/sidebar.html` 作为模板参考
    - 包含所有计算器分类和链接
    - _Requirements: 2.2, 2.4_

  - [x] 3.3 创建侧边栏 JavaScript
    - 创建 `js/sidebar.js`
    - 动态注入侧边栏 HTML
    - 自动高亮当前页面
    - _Requirements: 2.3_

- [x] 4. 计算器页面布局重构
  - [x] 4.1 修改计算器页面 CSS 布局
    - 添加 `.calc-page-with-sidebar` 布局类
    - PC 端：侧边栏 240px + 主内容区
    - 移动端：隐藏侧边栏
    - _Requirements: 2.1, 2.5_

  - [x] 4.2 更新 mortgage.html 作为模板
    - 添加侧边栏容器
    - 引入 sidebar.css 和 sidebar.js
    - 测试布局效果
    - _Requirements: 2.1, 2.2_

- [x] 5. Checkpoint - 验证侧边栏功能
  - 测试侧边栏在 PC 端的显示和高亮
  - 测试移动端侧边栏隐藏
  - 测试导航链接跳转

- [x] 6. 相关计算器推荐模块
  - [x] 6.1 创建相关计算器 CSS 样式
    - 在 `css/sidebar.css` 中添加 `.related-calculators` 样式
    - 紧凑的网格或列表布局
    - _Requirements: 3.2, 3.3_

  - [x] 6.2 定义计算器关联关系
    - 在 `js/sidebar.js` 中定义 `CALCULATOR_RELATIONS` 映射
    - 每个计算器关联 3-4 个相关工具
    - _Requirements: 3.1, 3.2_

  - [x] 6.3 动态生成相关计算器模块
    - 根据当前页面自动显示相关推荐
    - 放置在计算器结果区域下方
    - _Requirements: 3.1, 3.4_

- [x] 7. 面包屑导航优化
  - [x] 7.1 更新面包屑样式
    - 添加分类层级（首页 > 分类 > 计算器）
    - 确保每个层级可点击
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 7.2 在 sidebar.js 中自动生成面包屑
    - 根据当前页面和分类自动生成
    - _Requirements: 4.2_

- [x] 8. 批量更新所有计算器页面
  - [x] 8.1 创建更新脚本
    - 创建 `scripts/add-sidebar.js`
    - 自动为所有计算器页面添加侧边栏
    - _Requirements: 2.1, 2.2_

  - [x] 8.2 执行批量更新
    - 运行脚本更新所有 calculators/*.html
    - 验证每个页面的侧边栏和相关推荐
    - _Requirements: 2.1, 3.1_

- [x] 9. Final Checkpoint - 完整性验证
  - 测试所有计算器页面的侧边栏
  - 测试相关计算器推荐的准确性
  - 测试响应式布局
  - 测试面包屑导航

## Notes

- 所有 CSS 修改需要考虑深色模式兼容
- 侧边栏在移动端隐藏，不影响现有移动端体验
- 相关计算器推荐基于业务逻辑手动定义关联关系
- 批量更新脚本需要保留现有页面的自定义内容
