// ================================================================================ //
/*
 * BnL Charts - bnl-docked-layout
 * 
 * Provides layout of child SVG elements based on docking to the sides of the available
 * area with undocked element taking up the remaining space.
 * 
 * Usage
 * -----
 * HTML:
 * 
 *   <bnl-chart ...>
 *     ...
 *     <bnl-docked-layout>                
 *       <bnl-y-axis ... dock="left" width="25" margin="0,0,25,0"></bnl-y-axis>
 *       <bnl-x-axis ... dock="bottom" height="25"></bnl-x-axis>                               
 *       <bnl-area ... ></bnl-area>
 *     </bnl-docked-layout>
 *   </bnl-chart>
 * 
 *   The optional dock element can be top, left, right, or bottom.
 *   If multiple items at the same dock position overlap.
 *   You can nest bnl-docked-layout elements to stack element docked to the same side.
 *   
 *   The optional margin element allows spacing around elements.  
 *   Margin behaves like the CSS margin attribute (i.e. TRBL)
 *    
 * 
 * Design Considerations
 * ---------------------
 * Elements are positioned using tranform: translate
 * Width and Height are set on the scope of each child element.
 * Child elements are expected to have isolated scope.
 */
// ================================================================================ //
angular.module('bnlCharts')
.directive('bnlDockedLayout', ['bnlParseAttributeService', function (bnlParseAttributeService) {    

    var positionChild = function (child, x, y, width, height) {

        if (x !== 0 || y !== 0) {
            d3.select(child).attr({
                transform: 'translate(' + x + ',' + y + ')'
            });
        }

        var childScope = angular.element(child).isolateScope();

        childScope.width = width;
        childScope.height = height;
    }

    return {
        controller: function ($scope, $element, $attrs, $transclude) {

            // I use $scope.$parent to avoid injecting an empty scope for trancluded content.
            $transclude($scope.$parent, function (clone, scope) {
                $element.append(clone);
            });

            $scope.$on('bnl-chart-render', function (event, args) {

                var g = $element[0];
                var svg = g.ownerSVGElement;

                var layouts = [];

                var x = 0, y = 0, width = $scope.width ? $scope.width : svg.clientWidth, height = $scope.height ? $scope.height : svg.clientHeight;

                var undocked = [];
                var undockedMargin = { top: 0, right: width, bottom: height, left: 0 };                

                $.each($($element).children(), function (index, child) {

                    var $child = $(child);

                    var childMargin = bnlParseAttributeService.parseMargin($child.attr('margin'));

                    var childX = x + childMargin.left;
                    var childY = y + childMargin.top;
                    var childWidth = $child.attr('width') ? Number($child.attr('width')) : width;
                    var childHeight = $child.attr('height') ? Number($child.attr('height')) : height;

                    var childDockHeight = childMargin.top + childHeight + childMargin.bottom;
                    var childDockWidth = childMargin.left + childWidth + childMargin.right;

                    var dock = $child.attr('dock');
                    if (dock) {
                        switch (dock) {
                            case 'top':
                                undockedMargin.top = Math.max(y + childDockHeight, undockedMargin.top);
                                childWidth -= childMargin.left + childMargin.right;
                                break;
                            case 'right':
                                undockedMargin.right = Math.min(width - childDockWidth, undockedMargin.right);
                                childX = (width - childDockWidth) + childMargin.left;
                                childHeight -= childMargin.top + childMargin.bottom;
                                break;
                            case 'bottom':
                                undockedMargin.bottom = Math.min(height - childDockHeight, undockedMargin.bottom);
                                childY = (height - childDockHeight) + childMargin.top;
                                childWidth -= childMargin.left + childMargin.right;
                                break;
                            case 'left':
                                undockedMargin.left = Math.max(x + childDockWidth, undockedMargin.left);
                                childHeight -= childMargin.top + childMargin.bottom;
                                break;
                            default:
                                console.warn('The dock attribute "' + dock + '" is not supported by bnl-docked-layout. The element will be treated as undocked.');
                                dock = undefined;
                                break;
                        }
                    }

                    if (dock) {
                        positionChild(child, childX, childY, childWidth, childHeight);
                    }
                    else {
                        undocked.push({ child: child, childMargin: childMargin });
                    }
                });

                // undocked children are positioned after undockedMargin is calculated               
                for (var i = 0; i < undocked.length; i++) {

                    var child = undocked[i].child;
                    var childMargin = undocked[i].childMargin;

                    var childX = undockedMargin.left + childMargin.left;
                    var childY = undockedMargin.top + childMargin.top;
                    var childWidth = (undockedMargin.right - childMargin.right) - childX;
                    var childHeight = (undockedMargin.bottom - childMargin.bottom) - childY;

                    positionChild(child, childX, childY, childWidth, childHeight);
                }
            });
        },
        replace: true,
        restrict: 'E',
        scope: {},
        templateNamespace: 'svg',
        template: '<g class="bnl-docked-layout"></g>',
        transclude: true
    }
}]);