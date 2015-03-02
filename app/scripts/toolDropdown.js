// ToolDropdown is the navbar at the top of the page that contains all the menus
// to select circuit elements and tools. There should only be one ToolDropdown
// rendered in the page.

var React = require('react');
var DOM = React.DOM;

var _ = require('underscore');
var $ = require('jquery');

var Point = require('./util/point');

var AndGate = require('./components/andGate');
var OutputPin = require('./components/outputPin');
var Constant = require('./components/constant');

var ToolDropdown = React.createClass({
    makeDropdownCategory: function(name, elements) {
        return DOM.li(
            {className: 'dropdown'},
            DOM.a(
                {id: name, href: '#', className: 'dropdown-toggle',
                 role: 'button', 'data-toggle': 'dropdown',
                 'aria-haspopup': 'true', 'aria-expanded': 'false'},
                name, DOM.span({className: 'caret'})
            ),
            DOM.ul(
                {className: 'dropdown-menu', role: 'menu',
                 'aria-labelledby': name},
                elements
            )
        );
    },

    makeDropdownListItem: function(name, onClick) {
        return DOM.li(
            {role: 'presentation', key: name},
            DOM.a(
                {role: 'menuitem', tabIndex: '-1', href: '#', onClick: onClick},
                name
            )
        );
    },

    render: function() {
        var startPoint = new Point($(document).width()/2,
                                   $(document).height()/2);

        var elementsList = [
            this.makeDropdownListItem('And', function() {
                var numInputs = parseInt(prompt(
                    "Enter the number of inputs: "));
                if (!_.isNaN(numInputs)) {
                    this.props.eventEmitter.emit(
                        'addElement', new AndGate(startPoint, numInputs));
                }
            }.bind(this)),

            // this.makeDropdownListItem('Constant', function() {
            //     var data = prompt("Enter the binary string of the constant: ");
            //     if (!_.isNull(data)) {
            //         var items = _.map(data.split(''), function(bitStr) {
            //             return parseInt(bitStr);
            //         });
            //         if (_.every(items, function(bit) {
            //             return bit === 1 || bit === 0;
            //         })) {
            //             this.props.eventEmitter.emit(
            //                 'addElement', new Constant(startPoint, items));
            //         }
            //     }
            // }.bind(this)),

            // this.makeDropdownListItem('Output Pin', function() {
            //     var dataBits = parseInt(prompt(
            //         "Enter the number of data bits: "));
            //     if (!_.isNaN(dataBits)) {
            //         this.props.eventEmitter.emit(
            //             'addElement', new AndGate(startPoint, dataBits));
            //     }
            // }.bind(this)),
        ];

        return DOM.nav(
            {className: 'navbar navbar-default'},
            DOM.div(
                {className: 'container-fluid'},
                DOM.div(
                    {className: 'navbar-header'},
                    DOM.a({className: 'navbar-brand', href: '#'},
                          'ManuSim')
                ),

                DOM.div(
                    {className: 'collapse navbar-collapse'},
                    DOM.ul(
                        {className: 'nav navbar-nav'},
                        this.makeDropdownCategory(
                            'Elements', elementsList)
                    )
                )
            )
        );
    }
});

module.exports = React.createFactory(ToolDropdown);
