// Container defines the svg on the page that all the circuit elements will fit
// onto. It maintains a global state of all the elements, and deterministically
// re-renders everything on change.
var React = require('react');

var _ = require('underscore');

var Point = require('./util/point');

var Port = require('./data/port');

var Wire = require('./components/wire.jsx');

var Container = React.createClass({
    getInitialState: function() {
        // The state is primarily a list of element objects. The entire view
        // should be able to be reconstructed from just this list. We also have
        // some auxilliary properties for other stuff, like dragging elements
        // around and connecting ports and stuff.
        return {elements: [],
                // When dragInfo is not null, we're in dragging mode. It
                // contains the element being dragged, the initial position of
                // the element at mousedown, and the position of the click.
                dragInfo: null,
                // When connecting ports, we click one then the other. So when
                // the first one is clicked, we store the port of the source
                // here. If this is null, then we are not in the middle of a
                // click, otherwise we are. After the port connection is made,
                // this should be set to null.
                firstClickedPort: null
               };
    },

    // Subscribe to various events from the passed-in eventEmitter
    componentDidMount: function() {
        this.props.eventEmitter.on('addElement', function(element) {
            this.state.elements.push(element);
            this.forceUpdate();
        }.bind(this));
    },

    componentDidUnmount: function() {
        eventEmitter.removeAll('addElement');
    },

    // This will be called by children elements, when they get a mousedown, and
    // we will start dragging the element around.
    startDrag: function(element, clickPos) {
        this.setState({dragInfo: {
            elm: element, initPos: element.get('position'),
            clickPos: clickPos}});
    },

    // When we're in drag mode, we handle mousemove and move the element to the
    // position specified in event relative to its starting position
    onDrag: function(event) {
        var svgOffset = $(this.refs.svg.getDOMNode()).offset();
        var relativeDragPos = new Point(
            event.pageX, event.pageY).relativeTo(
                new Point(svgOffset.left, svgOffset.top));
        var initPosOffset = relativeDragPos.relativeTo(
            this.state.dragInfo.clickPos);
        this.state.dragInfo.elm.set({position: new Point(
            this.state.dragInfo.initPos.x + initPosOffset.x,
            this.state.dragInfo.initPos.y + initPosOffset.y)});
        this.forceUpdate();
    },

    // When we get a mouseup in drag mode, we end any dragging that's currently
    // happening
    endDrag: function() {
        this.setState({dragInfo: null});
    },

    /* This will be called by children elements when one of their ports is
       clicked. If it's the first click, we set firstClickedPort. If it's the
       second click, we connect the proper ports, making sure the edge goes from
       an output port to an input, reset firstClickedPort, and re-render. */
    registerClick: function(port) {
        if (_.isNull(this.state.firstClickedPort)) {
            port.toggleClicked();
            this.setState({firstClickedPort: port});
        } else {
            var firstPort = this.state.firstClickedPort;
            firstPort.toggleClicked();
            try {
                if (firstPort instanceof Port.OutputPort) {
                    firstPort.addEdge(port);
                } else {
                    port.addEdge(firstPort);
                }
            } catch (err) {
                alert(err);
            }
            this.setState({firstClickedPort: null});
        }
    },

    render: function() {
        /* Render each of the children. As properties, we pass a number of
        functions and data that child handler code can use to access container
        data. */
        children = _.map(this.state.elements, function(elm, ind) {
            var View = elm.get('view');
            return (
                <View element={elm} key={ind} startDrag={this.startDrag}
                registerClick={this.registerClick}
                containerRefs={this.refs} />
            );
        }.bind(this));
        /* We also need to draw wires between connected ports. We only draw
           edges going from output ports to input ports, because users can only
           create edges from output to input ports, and those are the only
           visible edges. */
        lines = [];
        _.each(this.state.elements, function(element) {
            _.each(element.get('ports'), function(port) {
                if (port instanceof Port.OutputPort) {
                    _.each(port.get('edges'), function(toPort) {
                        lines.push(<Wire port1={port} port2={toPort}
                                         key={lines.length} />);
                    });
                }
            });
        });

        /* If we're in drag mode, pass the onDrag and endDrag handlers to the
        div */
        var mousemove = null,
            mouseup = null;
        if (!_.isNull(this.state.dragInfo)) {
            mousemove = this.onDrag;
            mouseup = this.endDrag;
        }
        
        var width = $(document).width();
        var height = $(document).height();

        return (
            <svg height={height} width={width} id='container'
                 xmlns='http://www.w3.org/2000/svg' ref='svg'
                 onMouseMove={mousemove} onMouseUp={mouseup}>
                {children}
                {lines}
            </svg>
        );
    }
});

module.exports = Container;
