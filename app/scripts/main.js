var React = require('react')
, DOM = React.DOM
, _ = require('underscore')
, events = require('events')
, eventEmitter = new events.EventEmitter()

, Point = require('./util/point')
, AndGate = require('./components/and_gate')
, OutputPin = require('./components/output_pin')
, Constant = require('./components/constant')
, Wire = require('./components/wire')
;

// Our main component is a container, that contains all the elements. We
// maintain globally the state of all these elements.
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

    // Subscribe to various events
    componentDidMount: function() {
        eventEmitter.on('addElement', function(element) {
            this.state.elements.push(element);
            this.forceUpdate();
        }.bind(this));
    },

    componentDidUnmount: function() {
        eventEmitter.removeAll('addElement');
    },

    // This will be called by children elements, when they get a mousedown, and
    // we will start dragging the element around.
    startDrag: function(elementState, event) {
        this.setState({dragInfo: {
            elm: elementState, initPos: elementState.position,
            clickPos: new Point(event.pageX, event.pageY)}});
    },

    // When we're in drag mode, we handle mousemove and move the element to the
    // position specified in event relative to its starting position
    onDrag: function(event) {
        this.state.dragInfo.elm.position = new Point(
            this.state.dragInfo.initPos.x +
                (event.pageX - this.state.dragInfo.clickPos.x),
            this.state.dragInfo.initPos.y +
                (event.pageY - this.state.dragInfo.clickPos.y));
        this.forceUpdate();
    },

    // When we get a mouseup in drag mode, we end any dragging that's currently
    // happening
    endDrag: function() {
        this.setState({dragInfo: null});
    },

    // This will be called by children elements when one of their ports is
    // clicked. If it's the first click, we set firstClickedPort. If it's the
    // second click, we connect the proper ports, reset firstClickedPort, and
    // rerender.
    registerClick: function(port) {
        if (_.isNull(this.state.firstClickedPort)) {
            this.setState({firstClickedPort: port});
        } else {
            // Only makes the connection if it's between an output and input
            // port
            if (this.state.firstClickedPort.type === port.type) {
                alert("Cannot make connection between two ports of type " +
                      port.type);
                this.setState({firstClickedPort: null});
            } else {
                this.state.firstClickedPort.toPorts.push(port);
                port.fromPorts.push(this.state.firstClickedPort);
                this.setState({firstClickedPort: null});
            }
        }
    },

    render: function() {
        // Render each of the children
        children = _.map(this.state.elements, function(stateObj) {
            return stateObj.renderingComponent({
                stateObj: stateObj,
                startDrag: this.startDrag,
                registerClick: this.registerClick
            });
        }.bind(this));

        // We also need to draw lines between each pair of connected ports. For
        // each child, we look at each of its output ports, and draw a line from
        // the port to each of the ports it goes out to.
        lines = [];
        _.each(this.state.elements, function(stateObj) {
            _.each(stateObj.outputs, function(outputPort) {
                _.each(outputPort.toPorts, function(toPort) {
                    lines.push(Wire({port1: outputPort, port2: toPort}));
                });
            });
        });

        // If we're in drag mode, pass the onDrag and endDrag handlers to the
        // div
        var mousemove = null,
            mouseup = null;
        if (!_.isNull(this.state.dragInfo)) {
            mousemove = this.onDrag;
            mouseup = this.endDrag;
        }

        return DOM.div({
            onMouseMove: mousemove,
            onMouseUp: mouseup
        }, children, lines);
    }
});

var Dropdown = React.createClass({
    makeListElement: function(name, onClick) {
        return DOM.li(
            {role: 'presentation'},
            DOM.a(
                {role: 'menuitem', tabindex: '-1', href: '#',
                 onClick: onClick},
                name
            )
        );
    },

    render: function() {
        var startPoint = new Point(0, 50);
        return DOM.div(
            {className: 'dropdown'},
            DOM.button(
                {className: 'btn btn-default dropdown-toggle',
                 type: 'button', id: this.props.id,
                 'data-toggle': 'dropdown',
                 'aria-expanded': 'true'
                }, "Elements", DOM.span({className: 'caret'})
            ),
            DOM.ul(
                {className: 'dropdown-menu', role: 'menu',
                 'aria-labelledby': this.props.id},
                this.makeListElement('And', function() {
                    var numInputs = prompt("Enter the number of inputs: ");
                    if (!_.isNull(numInputs)) {
                        eventEmitter.emit(
                            'addElement',
                            new AndGate(startPoint, parseInt(numInputs)));
                    }
                }),
                this.makeListElement('Constant', function() {
                    var data = prompt(
                        "Enter the binary string of the constant: ");
                    if (!_.isNull(data)) {
                        value = [];
                        _.each(data, function(bit) {
                            if (_.isNull(value)) {
                                return;
                            } else if (bit === '0') {
                                value.push(0);
                            } else if (bit === '1') {
                                value.push(1);
                            } else {
                                value = null;
                            }
                        });
                        if (!_.isNull(value)) {
                            eventEmitter.emit(
                                'addElement',
                                new Constant(startPoint, value));
                        }
                    }
                }),
                this.makeListElement('Output Pin', function() {
                    var dataBits = prompt(
                        "Enter the max number of data bits: ");
                    if (!_.isNull(dataBits)) {
                        eventEmitter.emit(
                            'addElement',
                            new OutputPin(startPoint, parseInt(dataBits)));
                    }
                })
            )
        );
    }
});

React.render(Dropdown({id: 'innerDropdownMenu'}),
             document.getElementById('dropdownMenu'));
React.render(Container(), document.getElementById('base'));
