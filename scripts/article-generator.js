/**
 * Article Generator - 使用本地 Claude/Codex CLI 自动生成文章
 *
 * 配置说明:
 *   - 在 config/cli-config.json 中配置你的 CLI 命令
 *   - 或通过环境变量 AI_CLI_COMMAND 设置
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');
const CONFIG_DIR = path.join(PROJECT_ROOT, 'config');

// 默认配置
const DEFAULT_CONFIG = {
    // CLI 命令，可以是 'claude', 'codex', 或完整路径
    cliCommand: process.env.AI_CLI_COMMAND || 'claude',
    // 传递 prompt 的方式: 'file', 'stdin', 'arg'
    promptMode: 'stdin',
    // 额外参数
    extraArgs: ['--print'],
    // 超时 (毫秒)
    timeout: 600000,  // 10 分钟
    // 每篇文章之间的延迟 (毫秒)
    delay: 3000
};

/**
 * 加载配置
 */
function loadConfig() {
    const configPath = path.join(CONFIG_DIR, 'cli-config.json');
    if (fs.existsSync(configPath)) {
        try {
            const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            return { ...DEFAULT_CONFIG, ...userConfig };
        } catch (e) {
            console.warn('⚠️ 配置文件解析失败，使用默认配置');
        }
    }
    return DEFAULT_CONFIG;
}

/**
 * 调用 AI CLI 生成内容
 */
function callAICLI(prompt, config) {
    const { cliCommand, promptMode, extraArgs, timeout } = config;

    console.log(`📤 调用: ${cliCommand}`);

    let result;

    try {
        if (promptMode === 'stdin') {
            // 通过 stdin 传递 prompt
            result = spawnSync(cliCommand, extraArgs, {
                input: prompt,
                encoding: 'utf-8',
                timeout: timeout,
                maxBuffer: 50 * 1024 * 1024,
                shell: true
            });
        } else if (promptMode === 'arg') {
            // 通过命令行参数传递
            const args = [...extraArgs, '-p', prompt];
            result = spawnSync(cliCommand, args, {
                encoding: 'utf-8',
                timeout: timeout,
                maxBuffer: 50 * 1024 * 1024,
                shell: true
            });
        } else if (promptMode === 'file') {
            // 通过临时文件传递
            const tempFile = path.join(OUTPUT_DIR, 'temp-prompt.md');
            fs.writeFileSync(tempFile, prompt);
            const args = [...extraArgs, tempFile];
            result = spawnSync(cliCommand, args, {
                encoding: 'utf-8',
                timeout: timeout,
                maxBuffer: 50 * 1024 * 1024,
                shell: true
            });
        }

        if (result.error) {
            throw result.error;
        }

        if (result.status !== 0) {
            console.error('CLI stderr:', result.stderr);
            throw new Error(`CLI 返回非零状态码: ${result.status}`);
        }

        return result.stdout;

    } catch (error) {
        console.error(`❌ CLI 调用失败: ${error.message}`);
        return null;
    }
}

/**
 * 构建完整的 prompt
 */
function buildPrompt(newsItem) {
    const templatePath = path.join(CONFIG_DIR, 'prompts', 'step3-polish.md');
    let template = fs.readFileSync(templatePath, 'utf-8');

    const articleContent = `
## 新闻信息

**标题**: ${newsItem.title}
**来源**: ${newsItem.source}
**链接**: ${newsItem.link}
**发布时间**: ${newsItem.pubDate || 'N/A'}
**摘要**: ${newsItem.description || '无摘要'}

## 分类信息

**类别**: ${newsItem.category || 'general'}
**相关计算器**: ${newsItem.relatedCalculators ? newsItem.relatedCalculators.join(', ') : '无'}
**关键词**: ${newsItem.keywords ? newsItem.keywords.join(', ') : '无'}
`;

    // 替换模板变量
    template = template
        .replace('{REVIEWED_ARTICLE}', articleContent)
        .replace('{TOPIC}', newsItem.title)
        .replace('{CATEGORY}', newsItem.category || 'Finance')
        .replace('{CALCULATOR}', newsItem.relatedCalculators?.[0] || 'mortgage')
        .replace('{RELATED_CALCULATORS}', (newsItem.relatedCalculators || []).join(', '))
        .replace('{DATE}', new Date().toISOString().split('T')[0]);

    // 添加 JSON 输出指令
    template += `

---

**重要输出要求**:
1. 输出必须是有效的 JSON 格式
2. 不要添加任何 markdown 代码块标记 (\`\`\`)
3. 必须包含 interactiveTools 互动工具
4. 必须包含 sources 资料来源
5. 必须包含 recommendedReading 推荐阅读
6. 必须包含 suggestedSearches 推荐搜索

请直接输出 JSON:
`;

    return template;
}

