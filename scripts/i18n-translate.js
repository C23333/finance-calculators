#!/usr/bin/env node
/**
 * i18n 自动翻译脚本 (使用 Google 免费翻译 API)
 * 用法: node scripts/i18n-translate.js [--locale zh] [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const I18N_DIR = path.join(__dirname, '../js/i18n');

const LOCALES = ['zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ar', 'hi'];

// Google 翻译语言代码映射
const LANG_MAP = {
  zh: 'zh-CN',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  ar: 'ar',
  hi: 'hi',
};

function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((o, k) => o?.[k], obj);
}

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((o, k) => {
    if (!o[k]) o[k] = {};
    return o[k];
  }, obj);
  target[lastKey] = value;
}

function loadJson(locale) {
  const filePath = path.join(I18N_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJson(locale, data) {
  const filePath = path.join(I18N_DIR, `${locale}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0].map(item => item[0]).join('');
  } catch (error) {
    console.error(`翻译失败: ${error.message}`);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateLocale(locale, dryRun = false) {
  const sourceData = loadJson('en');
  const targetData = loadJson(locale);
  const sourceKeys = getAllKeys(sourceData);
  const targetKeys = getAllKeys(targetData);
  
  const missingKeys = sourceKeys.filter(k => !targetKeys.includes(k));
  
  if (missingKeys.length === 0) {
    console.log(`✅ ${locale}: 已完整，无需翻译`);
    return 0;
  }

  console.log(`\n🔄 ${locale}: 需要翻译 ${missingKeys.length} 个键`);
  
  if (dryRun) {
    console.log(`   [DRY RUN] 缺失的键: ${missingKeys.join(', ')}`);
    return missingKeys.length;
  }

  const targetLang = LANG_MAP[locale] || locale;
  let translated = 0;

  for (const key of missingKeys) {
    const sourceText = getNestedValue(sourceData, key);
    if (typeof sourceText !== 'string') continue;

    console.log(`   翻译: ${key}`);
    const translatedText = await translateText(sourceText, targetLang);
    
    if (translatedText) {
      setNestedValue(targetData, key, translatedText);
      translated++;
    }
    
    // 限速：每秒最多 5 个请求
    await sleep(200);
  }

  saveJson(locale, targetData);
  console.log(`✅ ${locale}: 翻译完成 ${translated}/${missingKeys.length} 个键`);
  return translated;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const localeIndex = args.indexOf('--locale');
  const targetLocale = localeIndex !== -1 ? args[localeIndex + 1] : null;

  const localesToProcess = targetLocale ? [targetLocale] : LOCALES;
  
  console.log('🌐 i18n 自动翻译工具');
  console.log('='.repeat(50));
  if (dryRun) console.log('⚠️  DRY RUN 模式 - 不会实际修改文件\n');

  let totalTranslated = 0;
  for (const locale of localesToProcess) {
    totalTranslated += await translateLocale(locale, dryRun);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`🎉 完成！共翻译 ${totalTranslated} 个键`);
}

main().catch(console.error);
