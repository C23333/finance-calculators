const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'icons', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        titleBarStyle: 'default',
        show: false
    });

    // Load the local web files
    mainWindow.loadFile(path.join(__dirname, 'web', 'index.html'));

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Handle navigation to external URLs
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('file://')) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create application menu
function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Calculators',
            submenu: [
                { label: 'Mortgage', click: () => mainWindow.loadFile(path.join(__dirname, 'web', 'calculators', 'mortgage.html')) },
                { label: 'Compound Interest', click: () => mainWindow.loadFile(path.join(__dirname, 'web', 'calculators', 'compound-interest.html')) },
                { label: 'Retirement', click: () => mainWindow.loadFile(path.join(__dirname, 'web', 'calculators', 'retirement.html')) },
                { label: '401(k)', click: () => mainWindow.loadFile(path.join(__dirname, 'web', 'calculators', '401k.html')) },
                { type: 'separator' },
                { label: 'Home', click: () => mainWindow.loadFile(path.join(__dirname, 'web', 'index.html')) }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Visit Website',
                    click: () => shell.openExternal('https://financecalc.cc')
                },
                {
                    label: 'Report Issue',
                    click: () => shell.openExternal('https://financecalc.cc/support')
                },
                { type: 'separator' },
                {
                    label: 'About FinCalc',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About FinCalc',
                            message: 'FinCalc Desktop',
                            detail: 'Version 1.0.0\n\nFree Financial Calculators\n© 2026 FinCalc'
                        });
                    }
                }
            ]
        }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    createWindow();
    createMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
