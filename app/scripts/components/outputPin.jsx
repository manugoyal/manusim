// The element object and react component for an output pin

var React = require('react');
var Backbone = require('backbone');

var BoxedDataMixin = require('./BoxedDataMixin.jsx');
var TickOrDragMixin = require('./tickOrDragMixin');

var Port = require('../data/port');

var OutputPinView = React.createClass({
    statics: {
        getPositions: function(element) {
            var port = element.get('ports')[0]
            if (port.has('value')) {
                return OutputPinView.boxedDataPositions(
                    element, port.get('value').length, false);
            } else {
                return OutputPinView.boxedDataPositions(
                    element, 'undefined'.length, false);
            }
        }
    },

    mixins: [BoxedDataMixin, TickOrDragMixin]
});

var OutputPinElement = Backbone.Model.extend({
    initialize: function() {
        if (!this.has('position')) {
            throw 'Initial position required';
        }

        this.set({ports: [new Port.InputPort({element: this, ind: 0})],
                  view: OutputPinView});
    }
});

module.exports = OutputPinElement;
