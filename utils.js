function fixBinary(bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
        arr[i] = bin.charCodeAt(i);
    }
    return buf;
}


var mainDiv = document.querySelector('#main');

function addHtmlToPage(content) {
    var div = document.createElement('div');
    div.innerHTML = content;
    mainDiv.appendChild(div);
}

function addTextToPage(content) {
    var p = document.createElement('p');
    p.textContent = content;
    mainDiv.appendChild(p);
}

function getFileName(filepath) {
    return filepath.split('/').pop();
}

function dlog(key, value) {
    var log = document.querySelector('#log');
    var block = document.createElement('p');
    block.textContent = [key, " ", value].join('');
    log.appendChild(block);
}

function dlogerror(error) {
    var log = document.querySelector('#log');
    var block = document.createElement('p');
    block.className = 'red';
    block.textContent = error;
    log.appendChild(block);
}
