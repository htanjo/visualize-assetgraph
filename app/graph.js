(function (window) {
  'use strict';

  var d3 = window.d3;

  var Graph = function (element) {

    var self = this;

    // Config
    this.width = 960;
    this.height = 600;
    this.dataUrl = 'data.json';
    this.data = {};

    // Graph
    this.force = d3.layout.force()
      .charge(-3000)
      .friction(0.4)
      .linkDistance(160)
      .size([this.width, this.height]);

    // Tooltip
    this.tip = d3.tip()
      .attr('class', 'd3-tip fade')
      .offset([-6, 0])
      .html(function (d) { return d.path; });

    // SVG canvas
    this.svg = d3.select(element).append('svg')
      .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('class', 'viewport')
      .call(this.tip);

    // D3 objects
    this.node = null;
    this.link = null;

    // Load data and Start rendering
    d3.json(this.dataUrl, function (error, data) {
      self.data = data;
      self.render();
    });

  };

  // Render graph
  Graph.prototype.render = function () {

    var self = this;
    var data = this.data;
    var circleOpacity = 0.6;

    // Color scale
    var color = d3.scale.ordinal()
      .domain(data.colors.domain)
      .range(data.colors.range);

    // Draggable behavior
    var drag = this.force.drag()
      .on('dragstart', function (d) {
        var circleElement = d3.select(this).select('.node-circle').node();
        d3.select(this).classed('drag', true);
        hideTip(d, circleElement);
      })
      .on('dragend', function (d) {
        var circleElement = d3.select(this).select('.node-circle').node();
        d3.select(this).classed('drag', false);
        showTip(d, circleElement);
      });

    // Show tooltip
    var showTip = function (d, target) {
      self.tip.attr('class', 'd3-tip fade in').show(d, target);
    };

    // Hide tooltip
    var hideTip = function (d, target) {
      self.tip.attr('class', 'd3-tip fade').show(d, target);
      self.tip.hide();
    };

    // Mouseover handler
    var mouseover = function (d) {
      var currentNode = d3.select(this);
      if (currentNode.classed('drag')) {
        return this;
      }
      d.fixed = true;
      currentNode.select('.node-circle').transition()
        .duration(250)
        .attr('transform', 'scale(1.3)')
        .style('opacity', 1)
        .each('end', function () {
          showTip(d, this);
        });
    };

    // Mouseout handler
    var mouseout = function (d) {
      var currentNode = d3.select(this);
      var circle;
      if (currentNode.classed('drag')) {
        return this;
      }
      d.fixed = false;
      circle = currentNode.select('.node-circle').transition()
        .duration(250)
        .attr('transform', 'scale(1)')
        .style('opacity', circleOpacity);
      hideTip(d, circle.node());
    };

    // Tick handler
    var tick = function () {
      self.link
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });
      self.node
        .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    };

    this.force
      .nodes(data.nodes)
      .links(data.links)
      .on('tick', tick)
      .start();

    this.link = this.svg.selectAll('.link')
      .data(data.links)
    .enter().append('line')
      .attr('class', 'link')
      .style({
        'stroke': '#c9d1dc',
        'stroke-opacity': 0.8,
        'stroke-width': 1
      });

    this.node = this.svg.selectAll('.node')
      .data(data.nodes)
    .enter().append('g')
      .attr('class', 'node')
      .attr('data-name', function (d) { return d.name; })
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .call(drag);

    this.node.append('circle')
      .attr('r', 4)
      .attr('fill', function (d) { return color(d.type); });

    this.node.append('a')
      .attr('xlink:href', function (d) { return d.path; })
    .append('circle')
      .attr('r', function (d) { return d.value * 20; })
      .attr('fill', function (d) { return color(d.type); })
      .attr('class', 'node-circle')
      .style('opacity', circleOpacity);

    this.node.append('text')
      .attr('dx', 8)
      .attr('dy', '0.25em')
      .text(function (d) { return d.name; });

  };

  window.Graph = Graph;

}(window));
