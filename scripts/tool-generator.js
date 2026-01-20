#!/usr/bin/env node
/**
 * 互动工具生成器
 * 根据文章内容自动生成迷你计算器和互动工具
 *
 * 工具类型：
 * - rate-calculator: 利率/费率计算器
 * - policy-checker: 政策影响检查器
 * - eligibility-checker: 资格检查器
 * - savings-estimator: 节省估算器
 * - comparison-tool: 对比工具
 * - quiz: 知识测验
 */

const fs = require('fs');
const path = require('path');

// 路径配置
const PROJECT_ROOT = path.join(__dirname, '..');
const TOOLS_DIR = path.join(PROJECT_ROOT, 'tools');
const TOOLS_CONFIG_PATH = path.join(PROJECT_ROOT, 'config', 'tools-registry.json');
const TEMPLATE_DIR = path.join(PROJECT_ROOT, 'templates', 'tools');

/**
 * 工具类型定义
 */
const TOOL_TYPES = {
    'rate-calculator': {
        name: '利率计算器',
        description: '计算不同利率下的费用/收益',
        inputs: ['principal', 'rate', 'term'],
        template: 'rate-calculator.html'
    },
    'policy-checker': {
        name: '政策影响检查器',
        description: '检查政策是否影响你',
        inputs: ['income', 'age', 'status'],
        template: 'policy-checker.html'
    },
    'eligibility-checker': {
        name: '资格检查器',
        description: '检查你是否符合条件',
        inputs: ['criteria'],
        template: 'eligibility-checker.html'
    },
    'savings-estimator': {
        name: '节省估算器',
        description: '估算你能节省多少',
        inputs: ['currentValue', 'newValue'],
        template: 'savings-estimator.html'
    },
    'comparison-tool': {
        name: '对比工具',
        description: '对比不同选项',
        inputs: ['options'],
        template: 'comparison-tool.html'
    },
    'impact-calculator': {
        name: '影响计算器',
        description: '计算对你的具体影响',
        inputs: ['personalData'],
        template: 'impact-calculator.html'
    },
    'quiz': {
        name: '知识测验',
        description: '测试你对这个主题的了解',
        inputs: ['questions'],
        template: 'quiz.html'
    }
};

/**
 * 根据文章内容检测应该生成什么工具
 */
function detectToolType(articleData) {
    const content = JSON.stringify(articleData).toLowerCase();
    const tools = [];

    // 利率相关
    if (content.includes('interest rate') || content.includes('mortgage rate') ||
        content.includes('fed rate') || content.includes('apr') || content.includes('apy')) {
        tools.push({
            type: 'rate-calculator',
            reason: '文章涉及利率变化',
            priority: 1
        });
    }

    // 政策相关
    if (content.includes('policy') || content.includes('law') || content.includes('regulation') ||
        content.includes('irs') || content.includes('new rule') || content.includes('legislation')) {
        tools.push({
            type: 'policy-checker',
            reason: '文章涉及政策变化',
            priority: 1
        });
    }

    // 资格/条件相关
    if (content.includes('eligible') || content.includes('qualify') || content.includes('requirement') ||
        content.includes('income limit') || content.includes('credit score')) {
        tools.push({
            type: 'eligibility-checker',
            reason: '文章涉及资格条件',
            priority: 2
        });
    }

    // 节省/比较相关
    if (content.includes('save') || content.includes('saving') || content.includes('reduce') ||
        content.includes('cut cost') || content.includes('lower')) {
        tools.push({
            type: 'savings-estimator',
            reason: '文章涉及费用节省',
            priority: 2
        });
    }

    // 对比相关
    if (content.includes(' vs ') || content.includes('versus') || content.includes('compare') ||
        content.includes('difference between') || content.includes('which is better')) {
        tools.push({
            type: 'comparison-tool',
            reason: '文章涉及选项对比',
            priority: 2
        });
    }

    // 影响计算
    if (content.includes('affect you') || content.includes('impact') || content.includes('how much') ||
        content.includes('your situation')) {
        tools.push({
            type: 'impact-calculator',
            reason: '文章涉及个人影响',
            priority: 1
        });
    }

    return tools.sort((a, b) => a.priority - b.priority);
}

