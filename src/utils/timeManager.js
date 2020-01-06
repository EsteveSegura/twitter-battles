const disponibleHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const disponibleMins = [16,17,18,19,20,21,22,23,24,25];

function checkIfWeAreInTime(hour,minute) {
    let weAreInTime = false
    for (let i = 0; i < disponibleHours.length; i++) {
        for (let j = 0; j < disponibleMins.length; j++) {
            if (hour == disponibleHours[i] && minute == disponibleMins[j]) {
                weAreInTime = true;
                return weAreInTime;
            }
        }
    }
    return weAreInTime;
}

module.exports = { checkIfWeAreInTime };