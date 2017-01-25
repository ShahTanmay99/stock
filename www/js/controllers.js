angular.module('stock.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('myStocksctrl',['$scope',
 function($scope) {
  $scope.mystocksarray=[
    {ticker:"BOA"},
    {ticker:"AAPL"},
    {ticker:"FB"},
    {ticker:"C"},
    {ticker:"AAP"},
    {ticker:"TSLA"},
    {ticker:"AAC"},
    {ticker:"AAR"},
    {ticker:"AAS"},
    {ticker:"AAT"},
    {ticker:"GPRO"}
  ];
}])

.controller('StockCtrl',['$scope','$stateParams','$window','stockDataService','dateService','chartDataService',
 function($scope, $stateParams,$window,stockDataService,dateService,chartDataService) {
  $scope.ticker=$stateParams.stockTicker;
  $scope.oneYearAgoDate = dateService.oneYearAgoDate();
  $scope.todayDate = dateService.currentDate();

  $scope.chartView=4;
  $scope.$on("$ionicView.afterEnter", function(){
      getPrice();
      getDetails();
      getChartData();
});
  $scope.chartViewFunction = function (n) {
    $scope.chartView=n;
  };
  function getChartData() {
    var promise = chartDataService.gethistoricalData($scope.ticker,$scope.oneYearAgoDate,$scope.todayDate);
    promise.then(function(data){
      $scope.data = JSON.parse(data)
        .map(function(series) {
              series.values = series.values.map(function(d) { return {x: d[0], y: d[1] }; });
              return series;
          });
    });
  }
  function getPrice() {
    var promise=stockDataService.getPriceData($scope.ticker);
    promise.then(function(data){
      $scope.priceData=data;
      //console.log(data);
    });
  }
  function getDetails(){
    var promise=stockDataService.getDetailsData($scope.ticker);
    promise.then(function(data){
      $scope.detailsData=data;
      //console.log(data);
    });
  }
    var marginBottom= ($window.innerWidth/100)*10;
    $scope.options = {
            chart: {
                type: 'linePlusBarChart',
                margin: {
                    top: 15,
                    right: 40,
                    bottom: marginBottom,
                    left: 70
                },
                bars: {
                    forceY: [0]
                },
                bars2: {
                    forceY: [0]
                },
                color: ['#2ca02c', 'darkred'],
                x: function(d,i) { return i; },
                xAxis: {
                    axisLabel: 'X Axis',
                    tickFormat: function(d) {
                        var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                        if (dx > 0) {
                            return d3.time.format('%b %d')(new Date(dx));
                        }
                        return null;
                    }
                },
                tooltips:false,
                showlegend:false,
                useVoronoi:false,
                x2Axis: {
                    tickFormat: function(d) {
                        var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                        return d3.time.format('%b %Y')(new Date(dx));
                    },
                    showMaxMin: false
                },
                y1Axis: {
                    axisLabel: 'Y1 Axis',
                    tickFormat: function(d){
                        return d3.format(',f')(d);
                    },
                    axisLabelDistance: 12
                },
                y2Axis: {
                    axisLabel: 'Y2 Axis',
                    tickFormat: function(d) {
                        return '$' + d3.format('s')(d);
                    }
                },
                y3Axis: {
                    tickFormat: function(d){
                        return d3.format(',.2s')(d);
                    }
                },
                y4Axis: {
                    tickFormat: function(d) {
                        return '$' + d3.format(',.2s')(d);
                    }
                }
            }
        };
  }]);
