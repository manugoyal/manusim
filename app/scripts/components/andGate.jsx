// The element object and react component for the AND gate

var React = require('react')
var Backbone = require('backbone');
var _ = require('underscore');
var numeric = require('numeric');

var Point = require('../util/point');

var Port = require('../data/port');

var Tick = require('./tick.jsx');
var TickOrDragMixin = require('./tickOrDragMixin');

var AndView = React.createClass({
    statics: {
        getPositions: function(element) {
            var elementPos = element.get('position');
            // The first array is input ports, the second is output ports
            var splitPorts = _.partition(element.get('ports'), function(port) {
                return port instanceof Port.InputPort;
            });
            var inputPorts = splitPorts[0];
            var outputPorts = splitPorts[1];
            var baseSize = inputPorts.length * Tick.space;
            var topLeft = new Point(elementPos.x + Tick.length/2, elementPos.y);
            var bottomLeft = new Point(topLeft.x, elementPos.y + baseSize);
            var topLineEnd = new Point(topLeft.x + baseSize * 2/3, topLeft.y);
            var bottomLineEnd = new Point(topLineEnd.x, bottomLeft.y);
            // This is the maximum point of the curve, which is also the
            // location of the output tick
            var outputTick = new Point(elementPos.x + baseSize - Tick.length/2,
                                       elementPos.y + baseSize/2);
            // The control point of the bezier curve should be such that the
            // maximum of the curve falls on outputTick. The time at the maximum
            // will be 0.5, so we need the x position of the line
            // between topLineEnd and controlPoint to be at this maximum.
            // This means, the x coordinate of the control point should be
            // topLineEnd plus twice the distance between outputTick and
            // topLineEnd
            var controlPoint = new Point(
                topLineEnd.x + 2*(outputTick.x - topLineEnd.x),
                outputTick.y);
            var tickCoords = new Array(element.get('ports').length);
            // The input ticks are evenly spaced between topLeft and bottomLeft,
            // with a margin of one tick radius on each side
            var ycoords = numeric.linspace(
                topLeft.y + Tick.clickRadius, bottomLeft.y - Tick.clickRadius,
                inputPorts.length);
            _.each(inputPorts, function(port, inputPortNum) {
                tickCoords[port.get('ind')] = new Point(
                    topLeft.x, ycoords[inputPortNum]);
            });
            tickCoords[outputPorts[0].get('ind')] = outputTick;
            return {
                baseSize: baseSize,
                topLeft: topLeft,
                bottomLeft: bottomLeft,
                topLineEnd: topLineEnd,
                bottomLineEnd: bottomLineEnd,
                controlPoint: controlPoint,
                tickCoords: tickCoords
            };
        }
    },

    mixins: [TickOrDragMixin],

    render: function() {
        var obj = this.props.element;
        var positions = AndView.getPositions(obj);
        var ticks = _.map(positions.tickCoords, function(pos) {
            return (<Tick.Tick pos={pos} key={pos} />);
        });

        return (
            <g height={positions.baseSize} width={positions.baseSize}
               x={obj.get('position').x} y={obj.get('position').y}
               onMouseDown={this.handleMouseDown}>
                <path d={'M ' + positions.topLineEnd +
                         ' L ' + positions.topLeft +
                         ' L ' + positions.bottomLeft +
                         ' L ' + positions.bottomLineEnd +
                         ' M ' + positions.topLineEnd +
                         ' Q ' + positions.controlPoint +
                         ', ' + positions.bottomLineEnd}
                      stroke='black' fill='white' strokeWidth={2} />
            {ticks}
            </g>
        );
    }
});

var AndOutputPort = Port.OutputPort.extend({
    evaluate: function(inputPorts) {
        // Perform a bitwise and of the input port values
        if (inputPorts.length !== this.get('requiredInputs')) {
            return null;
        }
        var result = inputPorts[0].get('value').slice();
        _.each(_.range(1, inputPorts.length), function(ind) {
            if (_.isNull(result)) {
                // Aborted computation
                return;
            }
            var portValue = inputPorts[ind].get('value');
            if (result.length !== portValue.length) {
                this.set({error: 'dataBits mismatch at input ' + ind});
                result = null;
                return;
            }
            _.each(portValue, function(bit, bitInd) {
                result[bitInd] = result[bitInd] & bit;
            });
        }.bind(this));
        return result;
    }
});

var AndElement = Backbone.Model.extend({
    initialize: function() {
        if (!this.has('position')) {
            throw 'Initial position required';
        } else if (!this.has('numInputs')) {
            throw 'numInputs required';
        } else if (this.get('numInputs') < 2) {
            throw 'Cannot create AND gate with fewer than two inputs';
        }

        var outputPort = new AndOutputPort(
            {element: this, ind: this.get('numInputs'),
             requiredInputs: this.get('numInputs')});
        var inputPorts = _.times(this.get('numInputs'), function(ind) {
            var inputPort = new Port.InputPort(
                {element: this, ind: ind});
            inputPort.addEdge(outputPort);
            return inputPort;
        }.bind(this));
        this.set({ports: inputPorts.concat(outputPort),
                  view: AndView});
    }
});

module.exports = AndElement;
