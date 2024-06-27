import * as fs from 'fs';
import { exec } from '@/utils';

export const config = {
    api: {
        bodyParser: {
            bodyParser: true
        },
    },
}

export default async function handler(req, res) {
    if (!req.query.projectId) return res.status(400).json({ error: true, message: '請提供 projectId' });
    const { projectId, page = 1 } = req.query;

    try {
        const data = fs.readFileSync('./public/data/projects.json', { encoding: 'utf8', flag: 'r' });
        const projects = JSON.parse(data);
        if (!projects[projectId]) return res.status(401).json({ error: true, message: 'projectId 不存在' });
        const path = projects[projectId].path;

        const commits = await exec(`git log --pretty=format:"%h@|@%s@|@%an" --skip=${(parseInt(page) - 1) * 10} -n 10`, { cwd: path });
        if (commits.stderr) {
            res.render('error', { stderr: commits.stderr });
            return;
        }
        var choices = commits.stdout.split('\n').map(commitStr => {
            const [commit, message, author] = commitStr.split('@|@');
            return { commit, message, author };
        });

        res.json({
            results: choices,
            next: choices.length === 10,
        });
    } catch (e) {
        console.log(e)
        return res.status(401).json({ error: true, ...e });
    }
}