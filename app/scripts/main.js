var React = require('react');
window.React = React; // DEBUG ONLY
var DOM = React.DOM;

var _ = require('underscore');
var $ = require('jquery');
var events = require('events');

var ToolDropdown = require('./toolDropdown.jsx');
var Container = require('./container.jsx');

$(document).ready(function() {
    // The ToolDropdown and container both share an eventEmitter to communicate
    // with each other
    var eventEmitter = new events.EventEmitter();
    React.render(
        React.createFactory(ToolDropdown)({eventEmitter: eventEmitter}),
        document.getElementById('toolDropdown'));
    React.render(
        React.createFactory(Container)({eventEmitter: eventEmitter}),
        document.getElementById('base'));
});
