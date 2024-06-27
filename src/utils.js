import * as fs from 'fs';
import util from 'util';
import { exec as child_process_exec } from 'child_process';

export const exec = util.promisify(child_process_exec);

export function createUUID() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') d += performance.now();
    return 'CGCF_xxxx_4xxx_yxxx_xxxx'.replace(/[x]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export async function checkPath(path) {
    try {
        const statsObj = fs.statSync(path);
        if (statsObj.isFile()) {
            path = path.substring(0, path.lastIndexOf('/'));
        } else if (!statsObj.isDirectory()) {
            return { error: true, message: `此路徑 (${path}) 不存在` };
        }
    } catch {
        return { error: true, message: `此路徑 (${path}) 不存在` };
    }

    try {
        var execResult = await exec('git rev-parse --show-toplevel', { cwd: path });
        if (execResult.stderr) return { error: true, message: execResult.stderr };
        return { path: execResult.stdout.trim().replace(/\n/g, '') };
    } catch {
        return { error: true, message: `此路徑 (${path}) 不是 git 專案` };
    }
}

export async function makeSureFileExisted(path_way) {
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