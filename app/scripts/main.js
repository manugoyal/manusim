var React = require('react');
var DOM = React.DOM;

var _ = require('underscore');
var $ = require('jquery');
var events = require('events');

var ToolDropdown = require('./toolDropdown');
var Container = require('./container');

$(document).ready(function() {
    // The ToolDropdown and container both share an eventEmitter to communicate
    // with each other
    var eventEmitter = new events.EventEmitter();
    React.render(ToolDropdown({eventEmitter: eventEmitter}),
                 document.getElementById('toolDropdown'));
    React.render(Container({eventEmitter: eventEmitter}),
                 document.getElementById('base'));
});
