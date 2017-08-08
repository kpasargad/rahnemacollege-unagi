'use strict';

const DISTANCE_RATE = 111.12;
const radiusKM = 1000;

module.exports = {
    DISTANCE_RATE: DISTANCE_RATE,
    radiusKM: radiusKM,
    radius : (radiusKM / DISTANCE_RATE)
};