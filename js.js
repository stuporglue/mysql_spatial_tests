jQuery(document).ready(function(){
	jQuery('#json1').val('');
	jQuery('#json2').val('');
});

jQuery('#submitq').on('click', function(e){
	jQuery.post(
	document.location.href,
	{
		q: jQuery('#query').val(),
		json1: jQuery('#json1').val(),
		json2: jQuery('#json2').val()
	},
	function(success){
		jQuery('#queryres').val( success.res );
		jQuery('#queryrun').val( JSON.stringify( success.query ) );
	});
});

L.LayerGroup.include({flatten:function(){
	var finalResult = new L.LayerGroup();

	var queue = [this._layers];
	var i, layers, cur;
	while ( queue.length > 0 ) {
		layers = queue.shift();
		for ( i in layers ) {

			if ( typeof layers[i] !== 'object' ) {
				continue;
			}

			cur = layers[i];

			if ( cur instanceof L.LayerGroup ) {
				queue.push( cur._layers );
			} else {
				finalResult.addLayer( cur );
			}
		}
	}

	return finalResult;
}});

jQuery('.jsondiv').on('click', setActiveEditLayer);
jQuery('.jsondiv').on('change', updateShapes);

// Set up the map and layers
var map = L.map('map').setView([46.75, -92.1], 13);

L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


var json1 = new L.FeatureGroup();
json1.setStyle({
	color: '#1019bf',
	fillColor: '#1019bf'
});
json1.addTo(map);

var json2 = new L.FeatureGroup();
json2.setStyle({
	color: '#db1bc2',
	fillColor: '#db1bc2'
});
json2.addTo(map);

// var json1 = add_draw_group( 'json1', '#1019bf' );
// var json2 = add_draw_group( 'json2', '#db1bc2' );

var the_color = '#1019bf';
var active_div = 'json1';


// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
drawnItems.addTo(map);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
	edit: {
		featureGroup: drawnItems
	},
	draw: { 
		circle: false
	}
});

map.addControl(drawControl);

map.on('draw:created', function (e) {
	console.log("Fired!");

	var type = e.layerType,
	layer = e.layer;

	if (type === 'marker') {
		// Do marker specific actions
	}

	// Do whatever else you need to. (save to db, add to map etc)
	drawnItems.addLayer(layer);
	setTimeout(function(){
		updateActiveDiv();
	}, 500);
});

map.on('draw:edited', function (e) {
	updateActiveDiv();
});

map.on('draw:deleted', function(e) {
	updateActiveDiv();
});

function updateActiveDiv() {
	var drawnGeoJSON = drawnItems.flatten().toGeoJSON();
	var jsonstring = JSON.stringify(drawnGeoJSON);
	var activeDiv = jQuery('.jsondiv.active');
	activeDiv.val(jsonstring);
	activeDiv.trigger('change');
}

function setActiveEditLayer(e) {
	jQuery('.active').removeClass('active');
	var target = jQuery(e.target);
	target.addClass('active');

	var layerName = target.attr('id');

	if ( layerName == 'json1' ) {
		var newLayer = json1;
		var oldLayer = json2;
		var newColor = 'rgba( 40, 27, 194, 1.0 )';
	} else if ( layerName == 'json2' ) {
		var newLayer = json2;
		var oldLayer = json1;
		var newColor = 'rgba( 250, 171, 8, 1.0 )';
	}

	map.removeLayer(newLayer);
	oldLayer.setStyle({
		color: newColor,
		fillColor: newColor,
		fillOpacity: 0.7,
		opacity: 0.7
	});
	drawnItems.clearLayers();
	drawnItems.addLayer(newLayer);
	map.addLayer(oldLayer);
}

function updateShapes(e){
	var layerName = e.target.id;
	window[ layerName ].clearLayers();
	var geojson = JSON.parse( e.target.value );
	var gj = new L.GeoJSON( geojson );

	if ( layerName == 'json1' ) {
		var newColor = 'rgba( 250, 171, 8, 1.0 )';
	} else {
		var newColor = 'rgba( 40, 27, 194, 1.0 )';
	}
	gj.setStyle({
		color: newColor,
		fillColor: newColor,
		fillOpacity: 0.7,
		opacity: 0.7
	});
	// window[ layerName ].addLayer( gj );
}
