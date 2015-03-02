// A Port is either an input or output in a logic element. It has a settable
// evaluation function, which returns the value of the port, and can either be
// an input or output.

var _ = require('underscore')
;

var inputType = 'input',
    outputType = 'output';

function Port(element, ind, type, toPorts, fromPorts) {
    this.element = element;
    this.ind = ind;
    // type should be 'input' or 'output'
    this.type = type;
    // The value function returns undefined if it can't get a value. An input
    // port always gets is value from its one fromPort, so we can implement that
    // automatically. An output port will usually perform some function on its
    // input port values to get its value. Values are going to be an array of
    // 1's and 0's.
    if (this.type === inputType) {
        this.value = function() {
            if (this.fromPorts.length === 1) {
                return this.fromPorts[0].value();
            } else {
                return undefined;
            }
        };
    } else {
        this.value = function() {
            return undefined;
        };
    }
    // Ports can have to-ports to other ports, where their value functions are
    // used.
    this.toPorts = toPorts || [];
    // Ports can also have from-ports from other ports, which they can use in
    // the value function.
    this.fromPorts = fromPorts || [];

    // Ports can also have a number of validity checkers to check that they are
    // valid. We make the guarantee that if all the validity checkers pass, the
    // port's value function will return a valid array of 1's and 0's.. There
    // are a few validity checkers that apply to all ports.
    this.checkers = [];

    if (this.type == inputType) {
        // If this is an input port, check that it has exactly one from port,
        // and that it has no to-ports to other input ports.
        this.checkers.push(function() {
            return this.fromPorts.length === 1 &&
                _.every(this.toPorts, function(port) {
                    return port.type === outputType;
                });
        }.bind(this));
    }

    if (this.type == outputType) {
        // If this is an output port, check that it has no to-ports to other
        // input ports.
        this.checkers.push(function() {
            return _.every(this.toPorts, function(port) {
                return port.type === inputType;
            });
        }.bind(this));
    }

    // For all ports, their from-ports should be valid
    this.checkers.push(function() {
        return _.every(this.fromPorts, function(port) {
            return port.isValid();
        });
    }.bind(this));

    // The isValid method runs all the validity checkers
    this.isValid = function() {
        return _.every(this.checkers, function(checker) {
            return checker();
        });
    }.bind(this);
}

module.exports.input = inputType;
module.exports.output = outputType;
module.exports.Port = Port;
