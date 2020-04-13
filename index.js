var lapiKey = 'da98a6b7f12d65';
var gapi = 'AIzaSyA0jFg9bjRxBnLTd4zj4fbYxvoxDT0AdXk';
var districtCount = [];
var unknownLocationDistricts = [];


window.onload = function() {
    function fetchDistrictData() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(xhttp.responseText);
                for (state of data) {
                    for (district of state['districtData']) {
                        var name = district['district'];
                        districtCount.push({
                            'name': name,
                            'count': district['confirmed']
                        });
                        if (coordinates[name]) {
                            districtCount[districtCount.length - 1].location = {
                                x: coordinates[name].location.x,
                                y: coordinates[name].location.y
                            }
                        } else {
                            unknownLocationDistricts.push({
                                name: name,
                                pointer: districtCount.length - 1
                            });
                        }
                    }
                }
    
                document.getElementById('data').innerHTML = JSON.stringify(districtCount);
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

    fetchDistrictData();
}
