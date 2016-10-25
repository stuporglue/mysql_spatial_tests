<?php
if ( !isset( $_POST['q'] ) ) {
	require_once('page.html');
	return;
}

require_once( dirname( __FILE__ ) . '/geoPHP/geoPHP.inc' );

$mysqli = new mysqli( 'localhost', 'root', 'root', 'pressmatic' );

$q = $_POST['q'];
$prepareArgs = array();

preg_match_all( '/\$([0-9]*)/', $q, $matches );

$geojson_reader = new GeoJSON();
$wkt_writer = new WKT();

if ( count( $matches ) > 0 ){
	foreach( $matches[1] as $match ) {
		$f = '$' . $match;
		$r = $_REQUEST[ 'json' . $match ];

		try {
			$geojson = $geojson_reader->read( $r );
			$wkt = $wkt_writer->write( $geojson );
		} catch ( Exception $e ) {
			error_log($e);
		} finally {
		}

		/*
		* MUTLI all the things because MySQL 5.7 (at least, maybe others) doesn't
		* like Geometry in GeometryCollection columns.
		*/
		if ( false === strpos( $wkt, 'MULTI' ) ) {
			if ( 0 === strpos( $wkt, 'POINT' ) ) {
				$wkt = preg_replace( '@^POINT@','MULTIPOINT', $wkt );
			} else if ( 0 === strpos( $wkt, 'LINE' ) || 0 === strpos( $wkt, 'POLYGON' ) ) {
				$wkt = preg_replace( '@^(LINE|POLYGON)(\s*)(\(.*?\))@','MULTI$1$2($3)', $wkt );
			}
		}
		$wkt = "GeometryCollectionFromText('$wkt')";

		$q = str_replace( $f , $wkt , $q );
	}
}

print $q;
