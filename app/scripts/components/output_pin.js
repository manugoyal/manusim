// The element object and react component for an output pin

var React = require('react')
, DOM = React.DOM
, _ = require('underscore')
, numeric = require('numeric')

, Point = require('../util/point')
, port = require('../util/port')
, tick = require('./tick')
, misc = require('../util/misc')
;

function State(position, dataBits) {
    this.position = position;
    if (dataBits < 1) {
        throw 'Cannot create output pin with fewer than one data bit';
    }
    this.dataBits = dataBits;
    this.inputs = [new port.Port(this, 0, port.input)];
    this.outputs = [];
}

var Component = React.createClass({
    statics: {
        getPositions: function(obj) {
            var pxPerBit = 10;
            var height = 30;
            var width = pxPerBit * obj.dataBits + tick.length/2;
            var tickCoords = {};
            tickCoords[port.input] = [new Point(tick.length/2, height/2)];
            tickCoords[port.output] = [];
            return {
                height: height,
                width: width,
                tickCoords: tickCoords
            };
        }
    },

    handleMouseDown: function(event) {
        // If we clicked on the input port, register a click
        if (this.refs['input_0'].wasClicked(misc.getRelativePosition(
            event, this.refs.svg.getDOMNode()))) {
            this.props.registerClick(
                this.props.stateObj.inputs[0]);
        }
        // Otherwise, start a drag
        this.props.startDrag(this.props.stateObj, event);
    },

    render: function() {
        var obj = this.props.stateObj;
        var positions = Component.getPositions(obj);
        var inputTick = tick.Tick({
            pos: positions.tickCoords[port.input][0], ref: 'input_0'});
        var inputValue = obj.inputs[0].value();

        return DOM.svg(
            {ref: 'svg', height: positions.height,
             width: positions.width,
             style: {position: 'fixed', left: obj.position.x,
                     top: obj.position.y},
             onMouseDown: this.handleMouseDown},
            DOM.rect(
                {x: tick.length/2, y: 0, width: positions.width - tick.length/2,
                 height: positions.height,
                 fill: 'transparent', stroke: 'black', strokeWidth: 2
                }),
            DOM.text(
                {x: tick.length+5, y: positions.height/2, fill: 'black'},
                _.isUndefined(inputValue) ? 'undefined' : inputValue.join('')),
            inputTick
        );
    }
});

State.prototype.renderingComponent = Component;
module.exports = State;
