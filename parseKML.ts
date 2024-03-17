import * as xml2js from "xml2js"


export interface Placemarks {
    name: string
    type: 'Point' | 'Polygon' | 'Line'
    coords: [number, number][]
}

export interface Folder {
    name: string
    placemarks: Placemarks[]
}

export async function parseKML(kml: string): Promise<Folder[]> {

    return new Promise((res, rej) => {
        xml2js.parseString(kml, (err, data) => {
            if (err)
                rej(err)

            const result: Folder[] = []
            for (const folder of data.kml.Document[0].Folder) {
                const placemarks: Placemarks[] = []
                for (const placemark of folder.Placemark) {
                    if (placemark.Point) {
                        const [lon, lat, _alt] = placemark.Point[0].coordinates[0].split(',').map(Number)
                        placemarks.push({
                            name: placemark.name[0],
                            type: "Point",
                            coords: [[lon, lat]]
                        })
                    } else if (placemark.Polygon) {
                        const coords = placemark.Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].split(' ').map((p: string) => p.split(',').map(Number))
                        placemarks.push({
                            name: placemark.name[0],
                            type: "Polygon",
                            coords: coords
                        })
                    }
                }
                result.push({
                    name: folder.name[0],
                    placemarks: placemarks
                })
            }
            res(result)
        })
    })

}


