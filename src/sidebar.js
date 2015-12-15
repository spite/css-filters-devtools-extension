var re = /([a-z\-]*)[ ]*\(([^\)]+)\)[ ]*/gmi

var registeredFilters = {};
var styleFilters = [];

function registerFilter( id, filter ) {

	registeredFilters[ id ] = filter;

}

function interpretValue( value ) {

	value = value.toLowerCase();

	var re = /([-]*[\d\.]+)(px|%)*/gmi
	var m;

	re.lastIndex = 0;
	while( ( m = re.exec( value ) ) !== null) {
		if( m.index === re.lastIndex ) {
			re.lastIndex++;
		}
		var v = parseFloat( m[ 1 ] );
		if( m[ 2 ] === undefined ) return v * 100;
		if( m[ 2 ] === 'px' ) return v;
		if( m[ 2 ] === '%' ) return v
	}


}

// https://developer.mozilla.org/en/docs/Web/CSS/filter

function FilterParam( name ) {

	this.name = name;
	this.value;
	this.input;

}

function RangeFilterParam( name, min, max, step, unit ) {

	FilterParam.apply( this, arguments );
	this.min = min;
	this.max = max;
	this.step = step;
	this.units = unit;

	this.init();

}

RangeFilterParam.prototype = Object.create( FilterParam.prototype );

RangeFilterParam.prototype.init = function() {

	var line = document.createElement( 'div' );
	line.className = 'line';
	
	var handle = document.createElement( 'div' );
	handle.className = 'handle';

	var n = document.createElement( 'h4' );
	n.textContent = this.name;
	
	var label = document.createElement( 'input' );
	label.type = 'text';
	label.className = 'label';

	label.addEventListener( 'change', function( e ) {
		this.setValue( label.value );
		onValueUpdated();
	}.bind( this ) );
	label.addEventListener( 'keyup', function( e ) {
		this.setValue( label.value );
		onValueUpdated();
	}.bind( this ) );

	var units = document.createElement( 'span' );
	units.className = 'units';
	units.textContent = this.units;

	var i = document.createElement( 'input' );
	i.setAttribute( 'type', 'range' );
	i.setAttribute( 'min', this.min );
	i.setAttribute( 'max', this.max );
	i.setAttribute( 'step', this.step );
	
	i.value = this.value;

	i.addEventListener( 'change', function( e ) {
		this.setValue( i.value );
		onValueUpdated();
	}.bind( this ) );
	i.addEventListener( 'input', function( e ) {
		this.setValue( i.value );
		onValueUpdated();
	}.bind( this ) );

	line.appendChild( handle );
	line.appendChild( n );
	line.appendChild( i );
	line.appendChild( label );
	line.appendChild( units );

	this.line = line;
	this.input = i;
	this.label = label;

}

RangeFilterParam.prototype.getWidget = function() {

	return this.line;

}

RangeFilterParam.prototype.setValue = function( v ) {

	this.value = v;
	this.input.value = v;
	this.input.style.backgroundSize = ( this.value - this.min ) * 100 / ( this.max - this.min ) + '% 100%';
	this.label.value = this.value;

}

function Filter() {
	
	this.name = 'filter';
	this.params = {};
	this.paramsOrder = [];

}

Filter.prototype.getValue = function() {

}

Filter.prototype.addParam = function( param ) {

	this.params[ param.name ] = param;
	this.paramsOrder.push( param.name );

}

Filter.prototype.composeUI = function() {

	var panel = document.createElement( 'li' );
	panel.className = 'panel';

	var handle = document.createElement( 'div' );
	handle.className = 'handle';

	var h3 = document.createElement( 'h3' );
	h3.textContent = this.name;
	var values = document.createElement( 'div' );
	values.className = 'lines';

	var remove = document.createElement( 'a' );
	remove.className = 'remove';
	remove.setAttribute( 'href', '#' );
	remove.textContent = 'remove';
	remove.addEventListener( 'click', function( e ) {
		styleFilters.forEach( function( f, n ) {
			if( f === this ) {
				styleFilters.splice( n, 1 );
				panel.parentElement.removeChild( panel );
				onValueUpdated();
			}
		}.bind( this ) )
	}.bind( this ) );

	this.paramsOrder.forEach( function( pname ) {
		var param = this.params[ pname ];
		values.appendChild( param.getWidget() );
	}.bind( this ) );

	panel.appendChild( handle );
	panel.appendChild( h3 );
	panel.appendChild( remove )
	panel.appendChild( values );

	return panel;

}

