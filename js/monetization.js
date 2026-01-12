/**
 * FinCalc Monetization System
 * 广告和联盟营销管理模块
 *
 * 使用说明：
 * 1. 申请 Google AdSense 后，在 config 中填入你的 Publisher ID
 * 2. 注册联盟营销平台后，更新 affiliateLinks 中的链接
 */

const MonetizationConfig = {
    // Google AdSense 配置
    adsense: {
        enabled: true,  // 已启用
        publisherId: 'ca-pub-9483557811977052',  // 你的 Publisher ID

        // 广告位配置
        slots: {
            // 计算结果下方的广告
            resultBottom: {
                slot: 'XXXXXXXXXX',  // 替换为广告单元 ID
                format: 'auto',
                fullWidth: true
            },
            // 侧边栏广告
            sidebar: {
                slot: 'XXXXXXXXXX',
                format: 'rectangle',
                fullWidth: false
            },
            // 页面底部广告
            footer: {
                slot: 'XXXXXXXXXX',
                format: 'horizontal',
                fullWidth: true
            }
        }
    },

    // 联盟营销链接配置
    // 注册后替换为你的联盟链接
    affiliateLinks: {
        // 房贷相关
        mortgage: {
            bankrate: {
                name: 'Bankrate',
                url: 'https://www.bankrate.com/mortgages/',  // 替换为联盟链接
                description: 'Compare mortgage rates from top lenders',
                cta: 'Compare Rates'
            },
            nerdwallet: {
                name: 'NerdWallet',
                url: 'https://www.nerdwallet.com/mortgages/',
                description: 'Find the best mortgage for you',
                cta: 'Get Started'
            },
            rocketMortgage: {
                name: 'Rocket Mortgage',
                url: 'https://www.rocketmortgage.com/',
                description: 'Get approved in minutes',
                cta: 'Apply Now'
            }
        },

        // 投资相关
        investment: {
            betterment: {
                name: 'Betterment',
                url: 'https://www.betterment.com/',
                description: 'Automated investing made simple',
                cta: 'Start Investing'
            },
            wealthfront: {
                name: 'Wealthfront',
                url: 'https://www.wealthfront.com/',
                description: 'Build long-term wealth',
                cta: 'Get Started'
            },
            fidelity: {
                name: 'Fidelity',
                url: 'https://www.fidelity.com/',
                description: 'Commission-free trading',
                cta: 'Open Account'
            }
        },

        // 储蓄账户
        savings: {
            marcus: {
                name: 'Marcus by Goldman Sachs',
                url: 'https://www.marcus.com/',
                description: 'High-yield savings account',
                cta: 'Open Account'
            },
            ally: {
                name: 'Ally Bank',
                url: 'https://www.ally.com/',
                description: 'No monthly fees, great rates',
                cta: 'Learn More'
            },
            sofi: {
                name: 'SoFi',
                url: 'https://www.sofi.com/',
                description: 'Banking reimagined',
                cta: 'Get Started'
            }
        },

        // 学生贷款
        studentLoan: {
            sofiStudent: {
                name: 'SoFi Student Loans',
                url: 'https://www.sofi.com/refinance-student-loan/',
                description: 'Refinance and save thousands',
                cta: 'Check Your Rate'
            },
            earnest: {
                name: 'Earnest',
                url: 'https://www.earnest.com/',
                description: 'Flexible student loan refinancing',
                cta: 'Get Started'
            }
        },

        // 信用卡
        creditCard: {
            nerdwalletCC: {
                name: 'NerdWallet Credit Cards',
                url: 'https://www.nerdwallet.com/credit-cards/',
                description: 'Find the best credit card',
                cta: 'Compare Cards'
            }
        },

        // 汽车贷款
        autoLoan: {
            capitalOne: {
                name: 'Capital One Auto',
                url: 'https://www.capitalone.com/cars/',
                description: 'Pre-qualify with no impact to credit',
                cta: 'Get Pre-Qualified'
            },
            lightstream: {
                name: 'LightStream',
                url: 'https://www.lightstream.com/',
                description: 'Low rates, no fees',
                cta: 'Check Your Rate'
            }
        },

        // 退休账户
        retirement: {
            vanguard: {
                name: 'Vanguard',
                url: 'https://investor.vanguard.com/',
                description: 'Low-cost retirement investing',
                cta: 'Open IRA'
            },
            schwab: {
                name: 'Charles Schwab',
                url: 'https://www.schwab.com/',
                description: 'Retirement planning made easy',
                cta: 'Get Started'
            }
        }
    },

    // 计算器与联盟类型的映射
    calculatorAffiliateMap: {
        'mortgage': ['mortgage'],
        'refinance': ['mortgage'],
        'home-affordability': ['mortgage', 'savings'],
        'rent-vs-buy': ['mortgage', 'savings'],
        'compound-interest': ['investment', 'savings'],
        'investment-return': ['investment'],
        'retirement': ['retirement', 'investment'],
        '401k': ['retirement', 'investment'],
        'roth-vs-traditional': ['retirement'],
        'savings-goal': ['savings'],
        'emergency-fund': ['savings'],
        'student-loan': ['studentLoan'],
        'auto-loan': ['autoLoan'],
        'loan-payoff': ['savings'],
        'debt-payoff': ['creditCard', 'savings'],
        'salary': ['savings', 'investment'],
        'take-home-pay': ['savings'],
        'self-employment-tax': ['savings', 'retirement'],
        'inflation': ['investment'],
        'social-security': ['retirement']
    }
};

/**
 * 广告管理器
 */
