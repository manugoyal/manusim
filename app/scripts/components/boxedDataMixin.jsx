// There are numerous elements that are just a box around data with exactly one
// input or output tick. They have very similar views, so we provide much of the
// view logic in this mixin.

var $ = require('jquery');

var Tick = require('./tick.jsx');

var Point = require('../util/point');

module.exports = {
    statics: {
        boxedDataPositions: function(element, valueChars, tickOnRight) {
            var pxPerChar = 10;
            var fontSize = parseInt($('body').css('font-size'));

            var groupHeight = 2*fontSize;
            var groupWidth = pxPerChar*valueChars + Tick.length;

            var elementPos = element.get('position');
            var rectTopLeft = new Point(elementPos.x + Tick.length/2,
                                        elementPos.y);
            var rectHeight = groupHeight;
            var rectWidth = groupWidth - Tick.length/2;

            var port = element.get('ports')[0];
            var tickCoords = new Array(port.get('ind')+1);
            tickCoords[tickCoords.length-1] = new Point(
                rectTopLeft.x + (tickOnRight ? rectWidth : 0),
                rectTopLeft.y + rectHeight/2);
            return {
                groupHeight: groupHeight, groupWidth: groupWidth,
                fontSize: fontSize, rectTopLeft: rectTopLeft,
                rectHeight: rectHeight, rectWidth: rectWidth,
                tickCoords: tickCoords
            };
        }
    },

    render: function() {
        var element = this.props.element;
        var positions = element.get('view').getPositions(element);
        var port = element.get('ports')[0];
        var textValue = element.get('ports')[0].has('value') ?
                        element.get('ports')[0].get('value').join('') :
                        'undefined';
        return (
            <g height={positions.groupHeight} width={positions.groupWidth}
               x={element.get('position').x} y={element.get('position').y}
               onMouseDown={this.handleMouseDown}>
                <rect x={positions.rectTopLeft.x} y={positions.rectTopLeft.y}
                      height={positions.rectHeight} width={positions.rectWidth}
                      fill='transparent' stroke='black' strokeWidth={2} />
                <text x={positions.rectTopLeft.x + Tick.length}
                      y={positions.rectTopLeft.y + positions.rectHeight -
                         positions.fontSize*2/3} fill='black'>
                    {textValue}
                </text>
                <Tick.Tick pos={positions.tickCoords[port.get('ind')]}
                           port={port} />
            </g>
        );
    }
};
