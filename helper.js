export const quoteCalculator = (time, carHourlyRate, availabilityStatus) => {
    if(availabilityStatus){
        return time * carHourlyRate;
    } else{
        return -1;
    }
}
export const calculateDistance = (origin, destination) => {
    var directionsService = new google.maps.DirectionsService();

    var request = {
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING' 
    };

    var response = directionsService.route(request);

    if (response && response.status === 'OK') {
        var route = response.routes[0];

        var totalDistance = 0;
        for (var i = 0; i < route.legs.length; i++) {
            totalDistance += route.legs[i].distance.value;
        }

        totalDistance = totalDistance / 1000;

        return totalDistance;
    } else {
        return response.status;
    }
}