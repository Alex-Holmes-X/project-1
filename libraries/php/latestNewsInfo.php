<?php

    ini_set('display_errors', 'on');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    // $apiKey = 
    // Url for location data
    $url = 'https://newsdata.io/api/1/latest?&country=' . $_REQUEST['country'] .'&image=1&size=10&prioritydomain=top&category=top&apikey=pub_463289480a03577b2c41d52ee5121a857aab0'; 

    // $url = 'https://newsdata.io/api/1/latest?&country=gb&image=1&size=5&apikey=pub_463289480a03577b2c41d52ee5121a857aab0'; 


    // Build link in script page !!!!!!
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
    $output['data'] = $decode['results'];
    $output['url'] = $url;

    header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>