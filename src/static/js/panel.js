const row = 10;
var page = 1;
var maxPage = 9999;

function renderTable() {
    fetch(`/log`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*'
        },
        body: new URLSearchParams({ 'path': path, 'row': row, 'page': page - 1 })
    })
        .then(res => res.json())
        .then(({ choices }) => {
            if (choices.length === 0) {
                page--;
                maxPage = page;
                alert('已經是最後一頁');
                return;
            }
            document.querySelector('tbody').innerHTML = choices.map(choice => {
                return `<tr class="hover:bg-gray-100 cursor-grab" draggable="true" ondragstart="dragstart(event,'${choice.commit}','${choice.message.replaceAll("'", "\\'")}')" dragend="dragend(event)">
                        <td class="px-2 py-1 text-center rounded-l-full">${choice.commit}</td>
                        <td class="px-2 py-1">${choice.message}</td>
                        <td class="px-2 py-1 text-center rounded-r-full">${choice.author}</td>
                    </tr>`;
            }).join('');
            document.getElementById('page').innerText = page;
        });
}

document.getElementById('previous').addEventListener('click', () => {
    if (page - 1 > 0) {
        page--;
        renderTable();
    } else {
        alert('已經是第一頁');
    }
})

document.getElementById('next').addEventListener('click', () => {
    if (page + 1 <= maxPage) {
        page++;
        renderTable();
    } else {
        alert('已經是最後一頁');
    }
})

renderTable();

function dragstart(e, commit, message) {
    e.dataTransfer.setData("commit", commit);
    e.dataTransfer.setData("message", message);
}

function dragend(e) {
    e.currentTarget.classList.remove('dragArea--hover');
}

function dragover(e) {
    e.preventDefault();
    e.currentTarget.classList.add("dragArea--hover");
}

function dragleave(e) {
    e.currentTarget.classList.remove("dragArea--hover");
}

function drop(e, blockIndex) {
    e.preventDefault();
    var commit = e.dataTransfer.getData("commit");
    var message = e.dataTransfer.getData("message");
    e.currentTarget.innerHTML = `<div class="w-full font-bold">${commit}</div><div class="w-full break-all">${message}</div>`;
    e.currentTarget.classList.remove("dragArea--hover");
    if (blockIndex == 0) {
        document.getElementById('commit0').value = commit;
    } else if (blockIndex == 1) {
        document.getElementById('commit1').value = commit;
    }
    if (document.getElementById('commit0').value && document.getElementById('commit1').value) {
        document.querySelector('button').removeAttribute('disabled');
    }
}