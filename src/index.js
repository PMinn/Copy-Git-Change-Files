const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const engine = require("ejs-locals");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { Server } = require("socket.io");
const http = require('http');
const fs = require('fs');
const archiver = require('archiver');

const port = 60625;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.urlencoded({ extended: true }));

app.engine("ejs", engine);
app.set("views", __dirname + "/pages");
app.set("view engine", "ejs");

app.use('/static', express.static(path.join(__dirname, 'static')));

makeSureFileExisted('./static/output');

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/panel', async (req, res) => {
    let { path } = req.body;
    if (!fs.existsSync(path)) {
        res.render('error', { message: `此路徑(${path})不存在` });
        return;
    }
    try {
        var execResult = await exec('git rev-parse --show-toplevel', { cwd: path });
        if (execResult.stderr) {
            res.render('error', { message: execResult.stderr });
            return;
        }
        path = execResult.stdout.trim().replace(/\n/g, '');
    } catch {
        res.render('error', { message: `此路徑(${path})不是 git 專案` });
        return;
    }
    res.render('panel', { path });
})

app.post('/log', async (req, res) => {
    let { path, page, row } = req.body;
    await exec('git config --global core.quotepath false', { cwd: path }); // 避免中文亂碼
    const commits = await exec(`git log --pretty=format:"%h@|@%s@|@%an" --skip=${page * row} -n ${row}`, { cwd: path });
    if (commits.stderr) {
        res.render('error', { message: commits.stderr });
        return;
    }
    var choices = commits.stdout.split('\n').map(commitStr => {
        const [commit, message, author] = commitStr.split('@|@');
        return { commit, message, author };
    });
    res.json({ choices });
})

app.post('/copy', async (req, res) => {
    let { path, commit0, commit1 } = req.body;

    const diff = await exec(`git diff-tree --encoding=UTF-8 -r --no-commit-id --name-status --text --diff-filter=ACDMRT ${commit0} ${commit1}`, { cwd: path });
    if (diff.stderr) {
        res.render('error', { message: diff.stderr });
        return;
    }

    const files = diffToChanges(diff.stdout);

    res.render('copy', { path, files });
})

io.on('connection', (socket) => {
    socket.on('startCopy', async ({ checkedFiles, id, path }) => {
        const tempPath = `static/output/${id}`;
        await makeSureFileExisted('./' + tempPath);
        for (const file of checkedFiles) {
            const sourceFilePath = path + '/' + file.value;
            const tempFilePath = './' + tempPath + '/' + file.value;
            const empFileFolder = tempFilePath.substring(0, tempFilePath.lastIndexOf('/'));
            await makeSureFileExisted(empFileFolder);
            fs.copyFileSync(sourceFilePath, tempFilePath);
            socket.emit('copied', { index: file.index });
        }
        socket.emit('copy_done');

        var output = fs.createWriteStream(__dirname + `/static/output/${id}.change.zip`);
        var archive = archiver('zip');

        output.on('close', function () {
            socket.emit('archiver_finalized', { bytes: archive.pointer() });
        });

        archive.on('error', function (err) {
            socket.emit('archiver_error', { err });
        });

        archive.pipe(output);

        archive.directory(__dirname + `/${tempPath}`, false);

        archive.finalize();
    });
});

server.listen(port, () => {
    console.log(`伺服器啟動： http://localhost:${port}`);
    console.log(`檔案站存區： ${__dirname}/static/output`);
})

async function makeSureFileExisted(path_way) {
    return await new Promise((resolve, reject) => {
        fs.access(path_way, access_err => {
            if (access_err) {
                fs.mkdir(path_way, { recursive: true }, err => {
                    if (err) reject(err);
                    else resolve(true);
                });
            } else {
                resolve(true);
            }
        })
    })
}

function diffToChanges(diff) {
    return diff.split('\n').filter(line => line.length > 0).map(line => {
        return {
            status: line[0],
            file: line.split('\t')[1]
        }
    });
}