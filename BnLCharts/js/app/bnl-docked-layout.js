bnlCharts.directive('bnlDockedLayout', [function () {

    var parseMargin = function (text) {

        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        if (text) {

            var parts = text.split(',');

            switch (parts.length) {
                case 1:
                    var marginAll = Number(parts[0]);
                    if (!isNaN(marginAll)) {
                        margin.top = marginAll;
                        margin.right = marginAll;
                        margin.bottom = marginAll;
                        margin.left = marginAll;
                    }
                    break;
                case 2:
                    var marginTopBottom = Number(parts[0]);
                    var marginLeftRight = Number(parts[1]);

                    if (!isNaN(marginTopBottom)) {
                        margin.top = marginTopBottom;
                        margin.bottom = marginTopBottom;
                    }

                    if (!isNaN(marginLeftRight)) {
                        margin.right = marginLeftRight;
                        margin.left = marginLeftRight;
                    }
                    break;
                case 3:
                    var marginTop = Number(parts[0]);
                    var marginLeftRight = Number(parts[1]);
                    var marginBottom = Number(parts[2]);

                    if (!isNaN(marginTop)) {
                        margin.top = marginTop;
                    }

                    if (!isNaN(marginLeftRight)) {
                        margin.right = marginLeftRight;
                        margin.left = marginLeftRight;
                    }

                    if (!isNaN(marginBottom)) {
                        margin.bottom = marginBottom;
                    }

                    break;
                default:

                    if (parts.length >= 4) {

                        var marginTop = Number(parts[0]);
                        var marginRight = Number(parts[1]);
                        var marginBottom = Number(parts[2]);
                        var marginLeft = Number(parts[3]);

                        if (!isNaN(marginTop)) {
                            margin.top = marginTop;
                        }

                        if (!isNaN(marginRight)) {
                            margin.right = marginRight;
                        }

                        if (!isNaN(marginBottom)) {
                            margin.bottom = marginBottom;
                        }

                        if (!isNaN(marginLeft)) {
                            margin.left = marginLeft;
                        }
                    }

                    break;
            }
        }

        return margin;
    }

    return {
        controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
            console.log('bnlDockedLayout controller:' + $scope.$id);

            // I use $scope.$parent to avoid injecting an empty scope for trancluded content.
            $transclude($scope.$parent, function (clone, scope) {
                $element.append(clone);
            });

            $scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlDockedLayout render:' + $scope.$id);

                var g = $element[0];
                var svg = g.ownerSVGElement;

                var layouts = [];

                var x = 0, y = 0, width = $scope.width ? $scope.width : svg.clientWidth, height = $scope.height ? $scope.height : svg.clientHeight;

                $.each($($element).children(), function (index, child) {

                    var $child = $(child);
                    var dock = $child.attr('dock');

                    var childX = x, childY = y, childWidth = width, childHeight = height;

                    if (dock) {
                        if (dock === 'top') {
                            childHeight = $child.attr('height') ? Number($child.attr('height')) : height;
                            y += childHeight;
                            height -= childHeight;
                        }
                        else if (dock === 'right') {

                            childWidth = $child.attr('width') ? Number($child.attr('width')) : width;
                            childX = width - childWidth;

                            width -= childWidth;
                        }
                        else if (dock === 'bottom') {

                            childHeight = $child.attr('height') ? Number($child.attr('height')) : height;
                            childY = height - childHeight;

                            height -= childHeight;
                        }
                        else if (dock === 'left') {
                            childWidth = $child.attr('width') ? Number($child.attr('width')) : width;

                            x += childWidth;
                            width -= childWidth;
                        }
                    }

                    // I support margin attribute (TRBL same as CSS margin
                    var margin = parseMargin($child.attr('margin'));
                    childY += margin.top;
                    childX += margin.left;

                    childHeight -= (margin.top + margin.bottom);
                    childWidth -= (margin.left + margin.right);

                    // I position each child
                    if (childX !== 0 || childY !== 0) {
                        d3.select(child).attr({
                            transform: 'translate(' + childX + ',' + childY + ')'
                        });
                    }

                    var childScope = angular.element(child).isolateScope();

                    childScope.width = childWidth;
                    childScope.height = childHeight;
                });
            });
        }],
        link: function (scope, element, attrs) {
            console.log('bnlDockedLayout link:' + scope.$id);

            var g = element[0];
            d3.select(g).classed('bnl-docked-layout', true);
        },
        replace: true,
        restrict: 'E',
        scope: {},
        templateNamespace: 'svg',
        template: '<g></g>',
        transclude: true
    };
}]);