const AdManager = {
    /**
     * 初始化 AdSense
     */
    init() {
        if (!MonetizationConfig.adsense.enabled) {
            console.log('AdSense is disabled. Enable it in MonetizationConfig after approval.');
            return;
        }

        // 动态加载 AdSense 脚本
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${MonetizationConfig.adsense.publisherId}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    },

    /**
     * 在指定容器中插入广告
     * @param {string} containerId - 容器元素 ID
     * @param {string} slotType - 广告位类型 (resultBottom, sidebar, footer)
     */
    insertAd(containerId, slotType) {
        if (!MonetizationConfig.adsense.enabled) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const slotConfig = MonetizationConfig.adsense.slots[slotType];
        if (!slotConfig) return;

        const adHtml = `
            <div class="ad-container ad-${slotType}">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="${MonetizationConfig.adsense.publisherId}"
                     data-ad-slot="${slotConfig.slot}"
                     data-ad-format="${slotConfig.format}"
                     ${slotConfig.fullWidth ? 'data-full-width-responsive="true"' : ''}></ins>
            </div>
        `;

        container.innerHTML = adHtml;

        // 触发广告加载
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log('AdSense not loaded yet');
        }
    },

    /**
     * 在计算结果后插入广告
     */
    insertResultAd() {
        const resultsSection = document.querySelector('.results');
        if (!resultsSection) return;

        // 创建广告容器
        let adContainer = document.getElementById('result-ad-container');
        if (!adContainer) {
            adContainer = document.createElement('div');
            adContainer.id = 'result-ad-container';
            adContainer.style.marginTop = '24px';
            resultsSection.appendChild(adContainer);
        }

        this.insertAd('result-ad-container', 'resultBottom');
    }
};

/**
 * 联盟营销管理器
 */
const AffiliateManager = {
    /**
     * 获取当前计算器类型
     */
    getCurrentCalculatorType() {
        const path = window.location.pathname;
        const match = path.match(/calculators\/([^.]+)\.html/);
        return match ? match[1] : null;
    },

    /**
     * 获取相关的联盟链接
     * @param {string} calculatorType - 计算器类型
     * @returns {Array} 联盟链接数组
     */
    getRelevantAffiliates(calculatorType) {
        const affiliateTypes = MonetizationConfig.calculatorAffiliateMap[calculatorType] || [];
        const affiliates = [];

        affiliateTypes.forEach(type => {
            const typeAffiliates = MonetizationConfig.affiliateLinks[type];
            if (typeAffiliates) {
                Object.values(typeAffiliates).forEach(affiliate => {
                    affiliates.push({
                        ...affiliate,
                        category: type
                    });
                });
            }
        });

        return affiliates;
    },

    /**
     * 生成联盟推荐卡片 HTML
     * @param {Object} affiliate - 联盟信息
     * @returns {string} HTML 字符串
     */
    generateAffiliateCard(affiliate) {
        return `
            <a href="${affiliate.url}" target="_blank" rel="noopener sponsored" class="affiliate-card" data-affiliate="${affiliate.name}">
                <div class="affiliate-content">
                    <h4>${affiliate.name}</h4>
                    <p>${affiliate.description}</p>
                </div>
                <span class="affiliate-cta">${affiliate.cta} →</span>
            </a>
        `;
    },

    /**
     * 在页面中插入联盟推荐区块
     */
    insertAffiliateSection() {
        const calculatorType = this.getCurrentCalculatorType();
        if (!calculatorType) return;

        const affiliates = this.getRelevantAffiliates(calculatorType);
        if (affiliates.length === 0) return;

        // 只显示前3个推荐
        const displayAffiliates = affiliates.slice(0, 3);

        const sectionHtml = `
            <div class="affiliate-section">
                <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    Recommended Services
                </h3>
                <p class="affiliate-disclaimer">We may earn a commission when you use these links. This helps keep our calculators free.</p>
                <div class="affiliate-grid">
                    ${displayAffiliates.map(a => this.generateAffiliateCard(a)).join('')}
                </div>
            </div>
        `;

        // 在结果区域后插入
        const resultsSection = document.querySelector('.results');
        if (resultsSection) {
            // 检查是否已存在
            if (!document.querySelector('.affiliate-section')) {
                resultsSection.insertAdjacentHTML('afterend', sectionHtml);
            }
        }

        // 添加点击追踪
        this.trackClicks();
    },

    /**
     * 追踪联盟链接点击
     */
    trackClicks() {
        document.querySelectorAll('.affiliate-card').forEach(card => {
            card.addEventListener('click', function() {
                const affiliateName = this.dataset.affiliate;
                // 如果有 Google Analytics，发送事件
                if (typeof gtag === 'function') {
                    gtag('event', 'affiliate_click', {
                        'affiliate_name': affiliateName,
                        'calculator': AffiliateManager.getCurrentCalculatorType()
                    });
                }
                console.log(`Affiliate click: ${affiliateName}`);
            });
        });
    },

    /**
     * 在计算完成后显示推荐
     */
    showAfterCalculation() {
        // 延迟显示，让用户先看到结果
        setTimeout(() => {
            this.insertAffiliateSection();
        }, 500);
    }
};

/**
 * 初始化变现系统
 */
function initMonetization() {
    // 初始化广告
    AdManager.init();

    // 监听计算完成事件
    document.addEventListener('calculationComplete', () => {
        AdManager.insertResultAd();
        AffiliateManager.showAfterCalculation();
    });

    // 如果页面已有结果显示，直接插入
    const resultsSection = document.querySelector('.results.show');
    if (resultsSection) {
        AffiliateManager.insertAffiliateSection();
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMonetization);
} else {
    initMonetization();
}

// 导出供其他模块使用
window.MonetizationConfig = MonetizationConfig;
window.AdManager = AdManager;
window.AffiliateManager = AffiliateManager;
