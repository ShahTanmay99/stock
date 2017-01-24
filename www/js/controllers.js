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

.controller('StockCtrl',['$scope','$stateParams','stockDataService',
 function($scope, $stateParams, stockDataService) {

  $scope.ticker=$stateParams.stockTicker;
  $scope.chartView=1;
  $scope.$on("$ionicView.afterEnter", function(){
      getPrice();
      getDetails();
});

  $scope.chartViewFunction = function (n) {
    $scope.chartView=n;
  };
  function getPrice() {
    var promise=stockDataService.getPriceData($scope.ticker);
    promise.then(function(data){
      $scope.priceData=data;
      console.log(data);
    });
  }
  function getDetails(){
    var promise=stockDataService.getDetailsData($scope.ticker);
    promise.then(function(data){
      $scope.detailsData=data;
      console.log(data);
    });
  }
}]);
