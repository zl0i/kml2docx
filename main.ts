import * as docx from 'docx'
import fs from 'fs'
import { Folder, parseKML } from './src/parseKML';
import { createImageParagraph } from './src/docxFrames';
import { renderMap } from './src/map';
import unzipper from 'unzipper'

async function main() {

    const files = fs.readdirSync("./")

    for (const file of files) {
        if (!/^.+\.km[zl]$/gm.test(file)) {
            continue
        }

        console.log(`open ${file}`)
        const name = file.split(/\.km[zl]$/gm).join('')

        let kml: Folder[] = []

        if (file.endsWith('.kml')) {
            const buffer = fs.readFileSync(file);
            kml = await parseKML(buffer.toString())
        } else if (file.endsWith('.kmz')) {
            const buffer: string = await new Promise((resolve, reject) => {
                fs.createReadStream(file)
                    .pipe(unzipper.Parse())
                    .on("entry", function (entry) {
                        if (entry.path.indexOf(".kml") === -1) {
                            entry.autodrain();
                            return;
                        }
                        let data = "";
                        entry.on("error", reject);
                        entry.on("data", function (chunk: string) {
                            data += chunk;
                        });
                        entry.on("end", function () {
                            resolve(data);
                        });
                    })
                    .on("error", reject);
            })
            kml = await parseKML(buffer)
        } else {
            throw new Error('unknown  type file')
        }

        const childrens: docx.Paragraph[] = []
        for (const folder of kml) {
            if (folder.name.endsWith('+')) {
                console.log(folder.name, "render...")
                const map = await renderMap(folder.placemarks)
                childrens.push(createImageParagraph(map.image, folder.name, map.center, folder.name))
            } else {
                for (const mark of folder.placemarks) {
                    console.log(mark.name, "render...")
                    const map = await renderMap([mark])
                    childrens.push(createImageParagraph(map.image, mark.name, map.center, folder.name))
                }
            }
        }
        const doc = new docx.Document({
            sections: [
                {
                    properties: {},
                    children: childrens
                }
            ]
        })
        const data = await docx.Packer.toBuffer(doc)
        fs.writeFileSync(`${name}.docx`, data);
    }
}


main()
    .then(_ => {
        console.log('Successfull! Press any key to exit.');
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, 0));
    })
    .catch(err => {
        console.log('Error! Press any key to exit.');
        console.log(err)
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, 1));
    })

