const id = (new Date()).getTime();
var socket = io();

document.getElementById('show_id').innerHTML = `複製識別碼：${id}`;
document.getElementById('id').value = id;

document.getElementById('startCopy').addEventListener('click', function () {
    document.getElementById('startCopy').setAttribute('disabled', 'disabled');
    var states = document.querySelectorAll('label>div:last-child');
    var files = document.getElementsByName('files');
    var checkedFiles = [];
    for (var i = 0; i < files.length; i++) {
        if (files[i].checked) {
            checkedFiles.push({
                value: files[i].value,
                index: i
            });
        }
        files[i].setAttribute('disabled', 'disabled');
        states[i].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000000" viewBox="0 0 256 256"><path d="M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm88,88H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z"></path></svg>';
    }
    socket.emit('startCopy', { checkedFiles, id, path });
})

socket.on('copied', ({ index }) => {
    var states = document.querySelectorAll('label>div:last-child');
    states[index].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000000" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>';
})

socket.on('copy_done', () => {
    const div = document.getElementById('alert');
    div.className = "bg-green-200 w-full flex rounded-full px-4 py-2 my-5";
    div.innerHTML = '複製完成，等待壓縮...';
})

socket.on('archiver_finalized', ({ bytes }) => {
    document.getElementById('bytes').value = bytes;
    const form = document.querySelector('form');
    form.submit();
})

socket.on('archiver_error', ({ err }) => {
    const div = document.getElementById('alert');
    div.className = "bg-red-200 w-full flex rounded-full px-4 py-2 my-5";
    div.innerHTML = `發生錯誤， ${err}`;
    console.log('archiver_error', err)
})