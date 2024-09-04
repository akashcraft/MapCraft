let zoomLevel = 4;
const minZoom = 2; // Minimum zoom level
const maxZoom = 5; // Maximum zoom level
const zoomChangeInterval = 8000; // Time between each zoom change in milliseconds

function fetch(){
    navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        let url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoomLevel}&size=1600x1600&scale=2&maptype=hybrid&key=AIzaSyAdyphEWE8C7DUYeuWlDJ95Iy7PYp3yYxw`;
        $("div.left-panel").html(`<img src="${url}" width="100%" height="100%" style="border:0; object-fit:cover;">`);
    });
}

function updateZoomLevel() {
    zoomLevel -= 1;
    if (zoomLevel < minZoom) {
        zoomLevel = maxZoom;
    }
}

function startLoop(){
    setInterval(() => {
        updateZoomLevel();
        fetch();
    }, zoomChangeInterval);
}

function main(){
    fetch(); // Initial fetch
    startLoop(); // Start periodic fetches with zoom level changes
}

$(window).on("load", () => {
    $("div.loading").fadeOut(200);
    setTimeout(() => {
        $("div.mainapp").fadeIn(200);
    }, 200);
    main();
});
