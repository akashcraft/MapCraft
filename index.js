let zoomLevelIndex = 0;
let rotate = 0;
let update = 0;
let lastUpdate = 0;
let distance = 0;
const zoomLevels = [3, 4, 5, 6, 9];
const zoomChangeInterval = 5000;
let play = true;
let isPaneOpen = true;
let isMetric = true;
const doha = ["DOH","Doha",25.26, 51.55,"Asia/Qatar"];
const toronto = ["YYZ","Toronto",43.67, -79.63,"America/Toronto"];
const stjohns = ["YYT","St. John's",47.62, -52.74,"America/St_Johns"];
const vancouver = ["YVR","Vancouver",49.19, -123.18,"America/Vancouver"];
const dest = toronto;
const orig = stjohns;
var latlngs2 = [[orig[2], orig[3]]];  

let map, lat, lon, plane, polyline, polyline2, origtime, desttime;
const planeLogo = L.icon({iconUrl: 'img/plane.png', iconSize: [100, 100]});
const destLogo = L.divIcon({
    className: 'custom-icon',
    html: '<div><img src="img/marker.png" style="width: 20px; height: 20px;"/><span class="marker-label">'+dest[0]+'</span></div>',
    iconSize: [20, 20]
});
const originLogo = L.divIcon({
    className: 'custom-icon',
    html: '<div><img src="img/marker.png" style="width: 20px; height: 20px;"/><span class="marker-label">'+orig[0]+'</span></div>',
    iconSize: [20, 20]
});
var dest_marker = L.marker([dest[2], dest[3]], {icon: destLogo, title: dest[1], zIndexOffset: 0}); 
var origin_marker = L.marker([orig[2], orig[3]], {icon: originLogo, title: orig[1], zIndexOffset: 0}); 

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
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            if (plane){
                map.removeLayer(plane);
                map.removeLayer(polyline);
                map.removeLayer(polyline2);
            }

            //Current to Destination
            const line = turf.greatCircle([lon, lat], [dest_marker.getLatLng().lng, dest_marker.getLatLng().lat]);
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
            window.alert("Unable to retrieve your location");
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
                var speed = (turf.distance(latlngs2[latlngs2.length - 1], latlngs2[latlngs2.length - 2], {units: 'kilometers'}) / ((update-lastUpdate)*5))*3600;
                $("div.bottom-info6").text(speed.toFixed(0) + " km/hr");
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
            $("div.right-panel").animate({right: "-100%"}, 500);
            $("a.pane i").css("color", "white");
            $("div.left-panel").css("width", "100%");
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

    setInterval(() => {
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
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const λ1 = toRadians(lon1);
    const λ2 = toRadians(lon2);

    const dLon = λ2 - λ1;

    const y = Math.sin(dLon) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dLon);

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
