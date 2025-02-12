var util = {};
util.isArray = function (item) {
    return Object.prototype.toString.call(item).slice(8, -1) === 'Array';
};
util.proba = function (p) {
    p = p * 10 || 1;
    var odds = Math.floor(Math.random() * 10);
    return p === 1 || odds < p;
};
util.inherits = function (type, superType) {
    var Empty = function () {
    };
    Empty.prototype = superType.prototype;
    var proto = new Empty();
    var originalPrototype = type.prototype;
    type.prototype = proto;
    for (var key in originalPrototype) {
        proto[key] = originalPrototype[key];
    }
    type.prototype.constructor = type;
    return type;
};
util.addHover = function (btn, target) {
    var events = btn.events;
    target = target ? target : btn;
    var originAlpha = target.alpha;
    events.onInputDown.add(function () {
        target.alpha = originAlpha * 0.8;
    });
    events.onInputUp.add(function () {
        target.alpha = originAlpha;
    });
};
util.firstToUpperCase = function (str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
};
module.exports = util;