function Blur() {

	Filter.call( this );

	this.name = 'blur';
	this.addParam( new RangeFilterParam( 'radius', 0, 100, .5, 'px' ) )
	this.params.radius.setValue( 10 );

}

Blur.prototype = Object.create( Filter.prototype );

Blur.prototype.parseValue = function( value ) {

	this.params.radius.setValue( parseFloat( value ) );
	
}

Blur.prototype.getValue = function() {

	return 'blur(' + this.params.radius.value + 'px)';

}

function Grayscale() {

	Filter.call( this );

	this.name = 'grayscale';
	this.addParam( new RangeFilterParam( 'weight', 0, 100, .1, '%' ) )
	this.params.weight.setValue( 100 );

}

Grayscale.prototype = Object.create( Filter.prototype );

Grayscale.prototype.parseValue = function( value ) {

	this.params.weight.setValue( interpretValue( value ) );

}

Grayscale.prototype.getValue = function() {

	return 'grayscale(' + this.params.weight.value + '%)';
	
}

function Brightness() {

	Filter.call( this );

	this.name = 'brightness';
	this.addParam( new RangeFilterParam( 'weight', 0, 1000, .1, '%' ) )
	this.params.weight.setValue( 150 );

}

Brightness.prototype = Object.create( Filter.prototype );

Brightness.prototype.parseValue = function( value ) {

	this.params.weight.setValue( interpretValue( value ) );

}

Brightness.prototype.getValue = function() {

	return 'brightness(' + this.params.weight.value + '%)';
	
}

function Contrast() {

	Filter.call( this );

	this.name = 'contrast';
	this.addParam( new RangeFilterParam( 'weight', 0, 1000, .1, '%' ) )
	this.params.weight.setValue( 150 );

}

Contrast.prototype = Object.create( Filter.prototype );

Contrast.prototype.parseValue = function( value ) {

	this.params.weight.setValue( interpretValue( value ) );

}

Contrast.prototype.getValue = function() {

	return 'contrast(' + this.params.weight.value + '%)';
	
}

function Sepia() {

	Filter.call( this );

	this.name = 'sepia';
	this.addParam( new RangeFilterParam( 'weight', 0, 100, .1, '%' ) )
	this.params.weight.setValue( 100 );

}

Sepia.prototype = Object.create( Filter.prototype );

Sepia.prototype.parseValue = function( value ) {

	this.params.weight.setValue( interpretValue( value ) );

}

Sepia.prototype.getValue = function() {

	return 'sepia(' + this.params.weight.value + '%)';
	
}

function Saturation() {

	Filter.call( this );

	this.name = 'saturate';
	this.addParam( new RangeFilterParam( 'weight', 0, 1000, .1, '%' ) )
	this.params.weight.setValue( 200 );

}

Saturation.prototype = Object.create( Filter.prototype );

Saturation.prototype.parseValue = function( value ) {

	this.params.weight.setValue( interpretValue( value ) );

}

Saturation.prototype.getValue = function() {

	return 'saturate(' + this.params.weight.value + '%)';
	
}

function HueRotate() {

	Filter.call( this );

	this.name = 'hue-rotate';
	this.addParam( new RangeFilterParam( 'angle', 0, 360, .5, '°' ) )
	this.params.angle.setValue( 180 );

}

HueRotate.prototype = Object.create( Filter.prototype );

HueRotate.prototype.parseValue = function( value ) {

	this.params.angle.setValue( parseFloat( value ) );

}

HueRotate.prototype.getValue = function() {

	return 'hue-rotate(' + this.params.angle.value + 'deg)';
	
}

function Invert() {

	Filter.call( this );

	this.name = 'invert';
	this.addParam( new RangeFilterParam( 'weight', 0, 100, .1, '%' ) )
	this.params.weight.setValue( 100 );

}

Invert.prototype = Object.create( Filter.prototype );

Invert.prototype.parseValue = function( value ) {

	this.params.weight.setValue( interpretValue( value ) );

}

Invert.prototype.getValue = function() {

	return 'invert(' + this.params.weight.value + '%)';
	
}

