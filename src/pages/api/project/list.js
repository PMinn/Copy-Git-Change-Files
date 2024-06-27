import * as fs from 'fs';
export const config = {
    api: {
        bodyParser: {
            bodyParser: true
        },
    },
}

export default async function handler(req, res) {
    // if (req.method !== 'POST') return res.status(405).send({ message: '只允許 POST requests' })
    try {
        const data = fs.readFileSync('./public/data/projects.json', { encoding: 'utf8', flag: 'r' });
        const projects = JSON.parse(data);
        return res.status(200).json({ projects });
    } catch (e) {
        console.log(e)
        return res.status(401).json({ error: true, ...e });
    }
}