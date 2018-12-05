var rawDataFiltered = []; // the variable that holds the data from csv file
var rawData = [];
var analysisResult = {};

$(document).ready(function() {
  loadRawData("RecidivismData_Original.csv");
});

function loadRawData(fileName) {
  d3.csv("data/" + fileName, function (d) {
    rawData = d;
    loadAnalysisResult("sample_structure.json");
  });
}

function loadAnalysisResult(fileName) {
  d3.json("data/"+fileName, function(d) {
    analysisResult = d;
    drawAll(true);
  });
}

function drawAll(init = false) {
  drawDiagramCorrelations(init);
}

function drawDiagramCorrelations(init = false) {
  // https://bost.ocks.org/mike/miserables/

  // Init correlations visualization
  var margin = {top: 80, right: 0, bottom: 10, left: 80},
      width = 600,
      height = 600;

  var correlationMatrix = [],
      nodes = [],
      nodeNameToId = {},
      n = analysisResult.num_cols;


  // Compute index per node
  analysisResult.colnames.forEach(function(v, i) {
    nodes.push({
      'name' : v,
      'index' : i,
      'count' : 0
    });
    nodeNameToId[v] = i;
  });

  nodes.forEach(function(node, i) {
    correlationMatrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    // correlationMatrix[i][i].z = 1;
  });

  // Convert links to correlationMatrix; count character occurrences.
  analysisResult.correlations.forEach(function(v) {
    var sourceName = v.split(' --- ')[0],
        targetName = v.split(' --- ')[1].split('=>')[0];
    var source = nodeNameToId[sourceName],
        target = nodeNameToId[targetName],
        value = parseFloat(v.split('=>')[1]);
    // console.log(value);
    // correlationMatrix[source][target].z += link.value;
    // correlationMatrix[target][source].z += link.value;
    // correlationMatrix[source][source].z += link.value;
    // correlationMatrix[target][target].z += link.value;
    // nodes[source].count += link.value;
    // nodes[target].count += link.value;
    correlationMatrix[source][target].z = value;
    correlationMatrix[target][source].z = value;
    // nodes[source].count += 1;
    // nodes[target].count += 1;
  });
  // console.log(correlationMatrix);

  var svg = d3.select("#diagramCorrelations").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin-left", "20px")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleBand()
            .domain(nodes.map(function (d) { return d.name; }))
            .range([0, width])
            .padding(0.1);

      z = d3.scaleLinear().domain([0, 1]).range([height, 0]).clamp(true),
      c = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(10));

  // Precompute the orders.
  // var orders = {
  //   name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a], nodes[b]); }),
  //   group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
  // };
  //
  // // The default sort order.
  // x.domain(orders.name);

  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#eee");

  var row = svg.selectAll(".row")
      .data(correlationMatrix)
      .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + x(nodes[i].name) + ")"; })
      .each(drawRow);

  row.append("line")
      .attr("x2", width)
      .attr("stroke", "white");

  row.append("text")
      .attr("x", -6)
      .attr("y", x.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .attr("class", "correlationsColumnNames")
      .text(function(d, i) { return nodes[i].name; });

  var column = svg.selectAll(".column")
      .data(correlationMatrix)
    .enter().append("g")
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(nodes[i].name) + ")rotate(-90)"; });

  column.append("line")
      .attr("x1", -width)
      .attr("stroke", "white");

  column.append("text")
      .attr("x", 6)
      .attr("y", x.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .attr("class", "correlationsColumnNames")
      .text(function(d, i) { return nodes[i].name; });

  function drawRow(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d) { return true; }))
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return x(nodes[d.x].name); })
        .attr("width", x.bandwidth())
        .attr("height", x.bandwidth())
        .style("fill-opacity", function(d) { return (d.z * 2); })
        .style("fill", function(d) { return "#000" })
        .on("click", function(d) { drawScatterPlot(d.x, d.y); });
        // .on("mouseover", mouseover)
        // .on("mouseout", mouseout);
  }


}

var initDrawScatterPlot = true;
function drawScatterPlot(columnX, columnY) {

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 400 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var x = d3.scaleLinear().range([0, width])
            .domain(d3.extent(rawData, function(d) { return d[Object.keys(d)[columnX]]; })),
            // .nice(),
      y = d3.scaleLinear().range([height, 0])
            .domain(d3.extent(rawData, function(d) { return d[Object.keys(d)[columnY]]; }));

  if (!initDrawScatterPlot) {
    var svg = d3.select("#diagramScatterPlot")
    $("#diagramScatterPlot").empty();
  }
  initDrawScatterPlot = false;
  var svg = d3.select("#diagramScatterPlot").append("svg")
              .attr("id", "diagramScatterPlotSvg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .style("background-color", "#bbb")
              .style("opacity", 0.5)
              .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // console.log(x);

  var gx = svg.append("g")
              .attr("class", "xAxis")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x))
              .selectAll("text")
              .style("text-anchor", "end")
              .style("font-size", "0.8em")
              .attr("transform", "rotate(-45)");

  var gy = svg.append("g")
              .attr("class", "yAxis")
              .call(d3.axisLeft(y));

  // Add the points!
  svg.selectAll(".point")
      .data(rawData)
      .enter().append("circle")
      .attr("class", "point")
      .attr("cx", function(d) { return x(d[Object.keys(d)[columnX]]); })
      .attr("cy", function(d) { return y(d[Object.keys(d)[columnY]]); })
      .attr("r", 3);;

  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  svg.selectAll(".point")
      .on("mousemove", function (d) {
                  var tooltipSt = "";
                  analysisResult.colnames.forEach(function(v, i) {
                    tooltipSt += "<b>" + v + "</b> " + d[Object.keys(d)[i]] + "<br>"
                  });
                  tooltip
                      .style("left", d3.event.pageX + 50 + "px")
                      .style("top", d3.event.pageY - 70 + "px")
                      .style("display", "inline-block")
                      .html(tooltipSt);
              })
              .on("mouseout", function (d) {
                  tooltip.style("display", "none");
              });

}
