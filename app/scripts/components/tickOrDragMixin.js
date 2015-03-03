// Many elements handle their mouseDown event by checking if a tick was clicked,
// in which case they register a click, or if another part of the element was
// clicked, in which case they start a drag. We provide a mixin with this
// functionality.

var _ = require('underscore');
var $ = require('jquery');

var Tick = require('./tick.jsx');

var Point = require('../util/point');

module.exports = {
    handleMouseDown: function(event) {
        var positions = this.props.element.get('view').getPositions(
            this.props.element);
        // Checks if we clicked on a port
        var svgOffset = $(this.props.containerRefs.svg.getDOMNode()).offset();
        var relativeClickPos = new Point(event.pageX, event.pageY)
                .relativeTo(new Point(svgOffset.left, svgOffset.top));
        var clickedPort = _.find(
            this.props.element.get('ports'), function(port) {
                return positions.tickCoords[port.get('ind')].withinRadius(
                    relativeClickPos, Tick.clickRadius);
            });
        if (!_.isUndefined(clickedPort)) {
            // We clicked on a tick, so tell the container
            this.props.registerClick(clickedPort);
        } else {
            // Otherwise, we're clicking the gate itself, so we're dragging
            this.props.startDrag(this.props.element, relativeClickPos);
        }
    }
};
