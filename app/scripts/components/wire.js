// A wire is a line between two ports
var React = require('react')
, DOM = React.DOM
, _ = require('underscore')

, Point = require('../util/point')
, port = require('../util/port');
;


var Wire = React.createClass({
    render: function() {
        var elm1 = this.props.port1.element;
        var elm2 = this.props.port2.element;

        var port1RelPos = elm1.renderingComponent.getPositions(elm1)
                .tickCoords[this.props.port1.type][this.props.port1.ind];
        var port2RelPos = elm2.renderingComponent.getPositions(elm2)
                .tickCoords[this.props.port2.type][this.props.port2.ind];

        var port1AbsPos = new Point(
            elm1.position.x + port1RelPos.x,
            elm1.position.y + port1RelPos.y);
        var port2AbsPos = new Point(
            elm2.position.x + port2RelPos.x,
            elm2.position.y + port2RelPos.y);

        var style = {
            position: 'fixed',
            left: Math.min(port1AbsPos.x, port2AbsPos.x),
            top: Math.min(port1AbsPos.y, port2AbsPos.y)
        };

        return DOM.svg(
            {height: Math.abs(port1AbsPos.y - port2AbsPos.y),
             width: Math.abs(port1AbsPos.x - port2AbsPos.x),
             style: style},
            DOM.line({
                x1: port1AbsPos.x - style.left, y1: port1AbsPos.y - style.top,
                x2: port2AbsPos.x - style.left, y2: port2AbsPos.y - style.top,
                stroke: 'green'
            })
        );
    }
});

module.exports = Wire;
