var app = angular.module('mainApp', ['bnlCharts']);

app.controller('MainCtrl', function ($scope) {
    
    var now = moment();

    $scope.chartData = [
     { x: moment().toDate(), y: 10 },
     { x: moment().add(1, 'd').toDate(), y: 23 },
     { x: moment().add(2, 'd').toDate(), y: 7 },
     { x: moment().add(3, 'd').toDate(), y: 9 },
     { x: moment().add(4, 'd').toDate(), y: 15 },
     { x: moment().add(5, 'd').toDate(), y: 4 },
     { x: moment().add(6, 'd').toDate(), y: 5 },
     { x: moment().add(7, 'd').toDate(), y: 5 },
     { x: moment().add(8, 'd').toDate(), y: 5 }
    ];
});