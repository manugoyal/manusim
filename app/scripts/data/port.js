// A Port is a vertex in the directed graph of circuit elements. Every port has
// a value of its own, and can have edges to other ports, whose values it can
// influence.

// There are two different port types, input and output. Input ports directly
// copy their value from exactly one output port. Output ports maintain a value
// as a function of zero or more input ports. This means ports form a bipartite
// graph dividing the inputs and outputs, so every edge must go between an input
// and an output.

// Ports listen for updates from their incoming connections in order to update
// their values on the fly. When an input port or output port changes its value,
// it will inform all of the ports it has edges to of this change, leaving them
// to update on their own. Note that if left unchecked, this could cause an
// infinite sequence of updates.

// To formalize this, we impose the requirement that there can be no cycles in
// the port graph. Note that this makes implementing stateful objects like
// registers a bit non-intuitive, since one can have cycles in a circuit with
// registers. But we leave the burden of satisfying this requirement to the
// stateful components themselves (this could possibly by solved by having input
// and output nodes synchronize with some clock-based value-store that isn't
// connected to ports by edges).

var Backbone = require('backbone');
var _ = require('underscore');

// This is the port base class, which implements common functionality between
// input and output ports. It is not exported.
var Port = Backbone.Model.extend({
    initialize: function() {
        // A port must be given the element it is tied to (AND gate, register,
        // etc), and an index to uniquely identify it in a list of ports
        if (!this.has('element')) {
            throw 'Port constructor must be passed the element it refers to';
        } else if (!this.has('ind')) {
            throw 'Port constructor must be passed the port index';
        }
        // Every port starts out with an empty list of edges
        this.set({edges: []});
    },

    // When a port wants to propagate a value change to a port, it will call its
    // updateValue method and pass itself. If the value actually changes, the
    // port being updated will propagate its change to all the ports it is
    // connected to.
    updateValue: function(fromPort) {
        throw 'not implemented';
    },

    // Input and output ports must both keep track of who is connected to them,
    // but for different reasons. Thus when a port removes an edge to another
    // port, it calls the disengageFrom method of the second port
    disengageFrom: function(fromPort) {
        throw 'not implemented';
    },

    // When we add an edge from this port to another, we should always check if
    // we're creating a cycle. We only need to check with the edge just added,
    // since by induction the graph was acyclic before adding the edge.
    checkForCycle: function(newPort) {
        // We run DFS, which is pretty slow but since we're probably not dealing
        // with too many nodes here, it's probably okay. If there's already a
        // path from the new port to this port, then adding an edge will create
        // a cycle.
        var visited = {};
        visited[this.cid] = true;
        var hasCycle = false;
        var dfsFunc = function(port) {
            visited[port.cid] = true;
            _.each(port.get('edges'), function(nextPort) {
                if (_.has(visited, nextPort.cid)) {
                    hasCycle = true;
                } else {
                    dfsFunc(nextPort);
                }
            });
        };
        dfsFunc(newPort);
        return hasCycle;
    },

    // When we want to add an edge to this port, we must make sure that the edge
    // has a different type than this one and that it doesn't cause a cycle.
    // Then we send our value to it if ours is not null.
    addEdge: function(toPort) {
        if (this.constructor === toPort.constructor) {
            throw 'Cannot create edge between two ports of the same type';
        }
        if (this.checkForCycle(toPort)) {
            throw 'Edge to port creates cycle';
        }
        if (_.indexOf(this.get('edges'), toPort) !== -1) {
            throw 'There is already an edge to the port';
        }
        this.set({edges: this.get('edges').concat(toPort)});
        if (this.has('value')) {
            toPort.updateValue(this);
        }
    },

    // When we want to remove an edge from this port to another, we remove it
    // from our edge list, and call the other port's disengageFrom method to let
    // it know we aren't pointing to it.
    removeEdge: function(toPort) {
        var withoutPort = _.without(this.get('edges'));
        if (withoutPort.length === this.get('edges').length) {
            throw 'There was no edge to the port';
        }
        this.set({edges: withoutPort});
        toPort.disengageFrom(this);
    }
});

var InputPort = Port.extend({
    defaults: {
        // For certain circuit elements (like a mux), different input ports have
        // different purposes (like input bit vs selector bit). This is useful
        // for the output port to tell what to use the port for.
        'type': 'none'
    },

    initialize: function(attributes) {
        // In addition to the super's initializer, we store the clientId of the
        // single output port that points to this input port, if there is one.
        // Recall that there can only be one port pointing to an input port at
        // any time.
        Port.prototype.initialize.apply(this, attributes);
        this.set({fromId: null});
    },

    updateValue: function(fromPort) {
        if (this.has('value') && this.get('fromId') !== fromPort.cid) {
            throw 'Cannot update value from different port without first ' +
                'disengaging the existing one';
        }
        if (!fromPort.has('value')) {
            throw 'fromPort cannot call updateValue without a valid value';
        }
        if (fromPort.get('value') !== this.get('value')) {
            this.set({fromId: fromPort.cid, value: fromPort.get('value')});
            _.each(this.get('edges'), function(port) {
                port.updateValue(this);
            }.bind(this));
        }
    },

    disengageFrom: function(fromPort) {
        if (!this.has('value')) {
            throw 'There is no port to disengage from';
        } else if (this.get('fromId') !== fromPort.fromId) {
            throw 'Disengaging port\'s id does not match stored id';
        }
        this.set({fromId: null, value: null});
    }
});

var OutputPort = Port.extend({
    defaults: {
        // Often times the evaluation function of output ports will encounter an
        // error with the inputs (like data bit length mismatch). We want to
        // display these errors to the user, so the port stores any errors it
        // has during evaluation here. evaulate must also clear this attribute
        // when there is no error.
        error: null
    },

    initialize: function(attributes) {
        // In addition to the super's initializer, we store a list of input
        // ports who point to this port.
        Port.prototype.initialize.apply(this, attributes);
        this.set({fromPorts: []});
    },

    // For every output port, its value is computed as a function of its input
    // values (and maybe some other stuff). This evaluation function should be
    // overriden for each different type of output port.
    evaluate: function(inputPorts) {
        throw 'not implemented';
    },

    updateValue: function(fromPort) {
        if (_.indexOf(this.get('fromPorts'), fromPort) === -1) {
            this.set({fromPorts: this.get('fromPorts').concat(fromPort)});
        }
        if (!fromPort.has('value')) {
            throw 'fromPort cannot call updateValue without a valid value';
        }
        var evaluated = this.evaluate(this.get('fromPorts'));
        if (evaluated !== this.get('value')) {
            this.set({value: evaluated});
            _.each(this.get('edges'), function(port) {
                port.updateValue(this);
            }.bind(this));
        }
    },

    disengageFrom: function(fromPort) {
        if (_.indexOf(this.get('fromPorts'), fromPort) === -1) {
            throw 'The given port is not connected to this output';
        }
        this.set({fromPorts: _.without(this.get('fromPorts'), fromPort)});
        this.set({value: this.evaluate(this.get('fromPorts'))});
    }
});

module.exports.InputPort = InputPort;
module.exports.OutputPort = OutputPort;
