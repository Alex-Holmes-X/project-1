<?php

  ini_set('display_errors', 'on');
  error_reporting(E_ALL);

  header('Content-Type: application/json; charset=UTF-8');

  $executionStartTime = microtime(true);

  $url = 'https://v6.exchangerate-api.com/v6/02a67979426e6aac5e5347df/latest/USD';

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_URL, $url);

  $result = curl_exec($ch);

  $cURLERROR = curl_errno($ch);

  curl_close($ch);

  if ($cURLERROR) {

    $output['status']['code'] = $cURLERROR;
    $output['status']['name'] = "Failure - cURL";
    $output['status']['description'] = curl_strerror($cURLERROR);
    $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
    $output['data'] = null;

    echo json_encode($output);

    exit;
  }

  $rates = json_decode($result, true);

  $url = 'https://v6.exchangerate-api.com/v6/02a67979426e6aac5e5347df/codes';

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_URL, $url);

  $result = curl_exec($ch);

  $cURLERROR = curl_errno($ch);

  curl_close($ch);

  if ($cURLERROR) {

    $output['status']['code'] = $cURLERROR;
    $output['status']['name'] = "Failure - cURL";
    $output['status']['description'] = curl_strerror($cURLERROR);
    $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
    $output['data'] = null;

    echo json_encode($output);

    exit;
  }

  $codes = json_decode($result, true);

  $x = 0;

  foreach ($codes['supported_codes'] as $code) {

    foreach ($rates['conversion_rates'] as $key => $value) {

      if ($key == $code[0]) {

        array_push($codes['supported_codes'][$x], $value);

      }

    }

    $x++;

  }

  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  $output['status']['description'] = "success";
  $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
  $output['data'] = $codes["supported_codes"];

  echo json_encode($output);