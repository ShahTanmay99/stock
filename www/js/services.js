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
.factory('chartDataCacheService', function(CacheFactory) {

  var chartDataCache;

  if(!CacheFactory.get('chartDataCache')) {

    chartDataCache = CacheFactory('chartDataCache', {
      maxAge: 60 * 60 * 8 * 1000,
      deleteOnExpire: 'aggressive',
      storageMode: 'localStorage'
    });
  }
  else {
    chartDataCache = CacheFactory.get('chartDataCache');
  }

  return chartDataCache;
})
.factory('notesCacheService', function(CacheFactory) {

  var notesDataCache;

  if(!CacheFactory.get('notesDataCache')) {

    notesDataCache = CacheFactory('notesDataCache', {
      storageMode: 'localStorage'
    });
  }
  else {
    notesDataCache = CacheFactory.get('notesDataCache');
  }

  return notesDataCache;
})
.factory('stockDetailsCacheService', function(CacheFactory){

  var stockDataCache;

  if(!CacheFactory.get('stockDataCache')) {

    stockDataCache = CacheFactory('stockDataCache', {
      maxAge: 60 * 1000,
      deleteOnExpire: 'aggressive',
      storageMode: 'localStorage'
    });
  }
  else {
    stockDataCache = CacheFactory.get('stockDataCache');
  }

  return stockDataCache;
})
.factory('fillMyStocksCacheService',function(CacheFactory) {

  var myStocksCache;
  if(!CacheFactory.get('myStocksCache')){
    myStocksCache= CacheFactory('myStocksCache',{
      storageMode: 'localStorage'
    });
  }
  else{
    myStocksCache= CacheFactory.get('myStocksCache');
  }
  var fillMyStocksCache = function(){
    var myStocksArray=[
      {ticker:"BOA"},
      {ticker:"AAPL"},
      {ticker:"AAP"},
      {ticker:"TSLA"},
      {ticker:"AAC"},
      {ticker:"AAR"},
      {ticker:"AAS"},
      {ticker:"AAT"},
      {ticker:"GPRO"}
    ];
  myStocksCache.put('myStocks',myStocksArray);
};
return{
  fillMyStocksCache: fillMyStocksCache
};
})

.factory('myStocksCacheService', function(CacheFactory) {
  var myStocksCache = CacheFactory.get('myStocksCache');
  return myStocksCache;
})

.factory('myStocksArrayService', function(fillMyStocksCacheService, myStocksCacheService) {
  if(!myStocksCacheService.info('myStocks')) {
    fillMyStocksCacheService.fillMyStocksCache();
  }
  var myStocks = myStocksCacheService.get('myStocks');
  return myStocks;
})

.factory('followStocksService', function(myStocksArrayService, myStocksCacheService){

return{

  followStocks: function (ticker) {
    var follow = {'ticker' : ticker};
    myStocksArrayService.push(follow);
    myStocksCacheService.put("myStocks", myStocksArrayService);

  },
  unfollowStocks:function (ticker) {
      for (var i = 0; i < myStocksArrayService.length; i++) {
        if(myStocksArrayService[i].ticker == ticker){
          myStocksArrayService.splice(i,1);
          myStocksCacheService.remove('myStocks');
          myStocksCacheService.put("myStocks", myStocksArrayService);
          break;
        }
      }

  },
  checkfollowStocks:function(ticker){
    for (var i = 0; i < myStocksArrayService.length; i++) {
      if(myStocksArrayService[i].ticker == ticker){
        return true;
      }
    }
      return false;
  },
};

})

.factory('stockDataService',function ($q,$http,encodeURIService, stockDetailsCacheService) {
  var getDetailsData = function(ticker) {
    var deferred = $q.defer(),
   query = 'select * from yahoo.finance.quotes where symbol IN ("' + ticker + '")',
   url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
   var  cached=ticker,
    cacheddata= stockDetailsCacheService.get(cached);
    if(!stockDetailsCacheService.get('cached')){
      $http.get(url)
      .success(function(json){
        console.log(json);
        jsonData= json.query.results.quote;
        deferred.resolve(jsonData);
        stockDetailsCacheService.put(cached,jsonData);
      })
      .error(function(error){
        console.log("Details error" + error);
        deferred.reject();
      });
    }
    else {
        deferred.resolve(cacheddata);
    }

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
.factory('chartDataService', function($q,$http, encodeURIService,chartDataCacheService) {
var gethistoricalData= function(ticker, fromDate, todayDate){
var  cached=ticker,
  cacheddata= chartDataCacheService.get(cached),
  deferred = $q.defer(),
      query = 'select * from yahoo.finance.historicaldata where symbol = "' + ticker + '" and startDate = "' + fromDate + '" and endDate = "' + todayDate + '"';
      url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
      if(cacheddata){
        deferred.resolve(cacheddata);
      }
      else{
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
        chartDataCacheService.put(ticker,finalData);
      })
      .error(function(error){
        console.log("Chart error" + error);
        deferred.reject();
      });
   }
    return deferred.promise;
};
return{
  gethistoricalData:gethistoricalData
};

})
.factory('notesService',function (notesCacheService) {
  return{
    getNotes:function(ticker){
      return notesCacheService.get(ticker);
    },
    putNotes:function (ticker, note){
     var stockCache=[];
    if(notesCacheService.get(ticker)){
      stockCache = notesCacheService.get(ticker);
      stockCache.push(note);
    }
    else{
      stockCache.push(note);
    }
       notesCacheService.put(ticker,stockCache);
    },
    deleteNotes:function (ticker, index) {
      deleteNote=[];
      deleteNote=notesCacheService.get(ticker);
      deleteNote.splice(index,1);
      notesCacheService.put(ticker,deleteNote);
    }
  };
});
