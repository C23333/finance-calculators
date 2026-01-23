@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:menu
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║           Finance Calculators - 工作流管理器               ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  [1] 抓取新闻          - 从 RSS 源获取最新财经新闻         ║
echo ║  [2] 生成文章          - 使用 AI 生成博客文章              ║
echo ║  [3] 构建 HTML         - 将 JSON 转换为 HTML 页面          ║
echo ║  [4] 完整工作流        - 依次执行 1→2→3                    ║
echo ║                                                            ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  历史管理                                                  ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  [5] 查看统计          - 显示文章历史统计信息              ║
echo ║  [6] 列出文章          - 显示最近生成的文章                ║
echo ║  [7] 查看版本          - 查看某篇文章的所有版本            ║
echo ║  [8] 恢复版本          - 恢复文章到指定历史版本            ║
echo ║  [9] 初始化历史        - 从现有文章初始化历史索引          ║
echo ║                                                            ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  其他工具                                                  ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  [H] 健康检查          - 检查 RSS 源健康状态               ║
echo ║  [S] 更新站点地图      - 更新 sitemap.xml                  ║
echo ║                                                            ║
echo ║  [0] 退出                                                  ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
set /p choice="请选择操作 [0-9/H/S]: "

if "%choice%"=="1" goto fetch_news
if "%choice%"=="2" goto generate_articles
if "%choice%"=="3" goto build_html
if "%choice%"=="4" goto full_workflow
if "%choice%"=="5" goto history_stats
if "%choice%"=="6" goto history_list
if "%choice%"=="7" goto history_versions
if "%choice%"=="8" goto history_restore
if "%choice%"=="9" goto history_init
if /i "%choice%"=="H" goto health_check
if /i "%choice%"=="S" goto update_sitemap
if "%choice%"=="0" goto exit

echo 无效选择，请重试...
timeout /t 2 >nul
goto menu

:fetch_news
cls
echo ════════════════════════════════════════════════════════════
echo   抓取新闻
echo ════════════════════════════════════════════════════════════
echo.
node scripts/news-fetcher.js
echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:generate_articles
cls
echo ════════════════════════════════════════════════════════════
echo   生成文章
echo ════════════════════════════════════════════════════════════
echo.
set /p gen_date="请输入日期 (留空使用今天，格式 YYYY-MM-DD): "
set /p gen_count="请输入生成数量 (默认 3): "

if "%gen_date%"=="" (
    for /f "tokens=1-3 delims=/" %%a in ('date /t') do (
        set gen_date=%%c-%%a-%%b
    )
    for /f "tokens=1-3 delims=-" %%a in ("%date:~0,10%") do (
        set gen_date=%%a-%%b-%%c
    )
)
if "%gen_count%"=="" set gen_count=3

echo.
echo 正在生成 %gen_count% 篇文章 (日期: %gen_date%)...
echo.
node scripts/article-generator.js %gen_date% %gen_count%
echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:build_html
cls
echo ════════════════════════════════════════════════════════════
echo   构建 HTML
echo ════════════════════════════════════════════════════════════
echo.
node scripts/html-builder.js
echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:full_workflow
cls
echo ════════════════════════════════════════════════════════════
echo   完整工作流
echo ════════════════════════════════════════════════════════════
echo.
set /p wf_count="请输入生成文章数量 (默认 3): "
if "%wf_count%"=="" set wf_count=3

echo.
echo [步骤 1/3] 抓取新闻...
echo ────────────────────────────────────────────────────────────
node scripts/news-fetcher.js
if errorlevel 1 (
    echo 新闻抓取失败！
    pause
    goto menu
)

echo.
echo [步骤 2/3] 生成文章...
echo ────────────────────────────────────────────────────────────
for /f "tokens=1-3 delims=/" %%a in ('date /t') do set today=%%c-%%a-%%b
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set dt=%%a
set today=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%
node scripts/article-generator.js %today% %wf_count%
if errorlevel 1 (
    echo 文章生成失败！
    pause
    goto menu
)

