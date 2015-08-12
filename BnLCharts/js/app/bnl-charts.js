/*!
 * BnL Charts
 * 
 * D3 charting componentized using Angular directives.
 * 
 * Usage
 * -----
 * HTML:
 * 
 *   <bnl-chart chart-data="chartData" width="1200" height="300">
 *     <bnl-absolute-layout>
 *       <bnl-x-axis chart="chart" x="30" y="275" width="1170" height="25"></bnl-x-axis>
 *       <bnl-y-axis chart="chart" x="30" y="0" width="25" height="275"></bnl-y-axis>
 *       <bnl-area chart="chart" x="30" y="0" width="1170" height="275"></bnl-area>
 *     </bnl-absolute-layout>
 *   </bnl-chart>
 * 
 *   The bnl-chart data is bound via the chart-data attribute.
 *   The bnl-chart renders as an SVG element, so you can set properties on the SVG like width and height.
 *   Choose a layout container for the parts of your chart.  Based on your choice, you can apply different attributes to control layout.
 *   Each part will have a chart attribute that you should bind to chart (e.g. chart="chart").
 *   Ordering parts can be important to layout and z-order of rendering.
 *   
 * Components
 * ----------
 * Modules: 
 *   bnlCharts
 * 
 * Directives:
 *   bnl-chart: Main container for a chart.
 * 
 *   bnl-x-axis: Renders an x axis
 *   bnl-y-axis: Renders a Y axis.
 * 
 *   bnl-area: Renders an area chart for a single series)
 * 
 *   bnl-absolute-layout: Positions children based on their attributes of x, y, width, height.
 *   bnl-docked-layout: Positions children based on the side they are docked (left, top, right, bottom, none).
 * 
 * 
 * Design Considerations
 * ---------------------
 * Scope: 
 *   The chart directive is isolated scope to prevent collision with other charts on the page.
 *   Each child that renders has isolated scope to allow for setting individual scope properties like width and height.
 *    
 * Transclusion:
 *   Containers (chart and layouts) transclude content to avoid requiring chart authors to edit templates.
 *   Transclusion is done manually in the directives to avoid creating an additonal isolated scope. ng-transclude is not in the templates.
 *   Layouts with isolated scopes use the chart's scope for their transcluded content to be invisible to their children.
 *   The call to $transclude is done at the tail of the method because it causes link functions to execute.  
 *   $transclude is called so that controller calls tunnel down the scope hierarchy and link calls bubble up the scope hierarchy.
 * 
 * SVG:
 *   This library avoids nesting SVG elements for grouping and uses the <g> element instead.
 *   A single SVG at the root allows the chart to scale properly; It is vector graphics after all.
 *   D3 renders based on variables in memory and not SVG containers (e.g. axis.range), so width/height containment isn't important.
 *   Browsers handle nested SVG width/height updates for rendering, but the clientWidth, clientHeight, and getBBox() are zeros for a nested SVG in JavaScript.
 */

var bnlCharts = angular.module('bnlCharts', []);