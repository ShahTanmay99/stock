angular.module('stock.services',[])
.factory('encodeURIService', function() {
  return {
    encode: function(string) {
      return encodeURIComponent(string).replace(/\"/g, "%22").replace(/\ /g, "%20").replace(/[!'()]/g, escape);
    }
  };
})
.factory('dateService', function($filter) {

  var currentDate = function() {
    var d = new Date();
    var date = $filter('date')(d, 'yyyy-MM-dd');
    return date;
  };

  var oneYearAgoDate = function() {
    var d = new Date(new Date().setDate(new Date().getDate() - 365));
    var date = $filter('date')(d, 'yyyy-MM-dd');
    return date;
  };

  return {
    currentDate: currentDate,
    oneYearAgoDate: oneYearAgoDate
  };
})
.factory('stockDataService',function ($q,$http,encodeURIService) {
  var getDetailsData = function(ticker) {
    var deferred = $q.defer(),
   query = 'select * from yahoo.finance.quotes where symbol IN ("' + ticker + '")',
   url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
    $http.get(url)
    .success(function(json){
      console.log(json);
      jsonData= json.query.results.quote;
      deferred.resolve(jsonData);
    })
    .error(function(error){
      console.log("Details error" + error);
      deferred.reject();
    });
    return deferred.promise;
  };
  var getPriceData = function(ticker) {
    var deferred = $q.defer(),
    url = "http://finance.yahoo.com/webservice/v1/symbols/" + ticker + "/quote?format=json&view=detail";
    $http.get(url)
        .success(function(json){
          console.log(json);
      var jsonData= json.list.resources[0].resource.fields;
      deferred.resolve(jsonData);
    })
    .error(function(error){
      console.log("Price error" + error);
      deferred.reject();
    });
    return deferred.promise;
  };
return{
  getPriceData: getPriceData,
  getDetailsData: getDetailsData
};
})
.factory('chartDataService', function($q,$http, encodeURIService) {

var gethistoricalData= function(ticker, fromDate, todayDate){
  var deferred = $q.defer(),
      query = 'select * from yahoo.finance.historicaldata where symbol = "' + ticker + '" and startDate = "' + fromDate + '" and endDate = "' + todayDate + '"';
      url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
      $http.get(url)
      .success(function(json){
      console.log(json);
      var jsonData= json.query.results.quote;
      var priceData=[],
      volumeData=[];
      jsonData.forEach(function(datadate){
        var toMillis = datadate.Date;
        //console.log(toMillis);
        date= Date.parse(toMillis);
          //console.log(date);
         price= parseFloat(Math.round(datadate.Close*100)/100).toFixed(3);
        //console.log(price);
        volume = datadate.Volume;
        var tempVolume = '[' + date + ',' + volume + ']',
        tempPrice = '[' + date + ',' + price + ']';
        //console.log(tempVolume, tempPrice);
        volumeData.unshift(tempVolume);
        priceData.unshift(tempPrice);
      });
        var finalData =
        '[{' +
            '"key":' + '" volume ",'+
            '"bar":' + ' true, ' +
            '"values":' + '[' + volumeData + ']' +
          '},' +
          '{' +
              '"key":' + '" '+ ticker +' ",' +
              '"values":' + '[' + priceData + ']' +
            '}]';

      deferred.resolve(finalData);
    })
    .error(function(error){
      console.log("Chart error" + error);
      deferred.reject();
    });
    return deferred.promise;
};
return{
  gethistoricalData:gethistoricalData
};
});
