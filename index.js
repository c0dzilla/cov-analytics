var lapiKey = 'FILL_YOUT_OWN';
var districtCount = [];
var unknownLocationDistricts = [];

function updateMap(data) {
    console.log(data);
    // absurd
    if (data.location.x <= -90 || data.location.x >= 90 || data.location.y <= 0 || data.location.y >= 180) return; 
    //Here's an example where we use external CSS to specify background image, size, etc
    //https://www.mapbox.com/mapbox-gl-js/api#marker

    // Create a popup
    var popup = new mapboxgl.Popup()
    .setHTML(
        'Dis: ' + data.name +
        ", conf: " + data.count +
        ", rec: " + data.recovered +
        ", d: " + data.deceased +
        ", (xy): " + "(" + data.location.x + "," + data.location.y + ")"
    );

    // first create DOM element for the marker
    var el = document.createElement('div');
    el.className = 'markerWithExternalCss';
    // finally, create the marker
    var markerWithExternalCss = new mapboxgl.Marker(el)
        .setLngLat([data.location.y, data.location.x])
        .setPopup(popup)
        .addTo(map);
}

function fetchDistrictData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(xhttp.responseText);
            for (state of data) {
                var stateEntry = {
                    'name': state['state'],
                    'count': 0,
                    'recovered': 0,
                    'deceased': 0
                };
                for (district of state['districtData']) {
                    var name = district['district'];
                    var count = district['confirmed'];
                    var recovered = district['recovered'];
                    var deceased = district['deceased'];

                    stateEntry.count += count;
                    stateEntry.recovered += recovered;
                    stateEntry.deceased += deceased;

                    if (name.toLowerCase() == 'unknown') {
                        continue;
                    }

                    districtCount.push({
                        'name': name,
                        'count': count,
                        'recovered': recovered,
                        'deceased': deceased
                    });
                    if (coordinates[name]) {
                        districtCount[districtCount.length - 1].location = {
                            x: coordinates[name].location.x,
                            y: coordinates[name].location.y
                        }

                        if (mapset) updateMap(districtCount[districtCount.length - 1]);
                    } else {
                        unknownLocationDistricts.push({
                            name: name,
                            pointer: districtCount.length - 1
                        });
                    }
                }

                if (coordinates[stateEntry.name]) {
                    stateEntry.location = {
                        x: coordinates[stateEntry.name].location.x,
                        y: coordinates[stateEntry.name].location.y
                    }
                    if (mapset) updateMap(stateEntry);
                } else {
                    unknownLocationDistricts.push({
                        name: stateEntry.name,
                        pointer: districtCount.length
                    });
                }

                districtCount.push(stateEntry);
                
            }

            try {
                document.getElementById('data').innerHTML = JSON.stringify(districtCount);
            } catch(e) {
                console.log(e);
            }
            fetchGeolocations();
        }
    };

    xhttp.open("GET", "https://api.covid19india.org/v2/state_district_wise.json", true);
    xhttp.send();
}

function fetchGeolocations() {
    var current = 0;

    var ping = setInterval(function() {
        if (current < unknownLocationDistricts.length) {
            send();
            current += 1;
        } else {
            stopPing();
        }
    }, 2000);

    function stopPing() {
        clearInterval(ping);
    }

    function send() {
        var xhttp = new XMLHttpRequest();
        var name = unknownLocationDistricts[current].name;
        var index = unknownLocationDistricts[current].pointer;

        xhttp.onreadystatechange = function() {
            try {
                var locdata = JSON.parse(xhttp.responseText);

                if (locdata && locdata[0]) {
                    districtCount[index].location = {
                        'x': Number(locdata[0]["lat"]),
                        'y': Number(locdata[0]["lon"])
                    };
                }

                if (mapset) updateMap(districtCount[index]);

                document.getElementById('data').innerHTML = JSON.stringify(districtCount);

            } catch (e) {
                console.log(e);
                return;
            }
        }

        xhttp.open("GET", "https://us1.locationiq.com/v1/search.php?key=" + lapiKey + "&q=" + name + "&format=json", true);
        xhttp.send();
    }

}