function Opacity() {

	Filter.call( this );

	this.name = 'opacity';
	this.addParam( new RangeFilterParam( 'weight', 0, 100, .1, '%' ) )
	this.params.weight.setValue( 50 );

}

Opacity.prototype = Object.create( Filter.prototype );

Opacity.prototype.parseValue = function( value ) {

	this.params.weight.setValue( interpretValue( value ) );

}

Opacity.prototype.getValue = function() {

	return 'opacity(' + this.params.weight.value + '%)';
	
}

function DropShadow() {

	Filter.call( this );

	this.name = 'drop-shadow';
	this.addParam( new RangeFilterParam( 'left', -100, 100, .5, 'px' ) )
	this.addParam( new RangeFilterParam( 'top', -100, 100, .5, 'px' ) )
	this.addParam( new RangeFilterParam( 'radius', 0, 100, .5, 'px' ) )

	this.params.left.setValue( 5 );
	this.params.top.setValue( 5 );
	this.params.radius.setValue( 10 );

}

DropShadow.prototype = Object.create( Filter.prototype );

DropShadow.prototype.parseValue = function( value ) {

	this.params.radius.setValue( parseFloat( value ) );
	
}

DropShadow.prototype.getValue = function() {

	return 'drop-shadow(' + this.params.left.value + 'px ' + this.params.top.value + 'px ' + this.params.radius.value + 'px blue)';

}

registerFilter( 'blur', Blur );
registerFilter( 'grayscale', Grayscale );
registerFilter( 'brightness', Brightness );
registerFilter( 'contrast', Contrast );
registerFilter( 'sepia', Sepia );
registerFilter( 'saturate', Saturation );
registerFilter( 'hue-rotate', HueRotate );
registerFilter( 'invert', Invert );
registerFilter( 'opacity', Opacity );
registerFilter( 'drop-shadow', DropShadow );

var toolbar = null;
var sort = null;

function onValueUpdated() {

	var values = [];
	styleFilters.forEach( function ( f ) {

		values.push( f.getValue() );

	} );

	if( values.length === 0 ) values.push( 'none' );

	chrome.devtools.inspectedWindow.eval( '$0.style.webkitFilter="' + values.join( ' ' ) + '"' );

}

window.addEventListener( 'load', update );

chrome.devtools.panels.elements.onSelectionChanged.addListener(function(){

	update();
	
} );

function update() {

	if( toolbar === null ) {

		toolbar = document.getElementById( 'toolbar' );

		for( var j in registeredFilters ) {

			var f = registeredFilters[ j ];

			var li = document.createElement( 'li' );

			var b = document.createElement( 'a' );
			b.textContent = f.name;
			b.setAttribute( 'href', '#' );
			li.appendChild( b );
			toolbar.appendChild( li );

			b.addEventListener( 'click', function( e ) {
				var filter = new registeredFilters[ this ]();
				var ui = filter.composeUI();
				filtersPanel.appendChild( ui );
				styleFilters.push( filter );
				onValueUpdated();
			}.bind( j ) )
		}

	}

	var filtersPanel = document.getElementById( 'filters-panel' );

	chrome.devtools.inspectedWindow.eval( 'window.getComputedStyle( $0 ).getPropertyValue( "-webkit-filter" )', 
		
		function( result, isException ) {

			var filters = processDeclaration( result );

			if( sort ) sort.destroy();

			filtersPanel.innerHTML = '';
			styleFilters = [];

			var str = '';
			filters.forEach( function( f ) {
				if( registeredFilters[ f.name ] ){
					var filter = new registeredFilters[ f.name ]();
					filter.parseValue( f.value );
					var ui = filter.composeUI();
					filtersPanel.appendChild( ui );
					styleFilters.push( filter );
				}
			} );

			sort = Sortable.create( filtersPanel, { animation: 150, handle: '.handle' } ); 

		}

	);

}

function processDeclaration( str ) {

	var res = [];
	var m;

	re.lastIndex = 0;
	while( ( m = re.exec( str ) ) !== null) {
		if( m.index === re.lastIndex ) {
			re.lastIndex++;
		}
		res.push( { 'name': m[ 1 ], 'value': m[ 2 ] } );
	}

	return res;

}

function getFilters() {

	return getComputedStyle( $0 ).getPropertyValue( '-webkit-filter' );

}

chrome.extension.onMessage.addListener(function (msg, _, sendResponse) {
	alert(msg, _, sendResponse);
});
