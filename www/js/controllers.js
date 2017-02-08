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

.controller('myStocksctrl',['$scope','myStocksArrayService',
 function($scope,myStocksArrayService) {
  $scope.myStocksArray=myStocksArrayService;
  console.log($scope.myStocksArray);
}])

.controller('StockCtrl',['$scope','$stateParams','$ionicPopup','$window','followStocksService','stockDataService','dateService','chartDataService','notesService',
 function($scope, $stateParams,$ionicPopup,$window,followStocksService,stockDataService,dateService,chartDataService,notesService) {
  $scope.ticker=$stateParams.stockTicker;
  $scope.oneYearAgoDate = dateService.oneYearAgoDate();
  $scope.todayDate = dateService.currentDate();
  $scope.stockNotes=[];
  $scope.chartView=4;
  $scope.$on("$ionicView.afterEnter", function(){
      getPrice();
      getDetails();
      getChartData();
      $scope.stockNotes=notesService.getNotes($scope.ticker);
      $scope.following=followStocksService.checkfollowStocks($scope.ticker);
});
  $scope.chartViewFunction = function (n) {
    $scope.chartView=n;
  };

  $scope.follow = function($ticker) {
    if($scope.following){
      followStocksService.unfollowStocks($scope.ticker);
      $scope.following= false;
    }
    else{
      followStocksService.followStocks($scope.ticker);
      $scope.following= true;
    }
  };
  $scope.addnote = function() {
  $scope.note = {title: 'Note', body:'', date:$scope.todayDate, ticker:$scope.ticker};

  // An elaborate, custom popup
  var note = $ionicPopup.show({
    template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
    title: 'New Note' + $scope.ticker,
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-balanced',
        onTap: function(e) {
          console.log("save", $scope.note);
          notesService.putNotes($scope.ticker,$scope.note);
        }
      }
    ]
  });
  note.then(function(res) {
    $scope.stockNotes=notesService.getNotes($scope.ticker);
  });
};

$scope.opennote = function(index,title,body) {
$scope.note = {title: title, body:body, date:$scope.todayDate, ticker:$scope.ticker};

// An elaborate, custom popup
var note = $ionicPopup.show({
  template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
  title: $scope.note.title,
  scope: $scope,
  buttons: [
    { text: 'Cancel',
      type: 'button-small'
    },
    {
      text: '<b>Save</b>',
      type: 'button-balanced button-small',
      onTap: function(e) {
        console.log("save", $scope.note);
        notesService.putNotes($scope.ticker,$scope.note);
      }
    },
    {
      text: '<b>Delete</b>',
      type: 'button-assertive button-small',
      onTap: function(e) {
        console.log("Delete", $scope.note);
        notesService.deleteNotes($scope.ticker,index);
      }
    }
  ]
});
note.then(function(res) {
  $scope.stockNotes=notesService.getNotes($scope.ticker);
});
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
                    right: 0,
                    bottom: marginBottom,
                    left: 0
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
                // tooltips:false,
                // showlegend:false,
                // useVoronoi:false,
                x2Axis: {
                    tickFormat: function(d) {
                        var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                        return d3.time.format('%b %Y')(new Date(dx));
                    },
                    showMaxMin: false
                },
                y1Axis: {
                    axisLabel: 'Price',
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
                  axisLabel: 'Volume',
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
