let zoomLevelIndex = 0;
let rotate = 0;
let update = 0;
let lastUpdate = 0;
let distance = 0;
const zoomLevels = [2, 3, 4, 6, 9];
let updateInterval = 8;
let zoomChangeInterval = 1000 * updateInterval;
let play = true;
let isPaneOpen = true;
let isSettingsOpen = false;
let isMetric = true;
const cities = [
    ["DOH", "Doha", 25.26, 51.55, "Asia/Qatar"],
    ["KHR", "Al Khor", 25.66, 51.50, "Asia/Qatar"],
    ["YYT", "St. John's", 47.62, -52.74, "America/St_Johns"],
    ["YLW", "Kelowna", 49.95, -119.37, "America/Vancouver"],
    ["YVR", "Vancouver", 49.19, -123.18, "America/Vancouver"],
    ["YYZ", "Toronto", 43.67, -79.63, "America/Toronto"],
    ["YOW", "Ottawa", 45.42, -75.69, "America/Toronto"],
    ["YUL", "Montreal", 45.5, -73.57, "America/Toronto"],
    ["YYC", "Calgary", 51.05, -114.07, "America/Edmonton"],
    ["DEL", "New Delhi", 28.56, 77.1, "Asia/Kolkata"],
    ["BOM", "Mumbai", 19.08, 72.88, "Asia/Kolkata"],
    ["BLR", "Bengaluru", 12.97, 77.59, "Asia/Kolkata"],
    ["HYD", "Hyderabad", 17.38, 78.48, "Asia/Kolkata"],
    ["CCU", "Kolkata", 22.57, 88.36, "Asia/Kolkata"],
    ["MAA", "Chennai", 13.08, 80.27, "Asia/Kolkata"],
    ["AUH", "Abu Dhabi", 24.43, 54.65, "Asia/Dubai"],
    ["DXB", "Dubai", 25.25, 55.36, "Asia/Dubai"],
    ["RUH", "Riyadh", 24.71, 46.68, "Asia/Riyadh"],
    ["JED", "Jeddah", 21.54, 39.17, "Asia/Riyadh"],
    ["DMM", "Dammam", 26.43, 50.1, "Asia/Riyadh"],
    ["MCT", "Muscat", 23.59, 58.28, "Asia/Muscat"],
    ["SLL", "Salalah", 17.02, 54.09, "Asia/Muscat"],
    ["IKA", "Tehran", 35.41, 51.15, "Asia/Tehran"],
    ["AMM", "Amman", 31.72, 35.99, "Asia/Amman"],
    ["KWI", "Kuwait", 29.24, 47.97, "Asia/Kuwait"],
    ["JFK", "New York", 40.64, -73.78, "America/New_York"],
    ["LAX", "Los Angeles", 33.94, -118.41, "America/Los_Angeles"],
    ["LHR", "London", 51.47, -0.45, "Europe/London"],
    ["CDG", "Paris", 49.01, 2.55, "Europe/Paris"],
    ["HND", "Tokyo", 35.55, 139.78, "Asia/Tokyo"],
    ["SYD", "Sydney", -33.87, 151.21, "Australia/Sydney"],
    ["PEK", "Beijing", 40.08, 116.59, "Asia/Shanghai"],
    ["SIN", "Singapore", 1.35, 103.99, "Asia/Singapore"],
    ["MEX", "Mexico City", 19.43, -99.13, "America/Mexico_City"],
    ["IST", "Istanbul", 41.01, 28.96, "Europe/Istanbul"],
    ["AMS", "Amsterdam", 52.31, 4.76, "Europe/Amsterdam"],
    ["MAD", "Madrid", 40.49, -3.57, "Europe/Madrid"],
    ["FRA", "Frankfurt", 50.04, 8.57, "Europe/Berlin"],
    ["MUC", "Munich", 48.35, 11.79, "Europe/Berlin"],
    ["CPT", "Cape Town", -33.93, 18.42, "Africa/Johannesburg"],
    ["BKK", "Bangkok", 13.69, 100.75, "Asia/Bangkok"],
    ["JNB", "Johannesburg", -26.13, 28.23, "Africa/Johannesburg"]
];
let dest = cities[0];
let orig = cities[5];
var latlngs2 = [[orig[2], orig[3]]];  

