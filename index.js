var lapiKey = 'da98a6b7f12d65';
var districtCount = [];


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
            if (current < districtCount.length) {
                send();
                current++;
            } else {
                stopPing();
            }
        }, 1000);

        function stopPing() {
            clearInterval(ping);
        }

        function send() {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                var locdata = JSON.parse(xhttp.responseText);
                console.log(locdata[0]);
                if (locdata && locdata[0]) {
                    districtCount[current].location = {
                        'x': Number(locdata[0]["lat"]),
                        'y': Number(locdata[0]["lon"])
                    };
                }

                console.log(districtCount[current]);

                document.getElementById('data').innerHTML = JSON.stringify(districtCount);
            }

            var name = districtCount[current]['name'];

            xhttp.open("GET", "https://us1.locationiq.com/v1/search.php?key=" + lapiKey + "&q=" + name + "&format=json", true);
            xhttp.send();
        }

    }

    fetchDistrictData();
}

//
//xhttp.send()