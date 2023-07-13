//updating weather data based on Long and Lat
var APIKey="598dc121f9e0e587ba86da32aa3fa923";

geocoder.on('result', function (e) {

    var result = e.result;
    if (result.place_name) {
        var coordinates = result.geometry.coordinates;
        console.log("Coordinates:", coordinates); // Logging the coordinates
        var urlParams = new URLSearchParams(window.location.search); //gets the destination address
        var address = urlParams.get('address'); //makes the address the destination address
    
        if (address){
          getWeather(coordinates[0], coordinates[1]);
        }
    }
});

$(document).ready(function() {   

    $("#list_area").on("click", ".collection-item", function() {
      var key = $(this).attr("data-key");
      var data = JSON.parse(localStorage.getItem(key));

      $('#addressLong').val(data.addressLong);
      $('#addressLat').val(data.addressLat);
      
      if ((data.addressLong != '') && (data.addressLat !='')){
        getWeather(data.addressLong, data.addressLat);

        if (data.startdate !='') {
            getHistoricalWeather(data.startdate, data.addressLong, data.addressLat)
            .then(weatherData => {
                var weatherDiv = updateWeatherDiv(weatherData);
                $('#start-date-history').empty().append(weatherDiv);
            });
        }
        
        
      }

    });

    $("#start-date").on("change", function(){
        var startDate = $(this).val();
        var addressLong = $('#addressLong').val();
        var addressLat = $('#addressLat').val();

        if ((startDate !='') && (addressLong != '') && (addressLat !='')) {
            getHistoricalWeather(startDate, addressLong, addressLat)
            .then(weatherData => {
                var weatherDiv = updateWeatherDiv(weatherData);
                $('#start-date-history').empty().append(weatherDiv);
            });
        }
    })
    
});

function getWeather(addressLong, addressLat) {
  
  // update the weather api call with the Long, Lat values
  var weatherAPI="https://api.openweathermap.org/data/2.5/weather?lat=" + addressLat + "&lon=" + addressLong + "&appid=" + APIKey +"&units=imperial";

  fetch(weatherAPI)
    .then(function (response) {
      return response.json();
      
    })
    .then(function (data) { 
        var temperature = data.main.temp;
        var humidity = data.main.humidity;
        var wind = data.wind.speed;
        var date = dayjs.unix(data.dt).format('MM/DD/YYYY');
        var weatherIcon = data.weather[0].icon;
        var weatherInfo;

        weatherInfo = {
          temperature: temperature,
          humidity: humidity,
          wind: wind,            
          date:date ,
          weatherIcon: weatherIcon
         }
        return weatherInfo;
    })
    .then(function (data) {
        var htmlstring = '';
        var weatherDiv = $("#weather");
        weatherDiv.empty();

        htmlstring += "<div class='card-panel lighten-5 z-depth-1'>";
        htmlstring += "<div class='row'><div class='col s12 center'><h6>Today's weather</h6></div></div>";
        htmlstring += "<div class='row valign-wrapper'>";
       
        htmlstring += "<div class='col s6 m6'>";
                        
        htmlstring += "<img id='icon' class='responsive-img'"+" src='https://openweathermap.org/img/wn/" + data.weatherIcon + "@2x.png' alt='Weather Icon' class='responsive-img valign'/>";
        htmlstring += "<h2>"+data.temperature +" &#8457;</h2>";
        htmlstring += "</div>";
        htmlstring += "<div class='col s6 m6'>";
        htmlstring += "<span class='black-text'>";                 
        htmlstring += "Wind: "+data.wind +" MPH<br/>";
        htmlstring += "Humidity: "+data.humidity +" %";               
        htmlstring += "</span>";
        htmlstring += "</div></div></div>";                    
                             
        weatherDiv.append(htmlstring);
    })

}  

async function getHistoricalWeather(date, addressLong, addressLat) {
    var day = dayjs(date).get('date');
    var weatherHistory = [];
  
    // Fetch historical data for multiple days
    for (let i = 0; i < 6; i++) {

        const startDate = dayjs(date).subtract(1,'year').add(i, 'day').set('hour',10).set('minute',0);
        const startTime = startDate.unix();
        const endTime = startDate.set('hour',11).set('minute',0).unix(); 

        const url = `https://history.openweathermap.org/data/2.5/history/city?lat=${addressLat}&lon=${addressLong}&start=${startTime}&end=${endTime}&appid=${APIKey}&units=imperial`;
        

        try {
            const response = await fetch(url);
            const data = await response.json();
            const weather = data.list[0];

            const weatherInfo = {
                day: dayjs(startDate).format('ddd, MMM DD'),
                temp_min: Math.floor(weather.main.temp_min),
                temp_max: Math.floor(weather.main.temp_max),
                humidity: weather.main.humidity,
                windspeed: weather.wind.speed,
                icon: weather.weather[0].icon,
                desc: weather.weather[0].description,

            }

            weatherHistory.push(weatherInfo);
        } catch (error) {
            // Handle any errors that occur during the fetch or processing
            console.error('An error occurred:', error);
        }
    }
  
    return weatherHistory;
  }
  
function updateWeatherDiv(weatherData) {

    var htmlstring = "";
    var tableheader = "";
    var tempratureRow = "";
    var windRow = "";
    var humidRow = "";
    var weatherRow = "";

    htmlstring += "<table class='forecast grey lighten-5'>";
    htmlstring += "<tr><th>Last Year</th>";
    tempratureRow += "<tr><td>Temprature</td>";
    windRow += "<tr><td>Wind</td>";
    humidRow += "<tr><td>Humidity</td>";
    weatherRow += "<tr><td></td>";
   
    weatherData.forEach(dataRow =>{
        
        tableheader += "<th>" + dataRow.day + "</th>";
        
        tempratureRow += "<td>" + dataRow.temp_max + " / " + dataRow.temp_min + "&#8457;</td>";
        windRow += "<td>" + dataRow.windspeed + " MPH";
        humidRow += "<td>" + dataRow.humidity + "%</td>";
        weatherRow += "<td><img src='https://openweathermap.org/img/wn/" + dataRow.icon + "@2x.png' width='60'/><br/>"+dataRow.desc + "</td>";

        
    });

    htmlstring += tableheader + "</tr>";
    htmlstring += tempratureRow + "</tr>";
    htmlstring += windRow + "</tr>";
    htmlstring += humidRow + "</tr>";
    htmlstring += weatherRow + "</tr>";
    htmlstring += "</table>";
    
    return htmlstring;
}
  