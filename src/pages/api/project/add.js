import * as fs from 'fs';
import { createUUID, checkPath } from '@/utils';

export const config = {
    api: {
        bodyParser: {
            bodyParser: true
        },
    },
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send({ error: true, message: '只允許 POST requests' });
    if (!req.body.name || !req.body.path) return res.status(400).json({ error: true, message: '請提供 name 和 path' });
    try {
        req.body.path = req.body.path.replaceAll('\\', '/');
        const id = createUUID();
        const data = fs.readFileSync('./public/data/projects.json', { encoding: 'utf8', flag: 'r' });
        const projects = JSON.parse(data);
        var checkPathResult = await checkPath(req.body.path);
        console.log(checkPathResult)
        if (checkPathResult.error) return res.status(400).json(checkPathResult);
        req.body.path = checkPathResult.path;
        projects[id] = req.body;
        fs.writeFileSync("./public/data/projects.json", JSON.stringify(projects));
        return res.status(200).json({ projects, id });
    } catch (e) {
        console.log(e)
        return res.status(401).json({ error: true, ...e });
    }
}