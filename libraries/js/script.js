
//---------------------------------------------------------
// Leaflet Map 
//---------------------------------------------------------

var map = L.map('map').fitWorld();

map.locate({
  setView: true, 
  maxZoom: 6,
});

//---------------------------------------------------------
// View layers
//---------------------------------------------------------

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }
).addTo(map);

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
);

var basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

layerControl = L.control.layers(basemaps).addTo(map);

//---------------------------------------------------------
// buttons
//---------------------------------------------------------

var countryInfo = L.easyButton('fa fa-users', function(btn, map) {
    $('#countryInfoModal').modal('show');
});
countryInfo.addTo(map);

var newsInfo = L.easyButton('fa fa-newspaper-o', function(btn, map) {
  $('#newsModal').modal('show');
});
newsInfo.addTo(map);

var weatherInfo = L.easyButton('fa fa-cloud', function(btn, map) {
  $('#weatherModal').modal('show');
});
weatherInfo.addTo(map);

var currencyInfo = L.easyButton('fa fa-money', function(btn, map) {
  $('#currencyModal').modal('show');
});
currencyInfo.addTo(map);


// --------------------------------------------------
// Functions
// --------------------------------------------------

// Function for the currency Calculator

function calcResult() {   
  $('#toAmount').val(numeral($('#fromAmount').val() * $('#exchangeRate').val()).format("0,0.00"));  
}
$('#fromAmount').on('keyup', function () {
  calcResult();
})
$('#fromAmount').on('change', function () {
  calcResult();
})
$('#exchangeRate').on('change', function () {
  calcResult();
})
$('#exampleModal').on('show.bs.modal', function () {
  calcResult();
})
$('#exampleModal').on('hidden.bs.modal', function () {
 $('#fromAmount').val(1);
});