let map, lat, lon, plane, polyline, polyline2, origin_marker, dest_marker, interval;
const planeLogo = L.icon({iconUrl: 'img/plane.png', iconSize: [100, 100]});
let destLogo = L.divIcon({
    className: 'custom-icon',
    html: '<div><img src="img/marker.png" style="width: 20px; height: 20px;"/><span class="marker-label">'+dest[0]+'</span></div>',
    iconSize: [20, 20]
});
let originLogo = L.divIcon({
    className: 'custom-icon',
    html: '<div><img src="img/marker.png" style="width: 20px; height: 20px;"/><span class="marker-label">'+orig[0]+'</span></div>',
    iconSize: [20, 20]
});
dest_marker = L.marker([dest[2], dest[3]], {icon: destLogo, title: dest[1], zIndexOffset: 0}); 
origin_marker = L.marker([orig[2], orig[3]], {icon: originLogo, title: orig[1], zIndexOffset: 0}); 

function getCityTime(timezone) {
    const options = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };
    const cityTime = new Intl.DateTimeFormat([], options).format(new Date());
    return cityTime;
}

function getCityDate(timezone) {
    const cityTimeString = new Date().toLocaleString("en-US", { timeZone: timezone });
    return new Date(cityTimeString);
}

function addSecondsToCityTime(timezone, secondsToAdd) {
    const cityDate = getCityDate(timezone);
    cityDate.setSeconds(cityDate.getSeconds() + secondsToAdd);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return new Intl.DateTimeFormat('en-US', options).format(cityDate);
}

function startLoop(){
        navigator.geolocation.getCurrentPosition(success, error);

        function success(position) {
            $("div.no-left-panel").hide();
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            if (plane){
                map.removeLayer(plane);
                map.removeLayer(polyline);
                map.removeLayer(polyline2);
            }

            //Current to Destination
            const line = turf.greatCircle([lon, lat], [dest[3], dest[2]]);
            var latlngs = line.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            $("div.bottom-info12").text(turf.distance([lon, lat], [dest_marker.getLatLng().lng, dest_marker.getLatLng().lat], {units: 'kilometers'}).toFixed(0) + " km");

            //Origin to Current
            latlngs2.push([lat, lon]);
            polyline2 = L.polyline(latlngs2, {color: 'white', weight: 8}).addTo(map);
            updateInfo();

            plane = L.marker([lat, lon], {icon: planeLogo, zIndexOffset: 1000, rotationAngle: rotate, rotationOrigin: "center"}).addTo(map);
            polyline = L.polyline(latlngs, {color: 'white', opacity: 0.6, weight: 8}).addTo(map);
            
            if (play){
                map.setView([lat, lon], zoomLevels[zoomLevelIndex]);
            }
        }

        function error() {
            $("div.no-left-panel").css("display", "flex");
        }
    }


