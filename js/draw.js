var rawDataFiltered = []; // the variable that holds the data from csv file
var rawData = [];
var analysisResult = {};
var rawColumnFiltered = [];
var rawColumns = [];

var csvFileName = "RecidivismData_Original.csv";
var jsonFileName = "sample_structure.json";

$(document).ready(function() {
  loadRawData();
});

function loadRawData() {
  d3.csv("data/" + csvFileName).then(function (d) {
    rawData = d;
    rawDataFiltered = d;
    rawColumns = Object.keys(rawData[1]);
    rawColumnFiltered = Object.keys(rawData[1]);
    console.log('rawData', rawData);
    console.log('rawColumns', rawColumns);
    loadAnalysisResult();
  });
}

function loadAnalysisResult() {
  d3.json("data/"+jsonFileName).then(function(d) {
    analysisResult = d;
    // console.log(analysisResult);
    init(analysisResult);
    drawAll(true);
  });
}

///////////////// by Meng /////////////////

function init(analysisResult){
  var div1 = d3.select("#nominal");
  var lst1 = analysisResult.nominal;
  //console.log(lst);
  lst1.forEach(function(v){
    //console.log(v);
    var colname = v;
    var colname_div=div1.append("div")
    colname_div.append("label")
    .attr("for",v)
    .text(v)
    .attr("class","column_name")

    colname_div.append("input")
    .attr("id",v)
    .attr("type","checkbox")
    .attr("class","column_checkbox")
    .attr("checked","checked")


    var lst_of_values = [];
    rawData.forEach(function(v) {
      lst_of_values.push(v[colname]);
    });
    //console.log(lst_of_values);
    dict_of_value = {};



  });

  var div2 = d3.select("#ordinal");
  var lst2 = analysisResult.ordinal;
  //console.log(lst);
  lst2.forEach(function(v){
    //console.log(v);
    var colname = v;
    var colname_div=div2.append("div")
    colname_div.append("label")
    .attr("for",v)
    .text(v)
    .attr("class","column_name")

    colname_div.append("input")
    .attr("id",v)
    .attr("type","checkbox")
    .attr("class","column_checkbox")
    .attr("checked","checked")


    var lst_of_values = [];
    rawData.forEach(function(v) {
      lst_of_values.push(v[colname]);
    });
    //console.log(lst_of_values);
    dict_of_value = {};


  });

  var div3 = d3.select("#quantitative");
  var lst3 = analysisResult.quantitative;
  //console.log(lst);
  lst3.forEach(function(v){
    //console.log(v);
    var colname = v;
    var colname_div=div3.append("div")
    colname_div.append("label")
    .attr("for",v)
    .text(v)
    .attr("class","column_name")

    colname_div.append("input")
    .attr("id",v)
    .attr("type","checkbox")
    .attr("class","column_checkbox")
    .attr("checked","checked")

// should calculate the min and max
  });

  var columnNamesToggle = ['#nominal_change', '#ordinal_change', '#quantitative_change'];
  columnNamesToggle.forEach(function(v) {
    $(v).click(function() {
      if ($(v).innerHTML=="+") {
        $(v).innerHTML="-";
      } else {
        $(v).innerHTML="+";
      }
      $(v.slice(0, v.length - 7)).toggle();
    })
  }); // rebuild by z @ 12.12


}

///////////////// by Zhen /////////////////