/**
 * 解析 AI 输出为 JSON
 */
function parseOutput(output) {
    if (!output) return null;

    let content = output.trim();

    // 移除可能的 markdown 代码块
    if (content.startsWith('```json')) {
        content = content.slice(7);
    }
    if (content.startsWith('```')) {
        content = content.slice(3);
    }
    if (content.endsWith('```')) {
        content = content.slice(0, -3);
    }

    // 尝试找到 JSON 对象的开始和结束
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1) {
        content = content.slice(jsonStart, jsonEnd + 1);
    }

    try {
        return JSON.parse(content);
    } catch (e) {
        console.error('⚠️ JSON 解析失败:', e.message);
        // 返回原始内容以便调试
        return { raw: output, parseError: e.message };
    }
}

/**
 * 生成 URL 友好的 slug
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50)
        .replace(/-$/, '');
}

/**
 * 睡眠
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 主函数：批量生成文章
 */
async function generateArticles(date, limit = 3) {
    const config = loadConfig();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          文章生成器 - Article Generator                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📅 日期: ${date}`);
    console.log(`📝 数量: ${limit} 篇`);
    console.log(`🔧 CLI: ${config.cliCommand}`);
    console.log();

    // 读取新闻数据
    const newsPath = path.join(OUTPUT_DIR, 'news', `news-${date}.json`);
    if (!fs.existsSync(newsPath)) {
        console.error(`❌ 新闻文件不存在: ${newsPath}`);
        console.log('请先运行 news-fetcher.js');
        return [];
    }

    const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));
    const articles = (newsData.articles || [])
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, limit);

    if (articles.length === 0) {
        console.log('⚠️ 没有找到新闻文章');
        return [];
    }

    console.log(`📰 选中 ${articles.length} 篇新闻进行处理\n`);

    // 确保输出目录存在
    const articlesDir = path.join(OUTPUT_DIR, 'articles');
    if (!fs.existsSync(articlesDir)) {
        fs.mkdirSync(articlesDir, { recursive: true });
    }

    const results = [];

    for (let i = 0; i < articles.length; i++) {
        const newsItem = articles[i];
        const shortTitle = newsItem.title.substring(0, 50);

        console.log(`\n[${i + 1}/${articles.length}] ${shortTitle}...`);
        console.log('-'.repeat(60));

        // 构建 prompt
        const prompt = buildPrompt(newsItem);

        // 调用 AI CLI
        const output = callAICLI(prompt, config);

        if (output) {
            // 解析输出
            const articleData = parseOutput(output);

            // 生成文件名和保存
            const slug = generateSlug(newsItem.title);
            const filename = `final-${slug}.json`;
            const filepath = path.join(articlesDir, filename);

            fs.writeFileSync(filepath, JSON.stringify(articleData, null, 2), 'utf-8');
            console.log(`✅ 已保存: ${filename}`);

            results.push({
                success: true,
                filename,
                title: newsItem.title
            });
        } else {
            console.log(`❌ 生成失败`);
            results.push({
                success: false,
                title: newsItem.title,
                error: '无输出'
            });
        }

        // 延迟
        if (i < articles.length - 1 && config.delay > 0) {
            console.log(`⏳ 等待 ${config.delay / 1000} 秒...`);
            await sleep(config.delay);
        }
    }

    // 输出摘要
    console.log('\n' + '='.repeat(60));
    console.log('📊 生成摘要:');
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    console.log(`  ✅ 成功: ${successCount}`);
    console.log(`  ❌ 失败: ${failCount}`);
    console.log('='.repeat(60));

    return results;
}

// CLI 运行
if (require.main === module) {
    const args = process.argv.slice(2);
    const date = args[0] || new Date().toISOString().split('T')[0];
    const limit = parseInt(args[1]) || 3;

    generateArticles(date, limit)
        .then(results => {
            if (results.filter(r => r.success).length === 0) {
                process.exit(1);
            }
        })
        .catch(err => {
            console.error('错误:', err.message);
            process.exit(1);
        });
}

module.exports = { generateArticles, buildPrompt, parseOutput };
