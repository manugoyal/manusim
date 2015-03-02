// The element object and react component for the AND gate

var React = require('react')
, DOM = React.DOM
, _ = require('underscore')
, numeric = require('numeric')

, Point = require('../util/point')
, port = require('../util/port')
, tick = require('./tick')
, misc = require('../util/misc')
;

function State(position, numInputs) {
    this.position = position;
    if (numInputs < 2) {
        throw 'Cannot create AND gate with fewer than two inputs';
    }
    this.inputs = _.times(numInputs, function(num) {
        return new port.Port(this, num, port.input);
    }.bind(this));

    this.outputs = [new port.Port(this, 0, port.output)];
    this.outputs[0].fromPorts = this.inputs.slice(0, this.inputs.length);
    _.each(this.inputs, function(inputPort) {
        inputPort.toPorts.push(this.outputs[0]);
    }.bind(this));

    // We add an additional checker that makes sure all the input values have
    // the same length
    this.outputs[0].checkers.push(function() {
        var dataLength = null;
        return _.every(this.inputs, function (port) {
            var val = port.value();
            if (_.isUndefined(val)) {
                return false;
            }
            if (_.isNull(dataLength)) {
                dataLength = val.length;
                return true;
            } else {
                return dataLength == val.length;
            }
        });
    }.bind(this));

    this.outputs[0].value = function() {
        // Perform a bitwise and of the input port values
        values = [];
        _.each(this.fromPorts, function(port) {
            if (_.isUndefined(values)) {
                return;
            }
            var portVal = port.value();
            if (_.isUndefined(portVal)) {
                values = undefined;
            } else {
                values.push(portVal);
            }
        });
        if (_.isUndefined(values)) {
            return undefined;
        }
        return _.reduce(values, function(existing, newvalue) {
            _.each(_.range(newvalue.length), function(index) {
                existing[index] = existing[index] & newvalue[index];
            });
            return existing;
        });
    }.bind(this.outputs[0]);
}

var Component = React.createClass({
    statics: {
        // Must at least export the relative coordinates of the input and output
        // ticks as the property 'tickCoords'
        getPositions: function(obj) {
            var baseSize = Math.max(100, (obj.inputs.length + 2) * tick.vSpace);
            var startPoint = new Point(tick.length/2, 0);
            var endPoint = new Point(tick.length/2, baseSize);
            var horizLineTop = new Point(baseSize * 2/3, 0);
            var horizLineBottom = new Point(horizLineTop.x, baseSize);
            // This is the maximum point of the curve, which should lie halfway
            // between the start and end points in y position
            var maxPoint = new Point(baseSize - tick.length/2, baseSize/2);
            // The control point of the bezier curve should be such that the
            // maximum of the curve falls on maxPoint. The time at the maximum
            // will be 0.5, so we need the horizontal halfway point of the line
            // between horizLineBottom and controlPoint to be at this maximum.
            // This means, the x coordinate of the control point should be twice
            // (maxPoint.x - horizLineBottom.x) and the y coordinate should be
            // maxPoint.y
            var controlPoint = new Point(horizLineBottom.x +
                                         2 * (maxPoint.x - horizLineBottom.x),
                                         maxPoint.y);
            var tickCoords = {};
            tickCoords[port.input] = _.map(
                numeric.linspace(
                    startPoint.y + tick.vSpace,
                    endPoint.y - tick.vSpace,
                    obj.inputs.length),
                function(ycoord) {
                    return new Point(startPoint.x, ycoord);
                });
            tickCoords[port.output] = [maxPoint];
            return {
                baseSize: baseSize,
                startPoint: startPoint,
                endPoint: endPoint,
                horizLineTop: horizLineTop,
                horizLineBottom: horizLineBottom,
                maxPoint: maxPoint,
                controlPoint: controlPoint,
                tickCoords: tickCoords
            };
        }
    },

    // If the ticks are being clicked, do nothing for now. Otherwise, tell the
    // parent container that we're entering drag mode.
    handleMouseDown: function(event) {
        var svg = this.refs.svg.getDOMNode();
        var relativePos = misc.getRelativePosition(event, svg);

        // Checks if we clicked on an input port
        var clickedInputPort = _.find(
            _.range(this.props.stateObj.inputs.length),
            function(portInd) {
                return this.refs['input_' + portInd].wasClicked(relativePos);
            }.bind(this));
        if (!_.isUndefined(clickedInputPort)) {
            console.log('clicked input port ' + clickedInputPort);
            this.props.registerClick(
                this.props.stateObj.inputs[clickedInputPort]);
            return;
        }

        // Checks if we clicked the output port
        if (this.refs['output_0'].wasClicked(relativePos)) {
            console.log('clicked output pin');
            this.props.registerClick(
                this.props.stateObj.outputs[0]);
            return;
        }

        // Otherwise, we're clicking the gate itself, so we want to be in drag
        // mode.
        this.props.startDrag(this.props.stateObj, event);
    },

    render: function() {
        var obj = this.props.stateObj;
        var positions = Component.getPositions(obj);
        var inputTicks = _.map(_.range(obj.inputs.length), function (ind) {
            return tick.Tick({
                pos: positions.tickCoords[port.input][ind],
                key: 'input_' + ind,
                ref: 'input_' + ind});
        });

        var outputTick = tick.Tick({
            pos: positions.maxPoint, ref: 'output_0'});

        return DOM.svg(
            {ref: 'svg', height: positions.baseSize, width: positions.baseSize,
             style: {position: 'fixed', left: obj.position.x,
                     top: obj.position.y},
             onMouseDown: this.handleMouseDown},
            DOM.path(
                {d: 'M ' + positions.startPoint +
                 ' L ' + positions.endPoint +
                 ' L ' + positions.horizLineBottom +
                 ' M ' + positions.startPoint +
                 ' L ' + positions.horizLineTop +
                 ' M ' + positions.horizLineBottom +
                 ' Q ' + positions.controlPoint +
                 ', ' + positions.horizLineTop,
                 stroke: 'black', fill: 'white', strokeWidth: 2
                }),
            inputTicks,
            outputTick
        );
    }
});

// Each state object points to the container used to render it
State.prototype.renderingComponent = React.createFactory(Component);
module.exports = State;
