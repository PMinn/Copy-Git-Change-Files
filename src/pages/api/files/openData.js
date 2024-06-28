import { exec } from '@/utils';
import path from 'path';
export const config = {

    api: {
        bodyParser: {
            bodyParser: true
        },
    },
}

export default async function handler(req, res) {
    try {
        const dirPath = path.join(__dirname, '../../../../../public/data');
        exec(`start "" "${dirPath}"`);
        return res.status(200).json({});
    } catch (e) {
        console.log(e)
        return res.status(401).json({ error: true, ...e });
    }
}