function drawAll(initzer = false) {
  drawDiagramCorrelations(initzer);
  drawDiagramFunctionalDep(initzer);
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
  var xName = Object.keys(rawData[1])[columnX];
  var yName = Object.keys(rawData[1])[columnY];
  // var data = rawData.map(function(d) { return {x: parseFloat(d[xName]), y: parseFloat(d[yName])}; });
  var data = rawData.map(function(d) { return {x: parseFloat(d[xName]), y: parseFloat(d[yName])}; });

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

  var title = d3.select('#diagramScatterPlotName')
                .text('Correlation between ' + xName + ' and ' + yName)

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


function pearsonCorrelation(columnX, columnY, p1, p2) {

  prefs = []
  var si = [];

  for (var key in prefs[p1]) {
    if (prefs[p2][key]) si.push(key);
  }

  var n = si.length;

  if (n == 0) return 0;

  var sum1 = 0;
  for (var i = 0; i < si.length; i++) sum1 += prefs[p1][si[i]];

  var sum2 = 0;
  for (var i = 0; i < si.length; i++) sum2 += prefs[p2][si[i]];

  var sum1Sq = 0;
  for (var i = 0; i < si.length; i++) {
    sum1Sq += Math.pow(prefs[p1][si[i]], 2);
  }

  var sum2Sq = 0;
  for (var i = 0; i < si.length; i++) {
    sum2Sq += Math.pow(prefs[p2][si[i]], 2);
  }

  var pSum = 0;
  for (var i = 0; i < si.length; i++) {
    pSum += prefs[p1][si[i]] * prefs[p2][si[i]];
  }

  var num = pSum - (sum1 * sum2 / n);
  var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
      (sum2Sq - Math.pow(sum2, 2) / n));

  if (den == 0) return 0;

  return num / den;
}

///////////////// by Huyen /////////////////

///Functional dependencies
function drawDiagramFunctionalDep(init = false) {
    //https://beta.observablehq.com/@mbostock/d3-force-directed-graph

    var margin = {top: 80, right: 0, bottom: 10, left: 80},
        width = 950,
        height = 600;

    var sourceNodes = [],
        sourceLinks = [];

    analysisResult.colnames.forEach(function(v, i) {
      sourceNodes.push({
        'id' : v,
        'group' : i
      });
    });

    analysisResult.fds.forEach(function(v, i) {
        var sourceName = v.split('=>')[0].split(/, /),
            targetName = v.split('=>')[1];
        var relatedNodes = sourceName.concat(targetName);

            sourceName.forEach(function(item){
                sourceLinks.push({
                    'source' : item,
                    'target' : targetName,
                    'group' : i
                })
            })
    });

    console.log(sourceLinks);
    console.log(sourceNodes);

    const links = sourceLinks.map(d => Object.create(d));
    const nodes = sourceNodes.map(d => Object.create(d));
    const simulation = forceSimulation(nodes, links).on("tick", ticked);

    var svg = d3.select("#visFunctionalDep").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", [-(width - margin.left - margin.right) / 2, -(height - margin.top - margin.bottom) / 2, width, height])
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltipFunctionalDep = d3.select("body").append("div").attr("class", "toolTip");

    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2)
        .attr("class", "edge")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", color(d => scale(d.group)));

    svg.selectAll(".edge")
            .on("mousemove", function (d) {
                var tooltipSt = "";
                analysisResult.fds.forEach(function(v) {
                    tooltipSt += "<b>" + v + "</b></br>"
                });
                tooltipFunctionalDep
                    .style("left", d3.event.pageX + 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html(tooltipSt);
            })
            .on("mouseout", function (d) {
                tooltipFunctionalDep.style("display", "none");
            });

    var node = svg.selectAll(".node")
                .data(nodes)
                .enter().append("g")
                .attr("class", "node");
                //.call(drag(simulation));

    node.append("circle")
        .attr("r", 8)
        .call(drag(simulation));

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.id });

    // const node = svg.append("g")
    //     .attr("stroke", "#fff")
    //     .selectAll("circle")
    //     .data(nodes)
    //     .enter().append("circle")
    //     .attr("r", 8)
    //     //.attr("fill", color(d => scale(d.group)))
    //     .call(drag(simulation));

    // // node.append("title")
    // //     .text(d => d.id);

    // const text = svg.append("g")
    //     .selectAll("text")
    //     .data(nodes)
    //     .enter().append("text")
    //     .attr("dx", 12)
    //     .attr("dy", ".35em")
    //     .text(function(d) { return d.id; });

        function ticked() {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            // node.attr("cx", d => d.x)
            //     .attr("cy", d => d.y);
            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          }
  }

function forceSimulation(nodes, links) {
  return d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("center", d3.forceCenter());
}

function drag(simulation){

  function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

  //   function dragended(d) {
  //     if (!d3.event.active) simulation.alphaTarget(0);
  //     d.fx = null;
  //     d.fy = null;
  //   }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        //.on("end", dragended);
}

function color(d){
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return d => scale(d.group);
}
