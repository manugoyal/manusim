/* The element object and react component for an output pin */
var React = require('react');
var Backbone = require('backbone');

var BoxedDataMixin = require('./boxedDataMixin');
var TickOrDragMixin = require('./tickOrDragMixin');

var Port = require('../data/port');

var ConstantView = React.createClass({
    statics: {
        getPositions: function(element) {
            var valueChars = element.get('ports')[0].get('value').length;
            return this.boxedDataPositions(element, valueChars, true);
        }
    },

    mixins: [BoxedDataMixin, TickOrDragMixin],

});

var ConstantElement = Backbone.Model.extend({
    initialize: function() {
        if (!this.has('position')) {
            throw 'Initial position required';
        } else if (!this.has('portValue')) {
            throw 'Port value required';
        }

        /* The updateValue function of a constant should never be called. */
        var outputPort = new Port.OutputPort(
            {element: this, ind: 0, value: this.get('portValue'),
             updateValue: function() {
                 throw 'updateValue should never be called for constant';
             }});
        this.set({ports: [outputPort], view: ConstantView});
    }
});

module.exports = ConstantElement;
