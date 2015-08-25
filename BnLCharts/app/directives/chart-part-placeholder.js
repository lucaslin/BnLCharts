angular.module('mainApp')
.directive('chartPartPlaceholder', function () {   

    var render = function (element, strokeColor, fillColor, width, height) {

        d3.select(element)
            .append('rect')
            .attr({
                width: width,
                height: height,
                stroke: strokeColor ? strokeColor : 'black',
                'stroke-width': strokeColor ? 1 : 0,
                fill: fillColor ? fillColor : 'gray',                
            });
       
    };

    return {
        link: function (scope, element, attrs) {
            
            scope.$on('bnl-chart-render', function (event, args) {

             
                var g = element[0];
                render(g, scope.strokeColor, scope.fillColor, scope.width, scope.height);
            });
        },
        replace: true,
        restrict: 'E',        
        scope: {
            strokeColor: '@',
            fillColor: '@'
        },
        templateNamespace: 'svg',
        template: '<g class="placeholder"></g>'
    }
});