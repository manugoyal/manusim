// A tick is an input or output of a gate that wires can be connected to.
var React = require('react');

var length = 10;
// The radius around which clicking will associate with the tick
var clickRadius = 15;
// The spacing around each tick
var space = 2*clickRadius;

var Tick = React.createClass({
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
module.exports.space = space;
module.exports.Tick = Tick;