function updateInfo(){
    update += 1;
    if (latlngs2.length > 2){
        var diff = turf.distance(latlngs2[latlngs2.length - 1], latlngs2[latlngs2.length - 2], {units: 'kilometers'}).toFixed(0);
        if (diff < 1) {
            latlngs2.pop();
            return;
        } else {
            if (isPaneOpen){
                distance += turf.distance(latlngs2[latlngs2.length - 1], latlngs2[latlngs2.length - 2], {units: 'kilometers'});
                $("div.bottom-info10").text(distance.toFixed(0) + " km");
                var speed = (turf.distance(latlngs2[latlngs2.length - 1], latlngs2[latlngs2.length - 2], {units: 'kilometers'}) / ((update-lastUpdate)*updateInterval))*3600;
                $("div.bottom-info6").text(speed.toFixed(0) + " km/h");
                const remDist = turf.distance([lon, lat], [dest_marker.getLatLng().lng, dest_marker.getLatLng().lat], {units: 'kilometers'});
                const timeInSeconds = remDist / speed * 3600;
                const hours = Math.floor(timeInSeconds / 3600);
                const minutes = Math.floor((timeInSeconds % 3600) / 60);
                const formattedTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
                $("div.bottom-info14").text(formattedTime);
                lastUpdate = update;
                rotate = calculateHeading( latlngs2[latlngs2.length - 2][1], latlngs2[latlngs2.length - 2][0],latlngs2[latlngs2.length - 1][1], latlngs2[latlngs2.length - 1][0]);
                $("div.bottom-info2").text(getCityTime(orig[4]));
                $("div.bottom-info4").text(getCityTime(dest[4]));
                $("div.bottom-info16").text(addSecondsToCityTime(dest[4], timeInSeconds));
            }
        }
    } else {
        distance = turf.distance(latlngs2[0], latlngs2[1], {units: 'kilometers'});
        $("div.bottom-info10").text(distance.toFixed(0) + " km");
        rotate = calculateHeading( latlngs2[0][1], latlngs2[0][0],latlngs2[1][1], latlngs2[1][0]);
    }

}

