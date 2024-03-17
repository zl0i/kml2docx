import { Placemarks } from "./parseKML";
import StaticMaps from 'staticmaps';


export async function renderMap(placemarks: Placemarks[]) {
    const map = new StaticMaps({
        width: 600,
        height: 400,
        paddingX: 50,
        paddingY: 50,
        tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    });
    let max_lat = -90
    let min_lat = 90
    let max_lon = -180
    let min_lon = 180


    for (const mark of placemarks) {
        const maxMin = maxMinLatLon(mark)
        max_lat = Math.max(max_lat, maxMin.max_lat)
        min_lat = Math.min(min_lat, maxMin.min_lat)
        max_lon = Math.max(max_lon, maxMin.max_lon)
        min_lon = Math.min(min_lon, maxMin.min_lon)
    }
    const center = [(max_lon + min_lon) / 2, (max_lat + min_lat) / 2]

    for (const mark of placemarks) {
        if (mark.type == 'Point') {
            map.addMarker({
                coord: mark.coords[0],
                height: 48,
                img: `./marker.png`,
                width: 58
            })
        } else if (mark.type == "Line") {

        } else if (mark.type == "Polygon") {
            map.addPolygon({
                coords: mark.coords,
                width: 2,
                color: 'red'
            })
        }
    }
    await map.render(center);
    return {
        image: await map.image.buffer('image/jpeg', { quality: 75 }),
        center,
    }
}


function maxMinLatLon(mark: Placemarks) {
    if (mark.type == 'Point') {
        return {
            max_lat: mark.coords[0][1],
            max_lon: mark.coords[0][0],
            min_lat: mark.coords[0][1],
            min_lon: mark.coords[0][0]
        }
    } else if (mark.type == 'Line') {
        return {  //TODO: refactor
            max_lat: mark.coords[0][1],
            max_lon: mark.coords[0][0],
            min_lat: mark.coords[1][1],
            min_lon: mark.coords[1][0]
        }
    } else if (mark.type == 'Polygon') {
        let max_lat = -90
        let min_lat = 90
        let max_lon = -180
        let min_lon = 180

        for (const coord of mark.coords) {
            const lat = coord[1]
            const lon = coord[0]
            max_lat = Math.max(max_lat, lat)
            min_lat = Math.min(min_lat, lat)
            max_lon = Math.max(max_lon, lon)
            min_lon = Math.min(min_lon, lon)
        }

        return {
            max_lat, max_lon, min_lat, min_lon
        }
    }
    throw new Error('unknown type mark')
}