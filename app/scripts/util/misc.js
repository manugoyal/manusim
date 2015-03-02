// Miscellaneous utility functions

var Point = require('./point');

module.exports.getAbsolutePosition = function(refnode) {
    return new Point(refnode.offsetLeft, refnode.offsetTop);
};

module.exports.getRelativePosition = function(event, refnode) {
    var refX = refnode.offsetLeft,
        refY = refnode.offsetTop;
    return new Point(event.pageX - refX, event.pageY - refY);
};
