// Exports a basic Point class

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.toString = function() {
    return this.x + ' ' + this.y;
};

Point.prototype.distance = function(otherPoint) {
    return Math.sqrt(Math.pow(this.x - otherPoint.x, 2) +
                     Math.pow(this.y - otherPoint.y, 2));
};

Point.prototype.withinRadius = function(otherPoint, radius) {
    return this.distance(otherPoint) <= radius;
};

Point.prototype.relativeTo = function(otherPoint) {
    return new Point(this.x - otherPoint.x, this.y - otherPoint.y);
};

module.exports = Point;