echo.
echo [步骤 3/3] 构建 HTML...
echo ────────────────────────────────────────────────────────────
node scripts/html-builder.js

echo.
echo ════════════════════════════════════════════════════════════
echo   工作流完成！
echo ════════════════════════════════════════════════════════════
pause
goto menu

:history_stats
cls
echo ════════════════════════════════════════════════════════════
echo   文章历史统计
echo ════════════════════════════════════════════════════════════
echo.
node scripts/article-history.js --stats
echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:history_list
cls
echo ════════════════════════════════════════════════════════════
echo   文章列表
echo ════════════════════════════════════════════════════════════
echo.
set /p list_count="显示数量 (默认 10): "
if "%list_count%"=="" set list_count=10
echo.
node scripts/article-history.js --list %list_count%
echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:history_versions
cls
echo ════════════════════════════════════════════════════════════
echo   查看文章版本
echo ════════════════════════════════════════════════════════════
echo.
echo 提示: slug 是文章的 URL 标识，例如 mortgage-rates-drop-january-2026
echo.
set /p ver_slug="请输入文章 slug: "
if "%ver_slug%"=="" (
    echo 未输入 slug！
    pause
    goto menu
)
echo.
node scripts/article-history.js --versions %ver_slug%
echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:history_restore
cls
echo ════════════════════════════════════════════════════════════
echo   恢复文章版本
echo ════════════════════════════════════════════════════════════
echo.
echo 警告: 此操作会将当前版本存档，并恢复指定的历史版本
echo.
set /p rest_slug="请输入文章 slug: "
if "%rest_slug%"=="" (
    echo 未输入 slug！
    pause
    goto menu
)

echo.
echo 正在查询版本信息...
node scripts/article-history.js --versions %rest_slug%

echo.
set /p rest_ver="请输入要恢复的版本号: "
if "%rest_ver%"=="" (
    echo 未输入版本号！
    pause
    goto menu
)

echo.
set /p confirm="确认恢复 %rest_slug% 到版本 %rest_ver%? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消
    pause
    goto menu
)

echo.
node scripts/article-history.js --restore %rest_slug% --version=%rest_ver%
echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:history_init
cls
echo ════════════════════════════════════════════════════════════
echo   初始化历史索引
echo ════════════════════════════════════════════════════════════
echo.
echo 此操作将扫描现有文章并初始化/更新历史索引
echo.
set /p init_mode="选择模式 [1=预览(dry-run) / 2=执行 / 3=强制重建]: "

if "%init_mode%"=="1" (
    echo.
    echo 预览模式...
    node scripts/init-history.js --dry-run
) else if "%init_mode%"=="2" (
    echo.
    echo 执行初始化...
    node scripts/init-history.js
) else if "%init_mode%"=="3" (
    echo.
    set /p force_confirm="警告: 强制重建会覆盖现有历史! 确认? (Y/N): "
    if /i "!force_confirm!"=="Y" (
        echo.
        echo 强制重建...
        node scripts/init-history.js --force
    ) else (
        echo 已取消
    )
) else (
    echo 无效选择
)

echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:health_check
cls
echo ════════════════════════════════════════════════════════════
echo   RSS 源健康检查
echo ════════════════════════════════════════════════════════════
echo.
if exist scripts\source-health-check.js (
    node scripts/source-health-check.js
) else (
    echo 健康检查脚本不存在: scripts/source-health-check.js
)
echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:update_sitemap
cls
echo ════════════════════════════════════════════════════════════
echo   更新站点地图
echo ════════════════════════════════════════════════════════════
echo.
if exist scripts\sitemap-updater.js (
    node scripts/sitemap-updater.js
) else (
    echo 站点地图脚本不存在: scripts/sitemap-updater.js
)
echo.
echo ════════════════════════════════════════════════════════════
pause
goto menu

:exit
echo.
echo 再见！
timeout /t 1 >nul
exit /b 0
