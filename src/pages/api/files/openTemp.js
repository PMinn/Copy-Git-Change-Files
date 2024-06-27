import { exec } from '@/utils';

export const config = {
    api: {
        bodyParser: {
            bodyParser: true
        },
    },
}

export default async function handler(req, res) {
    try {
        exec(`start "" "${__dirname}/static/output"`);
        return res.status(200).json({});
    } catch (e) {
        console.log(e)
        return res.status(401).json({ error: true, ...e });
    }
}