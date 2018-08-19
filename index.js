const electron = require('electron');
const ipc = electron.ipcRenderer;

const audioClick = document.getElementById('audioClick');

ipc.send('document-loaded');

ipc.on('sound-changed', (event, path) => {
    audioClick.setAttribute('src', path);
});

ipc.on('key-pressed', (event, arg) => {
    audioClick.currentTime = 0;
    audioClick.play();
});

