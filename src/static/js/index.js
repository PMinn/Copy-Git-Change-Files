document.querySelector('button').addEventListener('click', function () {
    const path = document.querySelector('input[name="path"]').value;
    const source = document.querySelector('select[name="source"]').value;
    if (path && source) {
        const form = document.querySelector('form');
        if (source === 'commits') {
            form.action = '/panel';
            form.submit();
        } else {
            form.action = '/copy';
            form.submit();
        }
    }
})