/**
 * 生成工具配置
 */
function generateToolConfig(toolType, articleData, customConfig = {}) {
    const baseConfig = {
        id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: toolType,
        createdAt: new Date().toISOString(),
        articleSlug: articleData.metadata?.slug || '',
        showOnHomepage: false, // 默认不在首页显示
        enabled: true
    };

    switch (toolType) {
        case 'rate-calculator':
            return {
                ...baseConfig,
                title: customConfig.title || 'Calculate Your New Rate',
                description: customConfig.description || 'See how the new rates affect your payments',
                inputs: [
                    { id: 'principal', label: 'Loan Amount ($)', type: 'number', default: 300000 },
                    { id: 'oldRate', label: 'Current Rate (%)', type: 'number', step: 0.01, default: 7.0 },
                    { id: 'newRate', label: 'New Rate (%)', type: 'number', step: 0.01, default: 6.5 },
                    { id: 'term', label: 'Loan Term (years)', type: 'select', options: [15, 20, 30], default: 30 }
                ],
                calculation: 'mortgage-comparison',
                outputs: ['monthlyPayment', 'totalInterest', 'savings']
            };

        case 'policy-checker':
            return {
                ...baseConfig,
                title: customConfig.title || 'Does This Policy Affect You?',
                description: customConfig.description || 'Check if you\'re impacted by this change',
                questions: customConfig.questions || [
                    { id: 'income', label: 'Annual Income', type: 'range', min: 0, max: 500000, step: 10000 },
                    { id: 'filingStatus', label: 'Filing Status', type: 'select', options: ['Single', 'Married Filing Jointly', 'Head of Household'] },
                    { id: 'age', label: 'Age', type: 'number', min: 18, max: 100 },
                    { id: 'hasChildren', label: 'Have Dependents?', type: 'boolean' }
                ],
                rules: customConfig.rules || [],
                outputs: ['isAffected', 'impactLevel', 'recommendation']
            };

        case 'eligibility-checker':
            return {
                ...baseConfig,
                title: customConfig.title || 'Check Your Eligibility',
                description: customConfig.description || 'See if you qualify',
                criteria: customConfig.criteria || [
                    { id: 'income', label: 'Annual Income', type: 'number', requirement: { max: 150000 } },
                    { id: 'creditScore', label: 'Credit Score', type: 'number', requirement: { min: 620 } }
                ],
                outputs: ['eligible', 'missingCriteria', 'nextSteps']
            };

        case 'savings-estimator':
            return {
                ...baseConfig,
                title: customConfig.title || 'Estimate Your Savings',
                description: customConfig.description || 'Calculate how much you could save',
                inputs: [
                    { id: 'currentMonthly', label: 'Current Monthly Payment ($)', type: 'number' },
                    { id: 'newMonthly', label: 'New Monthly Payment ($)', type: 'number' },
                    { id: 'months', label: 'Time Period (months)', type: 'number', default: 12 }
                ],
                calculation: 'simple-savings',
                outputs: ['monthlySavings', 'yearlySavings', 'totalSavings']
            };

        case 'comparison-tool':
            return {
                ...baseConfig,
                title: customConfig.title || 'Compare Your Options',
                description: customConfig.description || 'See which option is better for you',
                options: customConfig.options || [
                    { id: 'optionA', label: 'Option A' },
                    { id: 'optionB', label: 'Option B' }
                ],
                factors: customConfig.factors || ['cost', 'time', 'benefit'],
                outputs: ['recommendation', 'breakdown', 'pros', 'cons']
            };

        case 'impact-calculator':
            return {
                ...baseConfig,
                title: customConfig.title || 'Calculate Your Impact',
                description: customConfig.description || 'See exactly how this affects you',
                inputs: customConfig.inputs || [
                    { id: 'currentSituation', label: 'Your Current Situation', type: 'number' }
                ],
                calculation: customConfig.calculation || 'percentage-change',
                outputs: ['beforeValue', 'afterValue', 'difference', 'percentChange']
            };

        case 'quiz':
            return {
                ...baseConfig,
                title: customConfig.title || 'Test Your Knowledge',
                description: customConfig.description || 'How well do you understand this topic?',
                questions: customConfig.questions || [],
                scoring: { correct: 10, incorrect: 0 },
                outputs: ['score', 'percentage', 'feedback']
            };

        default:
            return baseConfig;
    }
}