function main(){
    map = L.map('map').setView([0, 0], zoomLevels[zoomLevelIndex]);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', ).addTo(map);
    setTimeout(() => {
        map.invalidateSize();
        startLoop();
    }, 500); 
    dest_marker.addTo(map);
    origin_marker.addTo(map);

    //Right Panel
    $("div.top-info1").text(orig[0]);
    $("div.top-info2").text(orig[1]);
    $("div.top-info4").text(dest[0]);
    $("div.top-info5").text(dest[1]);
    $("div.bottom-info2").text(getCityTime(orig[4]));    
    $("div.bottom-info4").text(getCityTime(dest[4]));
    
    //Continue Cycle
    map.on('drag', () => {
        play = false;
        $("a.play i").text("play_arrow");
    });
    $("a.play").click(() => {
        play = !play;
        if (play){
            $("a.play i").text("pause");
            startLoop();
        } else {
            $("a.play i").text("play_arrow");
        }
    });

    //Info Pane
    $("a.pane").click(() => {
        if (isPaneOpen){
            if (isSettingsOpen){
                $("div.settings").hide();
                $("a.settings i").css("color", "white");
                $("a.pane i").css("color", "red");
                $("div.top-info-container").css("display", "grid");
                $("div.bottom-info-container").css("display", "grid");
                isSettingsOpen = false;
                return;
            } else {
                $("div.right-panel").animate({right: "-100%"}, 500);
                $("a.pane i").css("color", "white");
                $("a.settings i").css("color", "white");
                $("div.left-panel").css("width", "100%");
            }
        } else {    
            $("div.right-panel").animate({right: "0"}, 500);
            $("a.pane i").css("color", "red");
            $("div.left-panel").css("width", "calc(100% - 25rem)");
            updateInfo();
        }
        isPaneOpen = !isPaneOpen;
        map.invalidateSize();
        startLoop();
    });

    $("div.bottom-info17").click(() => {
        isMetric = true;
        $("div.bottom-info17").css("background-color", "red");
        $("div.bottom-info18").css("background-color", "black");
        rectify();
    });

    $("div.bottom-info18").click(() => {
        isMetric = false;
        $("div.bottom-info18").css("background-color", "red");
        $("div.bottom-info17").css("background-color", "black");
        rectify();
    });

    $(window).keydown((event) => {
        if (event.keyCode === 32) {
            $("a.play").click();
        }
    });

    // Where We Fly
    $("a.home").click(() => {
        if (play){
            play = false;
            $("a.play i").text("play_arrow");
        }
        if (isSettingsOpen){
            $("a.pane").click();
            $("a.pane").click();
        } else if (isPaneOpen){
            $("a.pane").click();
        }
        $("div.wherefly").css("display", "flex");
    });

    $("div.wherefly-close").click(() => {
        $("div.wherefly").fadeOut(200);
    });

    //Settings
    $("a.settings").click(() => {
        if (!isPaneOpen){
            $("a.pane").click();
        }
        if (!isSettingsOpen){
            $("div.top-info-container").hide();
            $("div.bottom-info-container").hide();
            $("div.settings").css("display", "flex");
            $("a.settings i").css("color", "red");
            $("a.pane i").css("color", "white");
        }
        isSettingsOpen = true;
    });

    //Inputs
    for (let i = 0; i < cities.length; i++){
        $("select#origin-input").append(`<option value="${cities[i][1]}">${cities[i][1]}</option>`);
        $("select#dest-input").append(`<option value="${cities[i][1]}1">${cities[i][1]}</option>`);
    }
    $("select#origin-input").val(orig[1]);
    $("select#dest-input").val(dest[1]+"1");
    $("select#interval-input").val(updateInterval.toString()+"sec");

    $("select#origin-input").change(() => {
        const city = cities.find(city => city[1] === $("select#origin-input").val());
        orig = city;
        if (!isMetric) {
            $("div.bottom-info17").click();
        }
        map.removeLayer(origin_marker);
        originLogo = L.divIcon({
            className: 'custom-icon',
            html: '<div><img src="img/marker.png" style="width: 20px; height: 20px;"/><span class="marker-label">'+orig[0]+'</span></div>',
            iconSize: [20, 20]
        });
        origin_marker = L.marker([orig[2], orig[3]], {icon: originLogo, title: orig[1], zIndexOffset: 0}); 
        origin_marker.addTo(map);
        $("div.top-info1").text(city[0]);
        $("div.top-info2").text(city[1]);
        $("div.bottom-info2").text(getCityTime(city[4]));
        latlngs2 = [[city[2], city[3]], [lat, lon]];
        distance = turf.distance(latlngs2[0], latlngs2[1], {units: 'kilometers'});
        $("div.bottom-info10").text(distance.toFixed(0) + " km");
        map.removeLayer(polyline2);
        polyline2 = L.polyline(latlngs2, {color: 'white', weight: 8}).addTo(map);
        rotate = calculateHeading(latlngs2[0][1], latlngs2[0][0],latlngs2[1][1], latlngs2[1][0]);
        $("div.bottom-info14").text("00:00");
        $("div.bottom-info16").text("00:00");
    });

    $("select#dest-input").change(() => {
        const city = cities.find(city => city[1] === $("select#dest-input").val().slice(0, -1));
        dest = city;
        if (!isMetric) {
            $("div.bottom-info17").click();
        }
        map.removeLayer(dest_marker);
        destLogo = L.divIcon({
            className: 'custom-icon',
            html: '<div><img src="img/marker.png" style="width: 20px; height: 20px;"/><span class="marker-label">'+dest[0]+'</span></div>',
            iconSize: [20, 20]
        });
        dest_marker = L.marker([dest[2], dest[3]], {icon: destLogo, title: dest[1], zIndexOffset: 0}); 
        dest_marker.addTo(map);
        map.removeLayer(polyline);
        polyline = L.polyline(turf.greatCircle([lon, lat], [dest_marker.getLatLng().lng, dest_marker.getLatLng().lat]).geometry.coordinates.map(coord => [coord[1], coord[0]]), {color: 'white', opacity: 0.6, weight: 8}).addTo(map);
        $("div.top-info4").text(city[0]);
        $("div.top-info5").text(city[1]);
        $("div.bottom-info4").text(getCityTime(city[4]));
        latlngs = [[lon, lat], [city[2], city[3]]];
        var new_diff = turf.distance([lon, lat], [city[3], city[2]], {units: 'kilometers'}).toFixed(0);
        $("div.bottom-info12").text(new_diff + " km");
        $("div.bottom-info14").text("00:00");
        $("div.bottom-info16").text("00:00");
    });

    $("select#interval-input").change(() => {
        updateInterval = parseInt($("select#interval-input").val().slice(0, -3));
        zoomChangeInterval = 1000 * updateInterval;
        clearInterval(interval);
        interval = setInterval(() => {
            updateZoomLevel();
            startLoop();
        }, zoomChangeInterval);
    });

    interval = setInterval(() => {
        updateZoomLevel();
        startLoop();
    }, zoomChangeInterval);
}

