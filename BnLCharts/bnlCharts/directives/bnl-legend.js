angular.module('bnlCharts')
.directive('bnlLegend', ['bnlParseAttributeService', 'bnlMeasureTextService', function (bnlParseAttributeService, bnlMeasureTextService) {    
       
    var defaultOrientation = 'vertical';
    var defaultIndicatorRadius = 5;    

    function defaultGetLabelText(d, i) {
        if (d)
        {
            // If there is a label string, I return it.
            if (d.label && typeof(d.label) === 'string')
            {
                return d.label;
            }

            // If there is a text string, I return it.
            if (d.text && typeof (d.text) === 'string') {
                return d.text;
            }           
        }
        
        // I return a default series name based on the index
        return 'Series' + (i + 1);
    }

    function defaultGetIndicatorFill(d,i)
    {
        return 'black';
    }

    var render = function (data, element, orientation, indicatorRadius, getIndicatorClass, getIndicatorFill, getLabelText, width, height, itemMargin, labelMargin) {
        
        orientation = orientation ? orientation : defaultOrientation;
        indicatorRadius = indicatorRadius ? indicatorRadius : defaultIndicatorRadius;
        indicatorRadius = isNaN(indicatorRadius) ? defaultIndicatorRadius : indicatorRadius;
        getIndicatorFill = getIndicatorFill ? getIndicatorFill : defaultGetIndicatorFill;
        getLabelText = getLabelText ? getLabelText : defaultGetLabelText;

        var items = d3.select(element).selectAll('.bnl-legend-item').data(data);

        // Enter
        var enterGroups = items.enter()
            .append('g');

        enterGroups.classed('bnl-legend-item');

        enterGroups.append('circle')
            .classed('bnl-legend-item-indicator', true);

        enterGroups.append('text')
            .classed('bnl-legend-item-label', true);

        // Update
        var xOffset = 0, yOffset = 0;                
        if (orientation === 'horizontal') {            

            items.attr(
                       {
                           transform: function (d, i) {                               
                               var textMeasure = bnlMeasureTextService.measureSvgText(getLabelText(d, i), 'bnl-legend-item-label');
                               var x = xOffset + itemMargin.left;
                               var y = yOffset;
                               // I add space for the indicator, the gutter, and 2x indicator as a right margin
                               xOffset += textMeasure.width + (3 * indicatorRadius) + itemMargin.left + itemMargin.right;
                               return 'translate(' + x + ',' + y + ')';
                           }
                       }
                   );
        }
        else {
            items.attr(
                        {
                            transform: function (d, i) {
                                var textMeasure = bnlMeasureTextService.measureSvgText(getLabelText(d, i), 'bnl-legend-item-label');
                                var x = xOffset + itemMargin.left;
                                var y = yOffset + itemMargin.top;                                
                                // I add space for the gutter
                                yOffset += Math.max(textMeasure.height,indicatorRadius) + indicatorRadius + itemMargin.top + itemMargin.bottom;
                                return 'translate(' + x + ',' + y + ')';
                            }
                        }
                    );
        }

        var indicators = items.select('.bnl-legend-item-indicator');

        indicators.attr(
                {
                    cx: indicatorRadius,
                    r: indicatorRadius,
                    fill: function (d, i) {
                        return getIndicatorFill(d, i);
                    },
                    'class': getIndicatorClass ? function (d, i) { return getIndicatorClass(d, i); } : ''
                }
            );       

        var labels = items.select('.bnl-legend-item-label');

        labels.attr({
            transform: 'translate(' + ((2 * indicatorRadius) + labelMargin.left) + ',' + labelMargin.top + ')'
            //,'alignment-baseline': 'middle'
            })
            .text(function (d, i) { return getLabelText(d, i); });

        // Exit
        items.exit().remove();
    };

    return {
        link: function (scope, element, attrs, bnlChartCtrl) {

            scope.config = bnlChartCtrl.getConfig();

            scope.$on('bnl-chart-render', function (event, args) {

                var g = element[0];                
                                
                var itemMargin = bnlParseAttributeService.parseMargin(scope.itemMargin);
                var labelMargin = bnlParseAttributeService.parseMargin(scope.labelMargin);
                render(scope.data, g, scope.orientation, scope.indicatorRadius, scope.getIndicatorClass, scope.getIndicatorFill, scope.getLabelText, scope.width, scope.height, itemMargin, labelMargin);
            });

        },
        replace: true,
        restrict: 'E',
        require: '^bnlChart',
        scope: {
            data: '=',
            orientation: '@',
            indicatorRadius: '=',
            getIndicatorClass: '=',
            getIndicatorFill: '=',
            getLabelText: '=',
            itemMargin: '@',
            labelMargin: '@'
        },
        templateNamespace: 'svg',
        template: '<g class="bnl-legend"></g>'
    }
}]);