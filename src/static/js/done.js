document.getElementById('saveAs').addEventListener('click', function () {
    const a = document.createElement('a');
    a.href = `/static/output/${id}.change.zip`;
    a.download = `${id}.change.zip`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
});

document.getElementById('openCache').addEventListener('click', function () {
    fetch('openCache');
});