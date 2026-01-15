#!/usr/bin/env node
/**
 * i18n 翻译完整性检查脚本
 * 用法: node scripts/i18n-check.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const I18N_DIR = path.join(__dirname, '../js/i18n');

const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ar', 'hi'];

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

function loadJson(locale) {
  const filePath = path.join(I18N_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function checkTranslations() {
  const sourceData = loadJson('en');
  if (!sourceData) {
    console.error('❌ 找不到英文源文件 js/i18n/en.json');
    process.exit(1);
  }

  const sourceKeys = getAllKeys(sourceData);
  console.log(`📋 英文源文件共 ${sourceKeys.length} 个翻译键\n`);

  const results = [];

  for (const locale of LOCALES) {
    if (locale === 'en') continue;

    const targetData = loadJson(locale);
    if (!targetData) {
      results.push({ locale, missing: sourceKeys.length, keys: sourceKeys });
      continue;
    }

    const targetKeys = getAllKeys(targetData);
    const missingKeys = sourceKeys.filter(k => !targetKeys.includes(k));
    const extraKeys = targetKeys.filter(k => !sourceKeys.includes(k));

    results.push({
      locale,
      missing: missingKeys.length,
      extra: extraKeys.length,
      keys: missingKeys,
      extraKeys,
    });
  }

  // 输出结果
  let hasIssues = false;
  for (const r of results) {
    const coverage = ((sourceKeys.length - r.missing) / sourceKeys.length * 100).toFixed(1);
    const status = r.missing === 0 ? '✅' : '⚠️';
    console.log(`${status} ${r.locale}: ${coverage}% 覆盖率 (缺失 ${r.missing} 个键)`);
    
    if (r.missing > 0) {
      hasIssues = true;
      console.log(`   缺失的键: ${r.keys.slice(0, 5).join(', ')}${r.keys.length > 5 ? '...' : ''}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  if (hasIssues) {
    console.log('💡 运行 node scripts/i18n-translate.js 来自动翻译缺失的键');
  } else {
    console.log('🎉 所有语言翻译完整！');
  }

  return results;
}

checkTranslations();
