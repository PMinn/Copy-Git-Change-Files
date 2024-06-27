import * as fs from 'fs';
import { makeSureFileExisted, exec } from '@/utils';
import AdmZip from 'adm-zip';

export const config = {
    api: {
        bodyParser: {
            bodyParser: true
        },
    },
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send({ error: true, message: '只允許 POST requests' });
    if (!req.body.projectId && !req.body.checkedFiles) return res.status(400).json({ error: true, message: '請提供 projectId 和 checkedFiles' });
    const { projectId, checkedFiles } = req.body;
    const now = new Date();
    const timeFlag = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + '.' + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');

    try {
        const data = fs.readFileSync('./public/data/projects.json', { encoding: 'utf8', flag: 'r' });
        const projects = JSON.parse(data);
        if (!projects[projectId]) return res.status(401).json({ error: true, message: 'projectId 不存在' });
        const { path, name } = projects[projectId];

        const tempPath = `temp/${name}.${timeFlag}`;
        await makeSureFileExisted(`./public/${tempPath}`);

        for (const file of checkedFiles) {
            const sourceFilePath = `${path}/${file.file}`;
            const tempFilePath = `./public/${tempPath}/${file.file}`;
            const empFileFolder = tempFilePath.substring(0, tempFilePath.lastIndexOf('/'));
            await makeSureFileExisted(empFileFolder);
            fs.copyFileSync(sourceFilePath, tempFilePath);
        }

        const zip = new AdmZip();
        zip.addLocalFolder(`./public/${tempPath}`);
        await zip.writeZipPromise(`./public/${tempPath}.change.zip`);

        res.status(200).json({ path: tempPath });
    } catch (e) {
        console.log(e)
        return res.status(401).json({ error: true, ...e });
    }
}