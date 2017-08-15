'use strict';

const DISTANCE_RATE = 111.12;
const radiusKM = 10;

module.exports = {
    DISTANCE_RATE: DISTANCE_RATE,
    radiusKM: radiusKM,
    radius : (radiusKM / DISTANCE_RATE)
};