/**
 * 生成工具HTML
 */
function generateToolHtml(toolConfig) {
    const { type, id, title, description, inputs, outputs } = toolConfig;

    // 生成输入字段HTML
    const inputsHtml = (inputs || []).map(input => {
        switch (input.type) {
            case 'number':
                return `
                    <div class="tool-input-group">
                        <label for="${input.id}">${input.label}</label>
                        <input type="number" id="${input.id}" name="${input.id}"
                               value="${input.default || ''}"
                               ${input.min !== undefined ? `min="${input.min}"` : ''}
                               ${input.max !== undefined ? `max="${input.max}"` : ''}
                               ${input.step ? `step="${input.step}"` : ''}>
                    </div>`;
            case 'select':
                const options = (input.options || []).map(opt =>
                    `<option value="${opt}" ${opt === input.default ? 'selected' : ''}>${opt}</option>`
                ).join('');
                return `
                    <div class="tool-input-group">
                        <label for="${input.id}">${input.label}</label>
                        <select id="${input.id}" name="${input.id}">${options}</select>
                    </div>`;
            case 'range':
                return `
                    <div class="tool-input-group">
                        <label for="${input.id}">${input.label}: <span id="${input.id}-value">${input.default || input.min}</span></label>
                        <input type="range" id="${input.id}" name="${input.id}"
                               min="${input.min || 0}" max="${input.max || 100}"
                               step="${input.step || 1}" value="${input.default || input.min}"
                               oninput="document.getElementById('${input.id}-value').textContent = this.value">
                    </div>`;
            case 'boolean':
                return `
                    <div class="tool-input-group tool-checkbox">
                        <label>
                            <input type="checkbox" id="${input.id}" name="${input.id}">
                            ${input.label}
                        </label>
                    </div>`;
            default:
                return `
                    <div class="tool-input-group">
                        <label for="${input.id}">${input.label}</label>
                        <input type="text" id="${input.id}" name="${input.id}" value="${input.default || ''}">
                    </div>`;
        }
    }).join('\n');

    // 生成输出区域HTML
    const outputsHtml = (outputs || []).map(output => `
        <div class="tool-output-item" id="output-${output}">
            <span class="output-label">${formatOutputLabel(output)}</span>
            <span class="output-value">--</span>
        </div>
    `).join('\n');

    return `
<div class="interactive-tool" id="${id}" data-tool-type="${type}">
    <div class="tool-header">
        <h3>🧮 ${title}</h3>
        <p>${description}</p>
    </div>
    <div class="tool-body">
        <form class="tool-form" onsubmit="return false;">
            ${inputsHtml}
            <button type="button" class="tool-calculate-btn" onclick="calculateTool('${id}')">
                Calculate →
            </button>
        </form>
        <div class="tool-results" style="display: none;">
            <h4>Your Results</h4>
            ${outputsHtml}
        </div>
    </div>
    <div class="tool-footer">
        <p class="tool-disclaimer">* This is an estimate for educational purposes only.</p>
    </div>
</div>`;
}

/**
 * 格式化输出标签
 */
