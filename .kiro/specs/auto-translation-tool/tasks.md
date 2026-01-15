# Implementation Plan: Auto Translation Tool

## Overview

本实现计划将自动翻译工具分解为可执行的编码任务。采用 TypeScript 实现，使用 Node.js 运行时，作为独立的 npm 包发布。每个任务都是增量的，构建在前一个任务的基础上。

## Tasks

- [x] 1. 项目初始化和核心接口定义
  - [x] 1.1 创建项目结构和 package.json
    - 初始化 npm 项目，配置 TypeScript
    - 安装依赖：typescript, fast-check, vitest, commander
    - 创建 tsconfig.json 和基本目录结构
    - _Requirements: 5.1, 6.1_

  - [x] 1.2 定义 TranslationProvider 接口
    - 创建 `src/providers/provider.interface.ts`
    - 定义 translate, translateBatch, isAvailable 方法
    - 定义相关类型（TranslationResult, ProviderConfig）
    - _Requirements: 2.1_

  - [x] 1.3 定义配置类型和数据模型
    - 创建 `src/types/config.ts` 定义 TranslationConfig 接口
    - 创建 `src/types/models.ts` 定义 MissingTranslation, BatchResult 等
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. JSON 文件处理模块
  - [x] 2.1 实现 JsonFileHandler 类
    - 创建 `src/handlers/json-handler.ts`
    - 实现 read, write, flatten, unflatten 方法
    - 支持嵌套 JSON 结构的点分隔键路径
    - _Requirements: 1.4, 3.4_

  - [x] 2.2 编写 JSON 往返属性测试
    - **Property 1: JSON Flatten/Unflatten Round Trip**
    - **Validates: Requirements 1.4**

  - [x] 2.3 实现 updateKey 方法
    - 支持更新特定键的值而不影响其他内容
    - 保持原有 JSON 格式和缩进
    - _Requirements: 3.3, 3.4_

- [x] 3. 翻译扫描器模块
  - [x] 3.1 实现 TranslationScanner 类
    - 创建 `src/scanner/scanner.ts`
    - 实现 scan 方法比较源文件和目标文件
    - 检测缺失的键和未翻译的条目（值相同）
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 编写扫描完整性属性测试
    - **Property 2: Missing Translation Detection Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 3.3 实现 scanAll 和 generateReport 方法
    - 扫描所有目标语言
    - 生成包含统计信息的扫描报告
    - _Requirements: 1.3_

- [x] 4. 缓存管理模块
  - [x] 4.1 实现 CacheManager 类
    - 创建 `src/cache/cache-manager.ts`
    - 实现 get, set, has, clear 方法
    - 使用 MD5 哈希作为缓存键
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.2 编写缓存行为属性测试
    - **Property 4: Cache Prevents Redundant API Calls**
    - **Property 5: Cache Clear Effectiveness**
    - **Validates: Requirements 4.2, 4.3, 4.5**

  - [x] 4.3 实现缓存持久化
    - 实现 save 和 load 方法
    - 支持文件存储和内存存储
    - _Requirements: 4.4_

- [x] 5. Checkpoint - 核心模块验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 6. 翻译服务提供商实现
  - [x] 6.1 实现 Google Translate Provider
    - 创建 `src/providers/google-provider.ts`
    - 使用 google-translate-api-x 库（免费API）
    - 实现 translate 和 translateBatch 方法
    - _Requirements: 2.3_

  - [x] 6.2 实现 DeepL Provider
    - 创建 `src/providers/deepl-provider.ts`
    - 使用 DeepL API
    - 支持 Free 和 Pro API 端点
    - _Requirements: 2.4_

  - [x] 6.3 实现重试机制
    - 创建 `src/utils/retry.ts`
    - 实现指数退避重试逻辑
    - 最多重试3次
    - _Requirements: 2.6_

  - [x] 6.4 编写重试行为属性测试
    - **Property 8: Retry Behavior on Failure**
    - **Validates: Requirements 2.6**

- [x] 7. 翻译执行器模块
  - [x] 7.1 实现 TranslationExecutor 类
    - 创建 `src/executor/executor.ts`
    - 实现 translateEntry 方法
    - 集成缓存检查
    - _Requirements: 3.1, 4.2_

  - [x] 7.2 实现批量翻译和速率限制
    - 实现 translateBatch 方法
    - 添加可配置的请求间隔
    - _Requirements: 3.2_

  - [x] 7.3 编写批量翻译属性测试
    - **Property 3: Batch Translation Completeness**
    - **Property 9: Rate Limit Compliance**
    - **Validates: Requirements 3.1, 3.2, 3.5**

  - [x] 7.4 实现 executeAndSave 方法
    - 执行翻译并更新目标文件
    - 生成执行报告
    - _Requirements: 3.3, 3.5_

  - [x] 7.5 编写文件更新属性测试
    - **Property 10: File Update Correctness**
    - **Validates: Requirements 3.3, 3.4**

