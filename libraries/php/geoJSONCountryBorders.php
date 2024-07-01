<?php

    ini_set('display_errors', 'on');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $result = file_get_contents('countryBorders.geo.json');

 

    $decode = json_decode($result, true);

    $countryBorders = [];

    for($i = 0; $i < count($decode['features']); $i++) {
        array_push($countryBorders,$decode['features'][$i]);
        
    };
    


    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $countryBorders;
    // $output['url'] = $url;

    header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>