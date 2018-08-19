'use strict'

require ('electron-reload')(__dirname, {
    electron: require('${__dirname}/../../node_modules/electron')
});

const gkm = require('gkm');

const electron = require('electron');
const path = require('path');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const Tray = electron.Tray;
const iconPath = path.resolve(__dirname, './images/enter.ico');

const Menu = electron.Menu;
let tray = null;

const ipc = electron.ipcMain;

let mainWindow;

// read from db
const fs = require('fs');
// let rawdata = fs.readFileSync('db.json');
let rawdata = fs.readFileSync(path.resolve(__dirname, './db.json'));
let db = JSON.parse(rawdata);

const sounds = [
    'sound_1.mp3',
    'sound_2.mp3',
    'sound_3.mp3'
];

function createWindow() {
    mainWindow = new BrowserWindow({show: false});
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    /* mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
        tray.destroy();
    }); */
}

// select previously selected sound to check/uncheck radio
function toggleRadio(menu) {
    let menuItemIndex = db.selectedRadio;
    menu.items[menuItemIndex].checked = true;   
}

function changeSound(pos) {
    db.selectedRadio = pos;
    let selectedSound = sounds[pos];
    mainWindow.webContents.send('sound-changed', path.resolve(__dirname, `./sounds/${selectedSound}`));
}

app.on('ready', () => {
    createWindow();
    tray = new Tray(iconPath);

    let template1 = [];

    for (let i=0; i<sounds.length; i++) {
        let obj = {};
        obj.label = `Sound ${i + 1}`,
        obj.type = 'radio',
        obj.checked = false,
        obj.click = function(e) {
            changeSound(i);
        };

        template1.push(obj);
    }

    let template2 = [
        {
            type: 'separator',
        }, {
            label: 'SOUND ON',
            type: 'checkbox',
            checked: db.isSoundOn,
            click: function(e) {
                db.isSoundOn = !db.isSoundOn;
            }
        }, {
            type: 'separator',
        }, {
            role: 'quit'
        }
    ]

    let template = template1.concat(template2);

    let ctxMenu = Menu.buildFromTemplate(template);
    toggleRadio(ctxMenu);
    tray.setContextMenu(ctxMenu);
    tray.setToolTip('Clicky Keyboard - Play sound on key strokes');

    gkm.events.on('key.pressed', (key) => {
        // console.log(key);
    
        if (!db.isSoundOn) return;
    
        // play sound
        mainWindow.webContents.send('key-pressed');  
    });
});

// change audio src in index.html to db's value
ipc.on('document-loaded', (e) => {
    let selectedSound = sounds[db.selectedRadio];
    e.sender.send('sound-changed', path.resolve(__dirname, `./sounds/${selectedSound}`));
});

app.setLoginItemSettings({openAtLogin: true});

app.on('window-all-closed', () => {
    mainWindow = null;
    tray.destroy();
    app.quit();
});

app.on('before-quit', () => {
    // update db
    let data = JSON.stringify(db, null, 2);
    fs.writeFileSync('db.json', data);
});

// for mac
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})


