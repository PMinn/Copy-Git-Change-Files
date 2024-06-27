import * as fs from 'fs';
import { createUUID, exec } from '@/utils';

export const config = {
    api: {
        bodyParser: {
            bodyParser: true
        },
    },
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send({ error: true, message: '只允許 POST requests' });
    if (!req.body.projectId) return res.status(400).json({ error: true, message: '請提供 projectId' });
    const { projectId } = req.body;

    try {
        const data = fs.readFileSync('./public/data/projects.json', { encoding: 'utf8', flag: 'r' });
        const projects = JSON.parse(data);
        if (!projects[projectId]) return res.status(401).json({ error: true, message: 'projectId 不存在' });
        const path = projects[projectId].path;
        let { startCommit, endCommit } = req.body;
        const diff = await exec(`git diff-tree --encoding=UTF-8 -r --no-commit-id --name-status --text --diff-filter=ACDMRT ${startCommit} ${endCommit}`, { cwd: path });
        if (diff.stderr) {
            return res.status(401).json({ error: true, stderr: diff.stderr });
        }
        const files = diff.stdout.split('\n').filter(line => line.length > 0).map(line => {
            return {
                status: line[0],
                file: line.split('\t')[1]
            }
        })

        return res.status(200).json({ files });
    } catch (e) {
        console.log(e)
        return res.status(401).json({ error: true, ...e });
    }
}