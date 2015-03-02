// Exports a basic Point class

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.toString = function() {
    return this.x + ' ' + this.y;
};

Point.prototype.withinBox = function(topLeft, bottomRight) {
    return (topLeft.x <= this.x && this.x <= bottomRight.x) &&
        (topLeft.y <= this.y && this.y <= bottomRight.y);
};

module.exports = Point;
