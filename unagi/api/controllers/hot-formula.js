'use strict';

var hotness = function (likes, date) {
    var order = log(max(likes, 1), 10);
    var seconds = date - 1134028003;
    return round(order + seconds / 45000, 7);
};
module.exports.hotness = hotness;