function formatOutputLabel(output) {
    const labels = {
        'monthlyPayment': 'Monthly Payment',
        'totalInterest': 'Total Interest',
        'savings': 'Potential Savings',
        'monthlySavings': 'Monthly Savings',
        'yearlySavings': 'Yearly Savings',
        'totalSavings': 'Total Savings',
        'isAffected': 'Are You Affected?',
        'impactLevel': 'Impact Level',
        'recommendation': 'Recommendation',
        'eligible': 'Eligibility Status',
        'missingCriteria': 'Missing Criteria',
        'nextSteps': 'Next Steps',
        'beforeValue': 'Before',
        'afterValue': 'After',
        'difference': 'Difference',
        'percentChange': 'Percent Change',
        'score': 'Your Score',
        'percentage': 'Percentage',
        'feedback': 'Feedback'
    };
    return labels[output] || output.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * 生成工具的JavaScript计算逻辑
 */
function generateToolScript(toolConfig) {
    const { id, type, calculation, inputs, outputs } = toolConfig;

    let calcFunction = '';

    switch (calculation || type) {
        case 'mortgage-comparison':
            calcFunction = `
                const principal = parseFloat(document.getElementById('principal').value) || 0;
                const oldRate = parseFloat(document.getElementById('oldRate').value) / 100 / 12;
                const newRate = parseFloat(document.getElementById('newRate').value) / 100 / 12;
                const term = parseInt(document.getElementById('term').value) * 12;

                const oldPayment = principal * (oldRate * Math.pow(1 + oldRate, term)) / (Math.pow(1 + oldRate, term) - 1);
                const newPayment = principal * (newRate * Math.pow(1 + newRate, term)) / (Math.pow(1 + newRate, term) - 1);

                const oldTotal = oldPayment * term;
                const newTotal = newPayment * term;

                return {
                    monthlyPayment: '$' + newPayment.toFixed(2),
                    totalInterest: '$' + (newTotal - principal).toLocaleString('en-US', {maximumFractionDigits: 0}),
                    savings: '$' + ((oldTotal - newTotal)).toLocaleString('en-US', {maximumFractionDigits: 0}) + ' over loan term'
                };`;
            break;

        case 'simple-savings':
            calcFunction = `
                const current = parseFloat(document.getElementById('currentMonthly').value) || 0;
                const newVal = parseFloat(document.getElementById('newMonthly').value) || 0;
                const months = parseInt(document.getElementById('months').value) || 12;

                const monthly = current - newVal;
                return {
                    monthlySavings: '$' + monthly.toFixed(2),
                    yearlySavings: '$' + (monthly * 12).toFixed(2),
                    totalSavings: '$' + (monthly * months).toFixed(2)
                };`;
            break;

        case 'percentage-change':
            calcFunction = `
                const before = parseFloat(document.getElementById('currentSituation').value) || 0;
                const changePercent = 10; // This should come from article data
                const after = before * (1 + changePercent / 100);

                return {
                    beforeValue: '$' + before.toLocaleString(),
                    afterValue: '$' + after.toLocaleString(),
                    difference: '$' + (after - before).toLocaleString(),
                    percentChange: changePercent + '%'
                };`;
            break;

        default:
            calcFunction = `
                return { result: 'Calculation not implemented' };`;
    }

    return `
<script>
function calculateTool_${id.replace(/-/g, '_')}() {
    try {
        const results = (function() {
            ${calcFunction}
        })();

        const resultsDiv = document.querySelector('#${id} .tool-results');
        resultsDiv.style.display = 'block';

        Object.keys(results).forEach(key => {
            const outputEl = document.querySelector('#${id} #output-' + key + ' .output-value');
            if (outputEl) {
                outputEl.textContent = results[key];
            }
        });

        // 动画效果
        resultsDiv.classList.add('tool-results-show');
    } catch (e) {
        console.error('Calculation error:', e);
    }
}

// 绑定到全局函数
if (typeof window.calculateTool !== 'function') {
    window.calculateTool = function(id) {
        const fn = window['calculateTool_' + id.replace(/-/g, '_')];
        if (fn) fn();
    };
}
</script>`;
}

/**
 * 加载工具注册表
 */
function loadToolsRegistry() {
    if (fs.existsSync(TOOLS_CONFIG_PATH)) {
        return JSON.parse(fs.readFileSync(TOOLS_CONFIG_PATH, 'utf8'));
    }
    return { tools: [], lastUpdated: null };
}

/**
 * 保存工具注册表
 */
function saveToolsRegistry(registry) {
    registry.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOOLS_CONFIG_PATH, JSON.stringify(registry, null, 2));
}

