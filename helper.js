export const quoteCalculator = (time, carHourlyRate, availabilityStatus) => {
    if(availabilityStatus){
        return time * carHourlyRate;
    } else{
        return -1;
    }
}