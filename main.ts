import * as docx from 'docx'
import fs from 'fs/promises'
import { parseKML } from './src/parseKML';
import { createImageParagraph } from './src/docxFrames';
import { renderMap } from './src/map';


async function main() {

    const files = await fs.readdir("./")

    for (const file of files) {
        if (!file.endsWith('.kml')) {
            continue
        }
        console.log(`open ${file}`)

        const name = file.split('.kml').join('')
        const buffer = await fs.readFile(file);
        const kml = await parseKML(buffer.toString())

        const childrens: docx.Paragraph[] = []
        for (const folder of kml) {
            if (folder.name.endsWith('+')) {
                console.log(folder.name, "render...")
                const map = await renderMap(folder.placemarks)
                childrens.push(createImageParagraph(map.image, folder.name, map.center, folder.name))
            } else {
                for (const mark of folder.placemarks) {
                    console.log(mark.name, "render...")
                    const map = await renderMap(folder.placemarks)
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
        await fs.writeFile(`${name}.docx`, data);
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

