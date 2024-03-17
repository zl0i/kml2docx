import * as docx from 'docx'

export function createImageParagraph(image: Buffer, name: string, coord: number[], type: string) {

    return new docx.Paragraph({
        children: [
            new docx.ImageRun({
                data: image,
                transformation: {
                    width: 600,
                    height: 400,
                }
            }),
            new docx.Paragraph({}),
            new docx.Paragraph({}),
            new docx.Table({
                alignment: docx.AlignmentType.CENTER,
                rows: [
                    new docx.TableRow({
                        children: [
                            new docx.TableCell({
                                width: {
                                    size: '200mm',
                                    // type: "auto"
                                },
                                children: [new docx.Paragraph("Название")],
                            }),
                            new docx.TableCell({
                                width: {
                                    size: '100mm',
                                    // type: "auto"
                                },
                                children: [new docx.Paragraph("Координаты")],
                            }),
                            new docx.TableCell({
                                width: {
                                    size: '300mm',
                                    // type: "auto"
                                },
                                children: [new docx.Paragraph("Тип")],
                            }),
                        ],
                    }),
                    new docx.TableRow({
                        children: [
                            new docx.TableCell({
                                children: [new docx.Paragraph(name)],
                            }),
                            new docx.TableCell({
                                children: [new docx.Paragraph(`${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}`)],
                            }),
                            new docx.TableCell({
                                children: [new docx.Paragraph(type)],
                            }),
                        ],
                    }),
                ]
            }),
        ]
    })
}