/**
 * 为文章生成互动工具
 */
function generateToolsForArticle(articleData, customTools = []) {
    // 自动检测应该生成的工具
    const detectedTools = detectToolType(articleData);

    // 合并自定义工具
    const allTools = [...customTools, ...detectedTools];

    // 生成工具配置和HTML
    const generatedTools = [];

    allTools.slice(0, 2).forEach(tool => { // 每篇文章最多2个工具
        const config = generateToolConfig(tool.type, articleData, tool.config || {});
        const html = generateToolHtml(config);
        const script = generateToolScript(config);

        generatedTools.push({
            config,
            html,
            script,
            reason: tool.reason
        });
    });

    return generatedTools;
}

/**
 * 主函数
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
互动工具生成器

用法: node tool-generator.js [选项] [文章JSON路径]

选项:
  --detect <text>    分析文本，检测应生成的工具类型
  --generate <type>  生成指定类型的工具模板
  --list             列出所有可用的工具类型
  --help             显示帮助信息

示例:
  node tool-generator.js --detect "Fed raises interest rates by 0.25%"
  node tool-generator.js --generate rate-calculator
  node tool-generator.js article.json
`);
        return;
    }

    if (args.includes('--list')) {
        console.log('\n可用的工具类型:\n');
        Object.entries(TOOL_TYPES).forEach(([type, info]) => {
            console.log(`  ${type}`);
            console.log(`    名称: ${info.name}`);
            console.log(`    描述: ${info.description}`);
            console.log();
        });
        return;
    }

    if (args.includes('--detect')) {
        const textIndex = args.indexOf('--detect') + 1;
        const text = args.slice(textIndex).join(' ');
        console.log(`\n分析文本: "${text.substring(0, 50)}..."\n`);

        const detected = detectToolType({ content: text });
        console.log('推荐生成的工具:');
        detected.forEach((tool, i) => {
            console.log(`  ${i + 1}. ${tool.type} - ${tool.reason}`);
        });
        return;
    }

    // 处理文章文件
    const articlePath = args.find(a => a.endsWith('.json'));
    if (articlePath && fs.existsSync(articlePath)) {
        console.log(`处理文章: ${articlePath}\n`);

        const articleData = JSON.parse(fs.readFileSync(articlePath, 'utf8'));
        const tools = generateToolsForArticle(articleData);

        console.log(`生成了 ${tools.length} 个互动工具:\n`);
        tools.forEach((tool, i) => {
            console.log(`${i + 1}. ${tool.config.title}`);
            console.log(`   类型: ${tool.config.type}`);
            console.log(`   原因: ${tool.reason}`);
            console.log();
        });

        // 保存工具HTML到文件
        tools.forEach(tool => {
            const outputPath = path.join(TOOLS_DIR, `${tool.config.id}.html`);
            if (!fs.existsSync(TOOLS_DIR)) {
                fs.mkdirSync(TOOLS_DIR, { recursive: true });
            }
            fs.writeFileSync(outputPath, tool.html + tool.script);
            console.log(`保存到: ${outputPath}`);
        });
    }
}

// 导出
module.exports = {
    TOOL_TYPES,
    detectToolType,
    generateToolConfig,
    generateToolHtml,
    generateToolScript,
    generateToolsForArticle,
    loadToolsRegistry,
    saveToolsRegistry
};

// 直接运行
if (require.main === module) {
    main().catch(console.error);
}