$(document).ready(function() { 

    // This is used to find the current position
    navigator.geolocation.getCurrentPosition(showNewPosition);
    function showNewPosition(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        console.log(latitude);
        console.log(longitude);
      


    // This call is to create the drop down box options
    $.ajax({
      url: "./libraries/php/dropdownMenuCountries.php",
      type: 'POST',
      dataType: 'json',
      
      success: function(result) {

          // console.log(JSON.stringify(result));

          if (result.status.name == 'ok') {
                              
              for(const country of result.data) {

                  $('#countrySelect').append(`<option value="${country.iso_a2}">${country.name}</option>`);
              }
          
            }

      },
      error: function(jqXHR, textStatus, errorThrown) {
          
          console.log(jqXHR);
      }
    }) 

    $.ajax({
      url: "./libraries/php/currentLocationInfo.php",
      type: 'POST',
      dataType: 'json',
      data: {
          latitude: latitude,
          longitude: longitude
          
          
      },
      success: function(result) {
    
          // console.log(JSON.stringify(result));
    
          if (result.status.name == 'ok') {
            var currentIsoLocation = result.data.results[0].components['ISO_3166-1_alpha-2'];        
            
            // Test countryCode below 
            //  var currentIsoLocation = 'US'; 


            $.ajax({   
              url: "./libraries/php/geoJSONCountryBorders.php",
              type: 'POST',
              dataType: 'json',
              
              success: function(result) {
        
                  // console.log(JSON.stringify(result));
        
                  if (result.status.name == 'ok') {
                          
                      for (const location of result.data) {
                        

                        if(location.properties.iso_a2 === currentIsoLocation) {
                          var mapData = location.geometry;

                          L.geoJSON(mapData).addTo(map);
                        } 
                      }
                      
                                            
        
                  }         
        
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  
                  console.log(jqXHR);
              }
        
            })


            $.ajax({   
              url: "./libraries/php/countryInformation.php",
              type: 'POST',
              dataType: 'json',
              data: {
                countryCode: currentIsoLocation
              },
              
              success: function(result) {
        
                  // console.log(JSON.stringify(result));
        
                  if (result.status.name == 'ok') {
                    
              
                    var popluationTotal = numeral(result.data[0].population).format('0,0');
                    var areaSqKm = numeral(result.data[0].areaInSqKm).format('0,0');


                    $('#capitalCity').html(result.data[0].capital);
                    $('#continent').html(result.data[0].continentName);
                    $('#languages').html(result.data[0].languages);
                    $('#currency').html(result.data[0].currencyCode);
                    $('#isoAlpha3').html(result.data[0].isoAlpha3);
                    $('#population').html(popluationTotal);
                    $('#areaInSqKm').html(areaSqKm);
                    $('#postalCodeFormat').html(result.data[0].postalCodeFormat);

                  }         
        
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  
                  console.log(jqXHR);
              }
        
            })

            $.ajax({   
              url: "./libraries/php/weatherInformation.php",
              type: 'POST',
              dataType: 'json',
              data: {
                latitude: latitude,
                longitude: longitude
              },
              
              success: function(result) {
        
                  // console.log(JSON.stringify(result));
        
                  if (result.status.name == 'ok') {                   
                    
                    // Todays Forcast
                    $('#todayConditions').html(result.data.forecast.forecastday[0].day.condition.text);
                    $('#todayIcon').attr("src", result.data.forecast.forecastday[0].day.condition.icon);
                    $('#todayMaxTemp').html(result.data.forecast.forecastday[0].day.maxtemp_c);
                    $('#todayMinTemp').html(result.data.forecast.forecastday[0].day.mintemp_c);                     
                    
                    // Tomorrows Forecast
                    // TODO Change this to the date not the forecast

                    $('#day1Date').html(Date.parse("tomorrow").toString("MMMM dS"));
                    $('#day1Icon').attr("src", result.data.forecast.forecastday[1].day.condition.icon);
                    $('#day1MaxTemp').html(result.data.forecast.forecastday[1].day.maxtemp_c);
                    $('#day1MinTemp').html(result.data.forecast.forecastday[1].day.mintemp_c);

                    // +2 Day Forecast
                    // TODO Change this to the date not the forecast
                    $('#day2Date').html(Date.parse("t + 2d").toString("MMMM dS"));
                    $('#day2Icon').attr("src", result.data.forecast.forecastday[2].day.condition.icon);
                    $('#day2MaxTemp').html(result.data.forecast.forecastday[2].day.maxtemp_c);
                    $('#day2MinTemp').html(result.data.forecast.forecastday[2].day.mintemp_c);

                    // Last Updated
                    $('#lastUpdated').html(result.data.current.last_updated);
                    
                    
                  }         
        
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  
                  console.log(jqXHR);
              }
        
            })

            $.ajax({   
              url: "./libraries/php/latestNewsInfo.php",
              type: 'POST',
              dataType: 'json',
              data: {
                country: currentIsoLocation
              },
              
              success: function(result) {
        
                  // console.log(JSON.stringify(result));
        
                  if (result.status.name == 'ok') {  
                    
                    // Top Story 1
                    var topStory1Icon = (result.data[0].image_url)
                    $('#topStory1Image').attr('src', topStory1Icon);
                    $('#topStoryTitle1').html(result['data'][0]['title'])
                    var topStory1Url = (result.data[0].link)
                    $('#topStoryTitle1').attr('href', topStory1Url);
                    $('#topStory1Source').html(result['data'][0]['source_id']);

                    // Top Story 2
                    var topStory2Icon = (result.data[1].image_url)
                    $('#topStory2Image').attr('src', topStory2Icon);
                    $('#topStoryTitle2').html(result['data'][1]['title'])
                    var topStory2Url = (result.data[1].link)
                    $('#topStoryTitle2').attr('href', topStory2Url);
                    $('#topStory2Source').html(result['data'][1]['source_id']); 

                    // Top Story 3
                    var topStory3Icon = (result.data[2].image_url)
                    $('#topStory3Image').attr('src', topStory3Icon);
                    $('#topStoryTitle3').html(result['data'][2]['title'])
                    var topStory3Url = (result.data[2].link)
                    $('#topStoryTitle3').attr('href', topStory3Url);
                    $('#topStory3Source').html(result['data'][2]['source_id']);

                    // Top Story 4
                    var topStory4Icon = (result.data[3].image_url)
                    $('#topStory4Image').attr('src', topStory4Icon);
                    $('#topStoryTitle4').html(result['data'][3]['title'])
                    var topStory4Url = (result.data[3].link)
                    $('#topStoryTitle4').attr('href', topStory4Url);
                    $('#topStory4Source').html(result['data'][3]['source_id']);

                    // Top Story 5
                    var topStory5Icon = (result.data[4].image_url)
                    $('#topStory5Image').attr('src', topStory5Icon);
                    $('#topStoryTitle5').html(result['data'][4]['title'])
                    var topStory5Url = (result.data[4].link)
                    $('#topStoryTitle5').attr('href', topStory5Url);
                    $('#topStory5Source').html(result['data'][4]['source_id']);

                    
                    
                  }         
        
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  
                  console.log(jqXHR);
              }
        
            })

            $.ajax({   
              url: "./libraries/php/currencyNames.php",
              type: 'POST',
              dataType: 'json',
              
              success: function(result) {
        
                  // console.log(JSON.stringify(result));
                  // BOOKMARK dropdown currency
                  if (result.status.name == 'ok') {

                    //CurrencyArray - Gets all the country currency codes
                    var currencyArray = [];                    
                    for (let i = 0; i < result.data.supported_codes.length; i++) {
                      currencyArray.push(result.data.supported_codes[i][0])
                    }
                    // console.log(currencyArray);


                    
                    // empty array for exchange rates
                    var exchangeRates = [];

                    // This call gets the current exchange rates

                    $.ajax({
                      url: "./libraries/php/currencyRates.php",
                      type: 'POST',
                      dataType: 'json',
                      
                      success: function(result) {
                
                          // console.log(JSON.stringify(result));
                
                          if (result.status.name == 'ok') {
                            
                            exchangeRates.push(result.data.conversion_rates);
                            console.log(exchangeRates);
                            }
                
                      },
                      error: function(jqXHR, textStatus, errorThrown) {
                          
                          console.log(jqXHR);
                      }
                    }) 



                    // This sets the drop down menu
                    
                    for(const currency of result.data.supported_codes) {

                        
                      $('#exchangeRate').append(`<option id="${currency[0]}" value="${exchangeRates[0]}">${currency[1]}</option>`);

                      
                  } 
                  console.log(exchangeRates[0].AFN);
                                                           
        
                  }         
        
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  
                  console.log(jqXHR);
              }
        
            })

            // Next one here

          }    
    
        }

      })
     

    

  } // This is the end of the function above for latitude and longitude

// This is the end of the document ready call
})

// Below is for anthing that changes on selection of a different country

$('#countrySelect').change(function() { 



})



