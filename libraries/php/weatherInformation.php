<?php

    ini_set('display_errors', 'on');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    $apiKey = '21abdaa6957043b3a6f155054242906';
    
    // Url for location data
    // $url = 'http://api.weatherapi.com/v1/future.json?key='.$apiKey.'&q=leeds&dt=2024-07-30';

    $url = 'http://api.weatherapi.com/v1/forecast.json?key=' .$apiKey .'&q=' . $_REQUEST['latitude'] . ',' . $_REQUEST['longitude'] . '&days=3&aqi=no&alerts=no';
    
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