// A wire is a line between two ports
var React = require('react');

var Wire = React.createClass({
    render: function() {
        var elm1 = this.props.port1.get('element');
        var elm2 = this.props.port2.get('element');

        var port1Pos = elm1.get('view').getPositions(elm1)
                           .tickCoords[this.props.port1.get('ind')]
        var port2Pos = elm2.get('view').getPositions(elm2)
                              .tickCoords[this.props.port2.get('ind')]
        return (
            <line x1={port1Pos.x} y1={port1Pos.y}
                  x2={port2Pos.x} y2={port2Pos.y} stroke='green'
                  style={{'pointerEvents': 'none'}} />
        );
    }
});

module.exports = Wire;
