# Requirements Document

## Introduction

本文档定义了一个通用的自动翻译工具（Auto Translation Tool）的需求。该工具旨在帮助开发者自动化i18n翻译流程，通过接入Google Translate等翻译API，自动检测并翻译缺失的翻译条目。该工具设计为通用插件，可复用于多个类似的矩阵网站项目。

## Glossary

- **Translation_Tool**: 自动翻译工具的核心模块，负责协调翻译流程
- **Translation_Provider**: 翻译服务提供商接口（如Google Translate、DeepL等）
- **Source_Locale**: 源语言文件（通常为英语en.json）
- **Target_Locale**: 目标语言文件（如zh.json、es.json等）
- **Translation_Key**: JSON翻译文件中的键路径（如"calculators.mortgage.title"）
- **Missing_Translation**: 目标语言中缺失或未翻译的条目（值与源语言相同）
- **Translation_Cache**: 翻译缓存，用于避免重复翻译相同内容
- **Config_File**: 配置文件，定义翻译API密钥、语言列表等设置

## Requirements

### Requirement 1: 翻译缺失检测

**User Story:** As a developer, I want to automatically detect missing translations in my i18n files, so that I can identify which content needs to be translated.

#### Acceptance Criteria

1. WHEN the Translation_Tool scans a Target_Locale file, THE Translation_Tool SHALL compare each Translation_Key with the Source_Locale and identify entries where the value is identical to the source (indicating untranslated content)
2. WHEN the Translation_Tool scans a Target_Locale file, THE Translation_Tool SHALL identify entries that exist in Source_Locale but are missing in Target_Locale
3. WHEN the Translation_Tool completes scanning, THE Translation_Tool SHALL generate a report listing all Missing_Translations with their key paths and source values
4. THE Translation_Tool SHALL support nested JSON structures with dot-notation key paths (e.g., "calculators.mortgage.title")

### Requirement 2: 多翻译服务提供商支持

**User Story:** As a developer, I want to use different translation APIs, so that I can choose the best service for my needs and budget.

#### Acceptance Criteria

1. THE Translation_Tool SHALL define a Translation_Provider interface that abstracts translation service implementations
2. WHEN a Translation_Provider is configured, THE Translation_Tool SHALL use that provider for all translation requests
3. THE Translation_Tool SHALL support Google Translate API as a built-in Translation_Provider
4. THE Translation_Tool SHALL support DeepL API as a built-in Translation_Provider
5. WHERE a custom Translation_Provider is needed, THE Translation_Tool SHALL allow developers to implement and register custom providers
6. IF a Translation_Provider API call fails, THEN THE Translation_Tool SHALL retry up to 3 times with exponential backoff before reporting an error

### Requirement 3: 批量翻译执行

**User Story:** As a developer, I want to translate all missing entries in batch, so that I can efficiently complete translations without manual intervention.

#### Acceptance Criteria

1. WHEN the Translation_Tool executes batch translation, THE Translation_Tool SHALL translate all Missing_Translations for a specified Target_Locale
2. WHEN translating multiple entries, THE Translation_Tool SHALL respect API rate limits by implementing configurable delays between requests
3. WHEN a translation is completed, THE Translation_Tool SHALL update the Target_Locale file with the translated value
4. THE Translation_Tool SHALL preserve the original JSON structure and formatting when writing updates
5. WHEN batch translation completes, THE Translation_Tool SHALL report the number of successful translations, failures, and skipped entries

### Requirement 4: 翻译缓存机制

**User Story:** As a developer, I want translations to be cached, so that I don't pay for translating the same content multiple times across projects.

#### Acceptance Criteria

1. WHEN a translation is completed, THE Translation_Tool SHALL store the result in Translation_Cache with source text, target language, and translated text
2. WHEN translating content, THE Translation_Tool SHALL first check Translation_Cache for existing translations before calling the Translation_Provider
3. IF a cached translation exists, THEN THE Translation_Tool SHALL use the cached value without calling the Translation_Provider
4. THE Translation_Tool SHALL support configurable cache storage (file-based or memory-based)
5. WHERE cache invalidation is needed, THE Translation_Tool SHALL provide a command to clear the cache for specific languages or all languages

### Requirement 5: 配置管理

**User Story:** As a developer, I want to configure the translation tool through a config file, so that I can easily customize settings for different projects.

#### Acceptance Criteria

1. THE Translation_Tool SHALL read configuration from a Config_File (translation.config.json or similar)
2. THE Config_File SHALL support specifying the Translation_Provider type and API credentials
3. THE Config_File SHALL support specifying the source locale and list of target locales
4. THE Config_File SHALL support specifying the path pattern for i18n files (e.g., "js/i18n/{locale}.json")
5. THE Config_File SHALL support specifying rate limit settings (requests per second, delay between batches)
6. IF the Config_File is missing required fields, THEN THE Translation_Tool SHALL report clear error messages indicating which fields are missing

### Requirement 6: 命令行接口

**User Story:** As a developer, I want to run the translation tool from the command line, so that I can integrate it into my build process and CI/CD pipeline.

#### Acceptance Criteria

1. THE Translation_Tool SHALL provide a CLI command to scan and report Missing_Translations
2. THE Translation_Tool SHALL provide a CLI command to translate all Missing_Translations for specified Target_Locales
3. THE Translation_Tool SHALL provide a CLI command to translate Missing_Translations for a single Target_Locale
4. THE Translation_Tool SHALL provide a CLI command to validate that all Target_Locales have complete translations
5. WHEN running CLI commands, THE Translation_Tool SHALL display progress information including current file, translation count, and estimated time remaining
6. THE Translation_Tool SHALL support a --dry-run flag that shows what would be translated without making actual changes

### Requirement 7: 翻译质量保障

**User Story:** As a developer, I want to ensure translation quality, so that my users have a good experience in their native language.

#### Acceptance Criteria

1. THE Translation_Tool SHALL preserve placeholder variables in translations (e.g., "{amount}", "{year}")
2. WHEN a translation contains placeholders, THE Translation_Tool SHALL verify that all placeholders from the source are present in the translation
3. IF a translation is missing placeholders, THEN THE Translation_Tool SHALL log a warning and optionally skip the translation
4. THE Translation_Tool SHALL preserve HTML tags in translations when present in the source
5. THE Translation_Tool SHALL support a review mode that outputs translations for human review before applying them

### Requirement 8: 增量翻译支持

**User Story:** As a developer, I want to only translate new or changed content, so that I can efficiently update translations when source content changes.

#### Acceptance Criteria

1. WHEN the Source_Locale is updated with new keys, THE Translation_Tool SHALL detect and translate only the new keys
2. WHEN the Source_Locale value for an existing key changes, THE Translation_Tool SHALL flag the key for re-translation
3. THE Translation_Tool SHALL maintain a hash of source values to detect changes
4. WHEN running incremental translation, THE Translation_Tool SHALL report which keys are new, changed, or unchanged

### Requirement 9: 错误处理与日志

**User Story:** As a developer, I want comprehensive error handling and logging, so that I can troubleshoot issues and track translation progress.

#### Acceptance Criteria

1. IF a Translation_Provider returns an error, THEN THE Translation_Tool SHALL log the error with the Translation_Key and error details
2. IF a file read or write operation fails, THEN THE Translation_Tool SHALL report the file path and error reason
3. THE Translation_Tool SHALL support configurable log levels (debug, info, warn, error)
4. WHEN batch translation encounters errors, THE Translation_Tool SHALL continue processing remaining entries and report all errors at the end
5. THE Translation_Tool SHALL generate a translation report file with detailed results for each translation attempt