function updateZoomLevel() {
    zoomLevelIndex += 1;
    if (zoomLevelIndex > (zoomLevels.length - 1)){
        zoomLevelIndex = 0;
    }
}

$(window).on("load", () => {
    $("div.loading").fadeOut(200);
    setTimeout(() => {
        $("div.mainapp").fadeIn(200);
    }, 200);
    main();
});

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function calculateHeading(lon1, lat1, lon2, lat2) {
    var a1 = toRadians(lat1);
    var a2 = toRadians(lat2);
    var b1 = toRadians(lon1);
    var b2 = toRadians(lon2);

    var dLon = b2 - b1;

    var y = Math.sin(dLon) * Math.cos(a2);
    var x = Math.cos(a1) * Math.sin(a2) - Math.sin(a1) * Math.cos(a2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x);
    bearing = toDegrees(bearing);

    bearing = (bearing + 360) % 360;

    return bearing;
}

function convertSpeed(value, isMetric) {
    return isMetric ? (value * 0.621371).toFixed(0) : (value / 0.621371).toFixed(0);
}

function convertDistance(value, isMetric) {
    return isMetric ? (value * 0.621371).toFixed(0) : (value / 0.621371).toFixed(0);
}

function convertHeight(value, isMetric) {
    return isMetric ? (value * 3.28084).toFixed(0) : (value / 3.28084).toFixed(0);
}

function rectify() {
    $("div.bottom-info6").each(function() {
        let text = $(this).text();
        if (isMetric) {
            const match = text.match(/(\d+\.?\d*)\s*mph/);
            if (match) {
                const value = parseFloat(match[1]);
                $(this).text(text.replace(/(\d+\.?\d*)\s*mph/, `${convertSpeed(value, isMetric)} km/h`));
            }
        } else {
            const match = text.match(/(\d+\.?\d*)\s*km\/h/);
            if (match) {
                const value = parseFloat(match[1]);
                $(this).text(text.replace(/(\d+\.?\d*)\s*km\/h/, `${convertSpeed(value, isMetric)} mph`));
            }
        }
    });

    $("div.bottom-info10, div.bottom-info12").each(function() {
        let text = $(this).text();
        if (isMetric) {
            const match = text.match(/(\d+\.?\d*)\s*mi/);
            if (match) {
                const value = parseFloat(match[1]);
                $(this).text(text.replace(/(\d+\.?\d*)\s*mi/, `${convertDistance(value, isMetric)} km`));
            }
        } else {
            const match = text.match(/(\d+\.?\d*)\s*km/);
            if (match) {
                const value = parseFloat(match[1]);
                $(this).text(text.replace(/(\d+\.?\d*)\s*km/, `${convertDistance(value, isMetric)} mi`));
            }
        }
    });

    $("div.bottom-info8").each(function() {
        let text = $(this).text();
        if (isMetric) {
            const match = text.match(/(\d+\.?\d*)\s*ft/);
            if (match) {
                const value = parseFloat(match[1]);
                $(this).text(text.replace(/(\d+\.?\d*)\s*ft/, `${convertHeight(value, isMetric)} m`));
            }
        } else {
            const match = text.match(/(\d+\.?\d*)\s*m/);
            if (match) {
                const value = parseFloat(match[1]);
                $(this).text(text.replace(/(\d+\.?\d*)\s*m/, `${convertHeight(value, isMetric)} ft`));
            }
        }
    });
}
