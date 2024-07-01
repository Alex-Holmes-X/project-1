<?php

    ini_set('display_errors', 'on');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    // Url for location data
    // $url = 'https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['latitude'] . '%2C+' . $_REQUEST['longitude'] . '&key=4acb3442515c43a8bc51e9c18f27df90&pretty=1';

    $url = 'http://api.geonames.org/countryCodeJSON?formatted=true&lat=' . $_REQUEST['latitude'] . '&lng=' . $_REQUEST['longitude'] .'&username=ajay81&style=full';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

    $result = curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result, true);

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode;
    $output['url'] = $url;

    header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>