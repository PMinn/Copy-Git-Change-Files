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
    const { projectId } = req.query;

    try {
        const data = fs.readFileSync('./public/data/projects.json', { encoding: 'utf8', flag: 'r' });
        const projects = JSON.parse(data);
        if (!projects[projectId]) return res.status(401).json({ error: true, message: 'projectId 不存在' });
        const path = projects[projectId].path;
        await exec('git config --global core.quotepath false', { cwd: path }); // 避免中文亂碼
        return res.status(200).json({});
    } catch (e) {
        console.log(e)
        return res.status(401).json({ error: true, ...e });
    }
}