- [x] 8. 翻译质量保障模块
  - [x] 8.1 实现占位符检测和保留
    - 创建 `src/quality/placeholder-handler.ts`
    - 检测 {var}, {{var}}, %s, %d 等占位符
    - 验证翻译后占位符完整性
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 8.2 编写占位符保留属性测试
    - **Property 6: Placeholder Preservation**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [x] 8.3 实现 HTML 标签保留
    - 创建 `src/quality/html-handler.ts`
    - 检测和验证 HTML 标签结构
    - _Requirements: 7.4_

  - [x] 8.4 编写 HTML 标签保留属性测试
    - **Property 7: HTML Tag Preservation**
    - **Validates: Requirements 7.4**

- [x] 9. Checkpoint - 翻译功能验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 10. 配置管理模块
  - [x] 10.1 实现 ConfigManager 类
    - 创建 `src/config/config-manager.ts`
    - 实现 load 和 validate 方法
    - 支持默认配置文件路径
    - _Requirements: 5.1, 5.6_

  - [x] 10.2 编写配置验证属性测试
    - **Property 13: Config Validation Error Messages**
    - **Validates: Requirements 5.6**

  - [x] 10.3 实现 createDefault 方法
    - 生成默认配置文件模板
    - _Requirements: 5.1_

- [x] 11. 增量翻译支持
  - [x] 11.1 实现源文件变更检测
    - 创建 `src/incremental/change-detector.ts`
    - 维护源值哈希记录
    - 检测新增、变更、未变更的键
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 11.2 编写增量检测属性测试
    - **Property 12: Incremental Detection Accuracy**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [x] 11.3 实现增量翻译报告
    - 报告新增、变更、未变更的键分类
    - _Requirements: 8.4_

- [x] 12. 错误处理和日志模块
  - [x] 12.1 实现自定义错误类
    - 创建 `src/errors/index.ts`
    - 定义 TranslationProviderError, FileOperationError, ConfigurationError
    - _Requirements: 9.1, 9.2_

  - [x] 12.2 实现日志管理器
    - 创建 `src/logger/logger.ts`
    - 支持 debug, info, warn, error 级别
    - 支持文件输出
    - _Requirements: 9.3_

  - [x] 12.3 编写错误处理属性测试
    - **Property 14: Error Logging Completeness**
    - **Property 15: Batch Error Resilience**
    - **Validates: Requirements 9.1, 9.2, 9.4**

  - [x] 12.4 实现翻译报告生成器
    - 创建 `src/reporter/reporter.ts`
    - 生成详细的翻译结果报告
    - _Requirements: 9.5_

- [x] 13. CLI 命令实现
  - [x] 13.1 实现 CLI 入口和 scan 命令
    - 创建 `src/cli/index.ts`
    - 使用 commander 库
    - 实现 scan 命令显示缺失翻译
    - _Requirements: 6.1_

  - [x] 13.2 实现 translate 命令
    - 支持 --locale, --dry-run, --force 参数
    - 显示翻译进度
    - _Requirements: 6.2, 6.3_

  - [x] 13.3 编写 dry-run 属性测试
    - **Property 11: Dry Run No Side Effects**
    - **Validates: Requirements 6.6**

  - [x] 13.4 实现 validate 命令
    - 验证翻译完整性
    - 支持 --strict 模式
    - _Requirements: 6.4_

  - [x] 13.5 实现 init 和 cache 命令
    - init: 创建默认配置文件
    - cache: 管理缓存（clear, stats, export）
    - _Requirements: 4.5_

- [x] 14. Checkpoint - CLI 功能验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 15. 集成和文档
  - [x] 15.1 创建 npm 包入口
    - 创建 `src/index.ts` 导出公共 API
    - 配置 package.json 的 bin 和 main 字段
    - _Requirements: 2.5_

  - [x] 15.2 编写 README 文档
    - 安装说明
    - 配置文件示例
    - CLI 命令使用说明
    - 自定义 Provider 开发指南

  - [x] 15.3 创建示例配置文件
    - 创建 `examples/translation.config.json`
    - 包含所有配置选项的注释说明

- [x] 16. Final Checkpoint - 完整功能验证
  - 确保所有测试通过
  - 验证 CLI 命令可正常执行
  - 如有问题请询问用户

## Notes

- 所有任务均为必需，包括属性测试任务
- 每个任务都引用了具体的需求条目以确保可追溯性
- Checkpoint 任务用于阶段性验证，确保增量开发的正确性
- 属性测试使用 fast-check 库，每个测试至少运行 100 次迭代
