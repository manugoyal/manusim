// The element object and react component for an output pin

var React = require('react')
var DOM = React.DOM;

var _ = require('underscore');
var numeric = require('numeric');

var Point = require('../util/point');
var port = require('../util/port');
var misc = require('../util/misc');

var tick = require('./tick.jsx');

function State(position, value) {
    this.position = position;
    this.value = value;
    this.inputs = [];
    this.outputs = [new port.Port(this, 0, port.output)];
    this.outputs[0].value = function() {
        return this.value;
    }.bind(this);
}

var Component = React.createClass({
    statics: {
        getPositions: function(obj) {
            var pxPerBit = 10;
            var height = 30;
            var width = pxPerBit * obj.value.length + tick.length/2;
            var tickCoords = {};
            tickCoords[port.input] = [];
            tickCoords[port.output] = [
                new Point(width - tick.length/2, height/2)];
            return {
                height: height,
                width: width,
                tickCoords: tickCoords
            };
        }
    },

    handleMouseDown: function(event) {
        // If we clicked on the output port, register a click
        if (this.refs['output_0'].wasClicked(misc.getRelativePosition(
            event, this.refs.svg.getDOMNode()))) {
            this.props.registerClick(
                this.props.stateObj.outputs[0]);
        }
        // Otherwise, start a drag
        this.props.startDrag(this.props.stateObj, event);
    },

    render: function() {
        var obj = this.props.stateObj;
        var positions = Component.getPositions(obj);
        return (
            <svg ref='svg' height={positions.height} width={positions.width}
                 style={{position: 'fixed', left: obj.position.x,
                         top: obj.position.y}}
                 onMouseDown={this.handleMouseDown}>
                <rect x={0} y={0} width={positions.width - tick.length/2}
                      height={positions.height} fill='transparent'
                      stroke='black' strokeWidth={2} />
                <text x={5} y={positions.height/2} fill='black'>
                    {obj.outputs[0].value().join('')}
                </text>
                <tick.Tick pos={positions.tickCoords[port.output][0]}
                           ref='output_0' />
            </svg>
        );
    }
});

State.prototype.renderingComponent = Component;
module.exports = State;
