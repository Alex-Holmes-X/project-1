//---------------------------------------------------------
// Leaflet Map 
//---------------------------------------------------------

var map = L.map('map').fitWorld();


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

var holidayInfo = L.easyButton('fa fa-sun', function(btn, map) {
  $('#publicHolidayModal').modal('show');
  });
  holidayInfo.addTo(map);


//---------------------------------------------------------
// Layers and icons
//---------------------------------------------------------


var airports = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
});

var cities = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
});

var overlays = {
  'Airports': airports,
  'Cities': cities
};


var airportIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-plane",
  iconColor: "black",
  markerColor: "white",
  shape: "square"
});

var cityIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-city",
  markerColor: "green",
  shape: "square"
});

layerControl = L.control.layers(basemaps,overlays).addTo(map);


map.addLayer(airports);
map.addLayer(cities);






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

// Global Variables 
var currentIsoLocation = '';
var border = null;
var localCurrency = null;
var holidayNames = [];
var holidayDates = [];

$(document).ready(function() { 


 

    // This is used to find the current position
    navigator.geolocation.getCurrentPosition(showNewPosition);
    function showNewPosition(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;



    // This call is to create the drop down box options
    $.ajax({   // Call to create the dropdown menu
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
       
            currentIsoLocation = result.data.countryCode;
            $('#countrySelect').val(currentIsoLocation).change();
            


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
                    
                    var capitalCity = (result.data[0].capital);
                    localCurrency = (result.data[0].currencyCode);
                    var countryCode = (result.data[0].countryCode);
                    
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


                    $.ajax({   
                      url: "./libraries/php/weatherInformation.php",
                      type: 'POST',
                      dataType: 'json',
                      data: {
                        capital: capitalCity,
                      },
                      
                      success: function(result) {
                
                          // console.log(JSON.stringify(result));
                        
                          if (result.status.name == 'ok') { 
                            
                            $('#weatherLocation').html(capitalCity);
                            
                            
                            // Todays Forcast
                            $('#todayConditions').html(result.data.forecast.forecastday[0].day.condition.text);
                            $('#todayIcon').attr("src", result.data.forecast.forecastday[0].day.condition.icon);
                            $('#todayMaxTemp').html(numeral(result.data.forecast.forecastday[0].day.maxtemp_c).format('0'));
                            $('#todayMinTemp').html(numeral(result.data.forecast.forecastday[0].day.mintemp_c).format('0'));                     
                            
                            // Tomorrows Forecast                            
        
                            $('#day1Date').html(Date.parse("tomorrow").toString("dddd dS"));
                            $('#day1Icon').attr("src", result.data.forecast.forecastday[1].day.condition.icon);
                            $('#day1MaxTemp').html(numeral(result.data.forecast.forecastday[1].day.maxtemp_c).format('0'));
                            $('#day1MinTemp').html(numeral(result.data.forecast.forecastday[1].day.mintemp_c).format('0'));
        
                            // +2 Day Forecast
                          
                            $('#day2Date').html(Date.parse("t + 2d").toString("dddd dS"));
                            $('#day2Icon').attr("src", result.data.forecast.forecastday[2].day.condition.icon);
                            $('#day2MaxTemp').html(numeral(result.data.forecast.forecastday[2].day.maxtemp_c).format('0'));
                            $('#day2MinTemp').html(numeral(result.data.forecast.forecastday[2].day.mintemp_c).format('0'));
        
                            // Last Updated
                            var lastUpdated = Date.parse(result.data.current.last_updated).toString("ddd dS, @ HH:mm");
                            
                            $('#lastUpdated').html(lastUpdated);
                            
                            
                          }         
                
                      },
                      error: function(jqXHR, textStatus, errorThrown) {
                          
                          console.log(jqXHR);
                      }
                
                    })




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
              url: "./libraries/php/exchangeRateUpdate.php",
              type: 'POST',
              dataType: 'json',
              
              success: function(result) {
        
                  // console.log(JSON.stringify(result));

                  if (result.status.name == 'ok') {

                    calcResult();
                  
                    console.log($('#exchangeRate').val());
                    for(const currency of result.data ) {

                       
                      $('#exchangeRate').append(`<option id="${currency[0]}" value="${currency[2]}">${currency[1]}</option>`);

                      
                  } 
                                                                          
        
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


$('#countrySelect').on('change', function() {

  if (border) {
    border.clearLayers();
    airports.clearLayers();
    cities.clearLayers();
  }


  

  navigator.geolocation.getCurrentPosition(showNewPosition);
  function showNewPosition(position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      // console.log(latitude);
      // console.log(longitude);


  // Get capital city lat / long


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

          // currentIsoLocation = result.data.results[0].components['ISO_3166-1_alpha-2'];        
          currentIsoLocation = $('#countrySelect').val();
          // console.log(currentIsoLocation);
          
          // Function for creating the airports (uses the current location from this call)
          

          
          function getAirports () {
            $.ajax({
              url: "./libraries/php/countryAirports.php",
              type: 'POST',
              dataType: 'json',
              data: {
                country: currentIsoLocation,
              },                
              success: function(result) {            
                  // console.log(JSON.stringify(result));            
                  if (result.status.name == 'ok') {          

                    airports.addLayer(
                      
                      result.data.forEach(function (item) {
                      L.marker([item.lat, item.lng], { icon: airportIcon })
                        .bindTooltip(item.name, { direction: "top", sticky: true })
                        .addTo(airports);                          
                    }))
                    

                    
                  }            
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  
                  console.log(jqXHR);
              }
            })
          }

          // Function for creating cities 

          function getCities() {
            $.ajax({
              url: "./libraries/php/countryCities.php",
              type: "POST",
              dataType: "json",
              data: {
                country: currentIsoLocation 
              },
              success: function (result) {  
                if (result.status.code == 200) {

                  cities.addLayer(
                    result.data.forEach(function (item) {
                      if(item.population > 100000){
                        L.marker([item.lat, item.lng], { icon: cityIcon })
                        .bindTooltip(
                          "<div class='col text-center'><strong>" +
                            item.toponymName +
                            "</strong><br><i>(" +
                            numeral(item.population).format("0,0") +
                            ")</i></div>",
                          { direction: "top", sticky: true }
                        )
                        .addTo(cities);
                      }
                      
                    })
                  );
                  
                } 
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR)
              }
            });
          }

          getAirports();
          getCities();

       
          $.ajax({   
            url: "./libraries/php/geoJSONCountryBorders.php",
            type: 'POST',
            dataType: 'json',
            
            success: function(result) {

                
      
                // console.log(JSON.stringify(result));

         
                if (result.status.name == 'ok') {

                 border = L.markerClusterGroup();
                        
                    for (const location of result.data) {
                      
                      var myStyle = {
                        "color": "#00b8d0",
                        "weight": 5,
                        "opacity": 0.65
                    };

                      if(location.properties.iso_a2 === currentIsoLocation) {
                        mapData = location.geometry;

                        border.addLayer(L.geoJSON(mapData, {
                          style: myStyle
                        }))

                        
                        map.addLayer(border);
                        map.fitBounds(border.getBounds(mapData));
                        

                      
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
                  
                  var capitalCity = (result.data[0].capital);
                  localCurrency = (result.data[0].currencyCode);
                  countryCode = (result.data[0].countryCode);

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


                  $.ajax({   
                    url: "./libraries/php/weatherInformation.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                      capital: capitalCity,
                    },
                    
                    success: function(result) {
              
                        // console.log(JSON.stringify(result));
              
                        if (result.status.name == 'ok') {   
                          
                          $('#weatherLocation').html(capitalCity);                
                          
                          // Todays Forcast
                          $('#todayConditions').html(result.data.forecast.forecastday[0].day.condition.text);
                          $('#todayIcon').attr("src", result.data.forecast.forecastday[0].day.condition.icon);
                          $('#todayMaxTemp').html(numeral(result.data.forecast.forecastday[0].day.maxtemp_c).format('0'));
                          $('#todayMinTemp').html(numeral(result.data.forecast.forecastday[0].day.mintemp_c).format('0'));                     
                          
                          // Tomorrows Forecast                            
      
                          $('#day1Date').html(Date.parse("tomorrow").toString("dddd dS"));
                          $('#day1Icon').attr("src", result.data.forecast.forecastday[1].day.condition.icon);
                          $('#day1MaxTemp').html(numeral(result.data.forecast.forecastday[1].day.maxtemp_c).format('0'));
                          $('#day1MinTemp').html(numeral(result.data.forecast.forecastday[1].day.mintemp_c).format('0'));
      
                          // +2 Day Forecast
                        
                          $('#day2Date').html(Date.parse("t + 2d").toString("dddd dS"));
                          $('#day2Icon').attr("src", result.data.forecast.forecastday[2].day.condition.icon);
                          $('#day2MaxTemp').html(numeral(result.data.forecast.forecastday[2].day.maxtemp_c).format('0'));
                          $('#day2MinTemp').html(numeral(result.data.forecast.forecastday[2].day.mintemp_c).format('0'));
      
                          // Last Updated
                          var lastUpdated = Date.parse(result.data.current.last_updated).toString("ddd dS, @ HH:mm");
                          
                          $('#lastUpdated').html(lastUpdated);
                          
                          
                        }         
              
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        
                        console.log(jqXHR);
                    }
              
                  })

                  $.ajax({
                    url: "./libraries/php/capitalCityLatLng.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                      captialName: capitalCity,
                    },
                    
                    success: function(result) {
                
                        // console.log(JSON.stringify(result));
                
                        if (result.status.name == 'ok') {
                             
                          var cityLatitude = (result.data.lat);
                          var cityLongitude = (result.data.lng);
                          // console.log(cityLatitude);

                          // map.flyTo([cityLatitude, cityLongitude]);
                        
                          }
                
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        
                        console.log(jqXHR);
                    }
                  })

                  $.ajax({    
                    url: "./libraries/php/currencyRates.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                      currency: localCurrency,
                    },
                    
                    success: function(result) {
              
                        // console.log(JSON.stringify(result));
      
                        if (result.status.name == 'ok') {                 
                          // console.log(localCurrency);
                          $('#localCurrency').html(localCurrency);
                          
                        }         
              
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        
                        console.log(jqXHR);
                    }
              
                  })


                  $.ajax({
                    url: "./libraries/php/publicHolidays.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                      country: countryCode,
                    },
                    
                    success: function(result) {
              
                        console.log(JSON.stringify(result));


              
                        if (result.status.name == 'ok') {
                            
                          $('#localHolidayYear').html(result.data[0].year);
                          $('#holidayTable').html("");                                                 

                          for(const holiday of result.data) {
                            $('#holidayTable')
                            .append('<tr><td>' + holiday['name'] + '</td><td class="text-end">' + Date.parse(holiday['date']).toString("MMMM dS") + '</td></tr>');
                                                     
                          }
                          
                          
                          }
              
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        
                        console.log(jqXHR);
                    }
                  })
                  

                  

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
            url: "./libraries/php/exchangeRateUpdate.php",
            type: 'POST',
            dataType: 'json',
            
            success: function(result) {
      
                // console.log(JSON.stringify(result));

                if (result.status.name == 'ok') {

                  calcResult();
                
                  console.log($('#exchangeRate').val());
                  for(const currency of result.data ) {

                     
                    $('#exchangeRate').append(`<option id="${currency[0]}" value="${currency[2]}">${currency[1]}</option>`);

                    
                } 
                                                                        
      
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





