// ToolDropdown is the navbar at the top of the page that contains all the menus
// to select circuit elements and tools. There should only be one ToolDropdown
// rendered in the page.

var React = require('react');
var DOM = React.DOM;

var _ = require('underscore');
var $ = require('jquery');

var Point = require('./util/point');

var AndGate = require('./components/andGate.jsx');
var OutputPin = require('./components/outputPin.jsx');
var Constant = require('./components/constant.jsx');

var ToolDropdown = React.createClass({
    makeDropdownCategory: function(name, elements) {
        return (
            <li className='dropdown'>
                <a id={name} href='#' className='dropdown-toggle' role='button'
                   data-toggle='dropdown' aria-haspopup='true'
                   aria-expanded='false'>
                    {name}
                    <span className='caret' />
                </a>
                <ul className='dropdown-menu' role='menu'
                    aria-labelledby={name}>
                    {elements}
                </ul>
            </li>
        );
    },

    makeDropdownListItem: function(name, onClick) {
        return (
            <li role='presentation' key={name}>
                <a role='menuitem' tabIndex='-1' href='#' onClick={onClick}>
                    {name}
                </a>
            </li>
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

            this.makeDropdownListItem('Constant', function() {
                var data = prompt("Enter the binary string of the constant: ");
                if (!_.isNull(data)) {
                    var items = _.map(data.split(''), function(bitStr) {
                        return parseInt(bitStr);
                    });
                    if (_.every(items, function(bit) {
                        return bit === 1 || bit === 0;
                    })) {
                        this.props.eventEmitter.emit(
                            'addElement', new Constant(startPoint, items));
                    }
                }
            }.bind(this)),

            this.makeDropdownListItem('Output Pin', function() {
                var dataBits = parseInt(prompt(
                    "Enter the number of data bits: "));
                if (!_.isNaN(dataBits)) {
                    this.props.eventEmitter.emit(
                        'addElement', new OutputPin(startPoint, dataBits));
                }
            }.bind(this)),
        ];

        return (
            <nav className='navbar navbar-default'>
                <div className='container-fluid'>
                    <div className='navbar-header'>
                        <a className='navbar-brand' href='#'> ManuSim </a>
                    </div>
                    <div className='collapse navbar-collapse'>
                        <ul className='nav navbar-nav'>
                            {this.makeDropdownCategory(
                                'Elements', elementsList)}
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
});

module.exports = ToolDropdown;
