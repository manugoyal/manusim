// A tick is an input or output of a gate that wires can be connected to.
var React = require('react');
var DOM = React.DOM;

var _ = require('underscore');

var Point = require('../util/point');

var length = 10;
// The radius around which clicking will associate with the tick
var clickRadius = 10;
// The spacing around each tick
var vSpace = 20;

var Tick = React.createClass({
    getPos: function() {
        return this.props.pos;
    },

    wasClicked: function(relativePos) {
        return relativePos.withinBox(
            new Point(this.props.pos.x - length/2 - clickRadius,
                      this.props.pos.y - clickRadius),
            new Point(this.props.pos.x + length/2 + clickRadius,
                      this.props.pos.y + clickRadius));
    },

    render: function() {
        return (
            <line
                 x1={this.props.pos.x - length/2}
                 y1={this.props.pos.y}
                 x2={this.props.pos.x + length/2}
                 y2={this.props.pos.y}
                 stroke='blue'>
            </line>
        );
    }
});

module.exports.length = length;
module.exports.clickRadius = clickRadius;
module.exports.vSpace = vSpace;
module.exports.Tick = Tick;
