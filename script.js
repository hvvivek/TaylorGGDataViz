var data_backup;

var margin = {top: 20, right: 0, bottom: 0, left: 0},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width+40], .0);

var y = d3.scale.linear()
    .rangeRound([height-200, 0]);

var color = d3.scale.ordinal()
    .range(["#B3D16A", "#FFD662", "#E89A50", "#CA6753", "#CA6753", "#d0743c", "#ff8c00"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + (-20 + margin.left) + "," + margin.top + ")");

var active_link = "0"; //to control legend selections and hover
var legendClicked; //to control legend selections
var legendClassArray = []; //store legend classes to select bars in plotSingle()
var y_orig; //to store original y-posn

d3.csv("topcompanies_trimmed.csv", function(error, data) {
  if (error) throw error;
  data_backup = data
//   console.log(data)
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "companies" && key !== "industry"; }));

  data.forEach(function(d) {
    var mystate = d.companies; //add to stock code
    var industry = d.industry
    var y0 = 0;
    //d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
    d.ages = color.domain().map(function(name) { return {mystate:mystate, industry:industry, name: name, y0: y0, y1: y0 += +d[name]}; });
    // console.log(d.ages)
    d.total = d.ages[d.ages.length - 1].y1;

  });

  data.sort(function(a, b) { return b.total - a.total; });

  x.domain(data.map(function(d) { return d.companies; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]);

  // svg.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(xAxis);

  // svg.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxis)
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 6)
  //     .attr("dy", ".71em")
  //     .style("text-anchor", "end");
      //.text("Population");

  var state = svg.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + "0" + ",200)"; });
      //.attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; })

  state.selectAll("rect")
      .data(function(d) {
        return d.ages; 
      })
    .enter().append("rect")
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y1); })
      .attr("x",function(d) { //add to stock code
          return x(d.mystate)
        })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .attr("class", function(d) {
        console.log(d)
        classLabel = d.name.replace(/\s/g, ''); //remove spaces
        return "class" + classLabel + " " + d.industry.replace(/\s/g, '') + " industry";
      })
      .style("fill", function(d) { return color(d.name); });

  state.selectAll("rect")
       .on("mouseover", function(d){

          var delta = d.y1 - d.y0;
          var xPos = parseFloat(d3.select(this).attr("x"));
          var yPos = parseFloat(d3.select(this).attr("y"));
          var height = parseFloat(d3.select(this).attr("height"))

          d3.select(this).attr("stroke","blue").attr("stroke-width",0.8);
          d3.select("#company_details h4").text(d.mystate)
          var company_name = d.mystate
          var company_data = data_backup.filter(function(d){return d.companies == company_name})[0]
          d3.select("#company_details p:nth-of-type(1)").text("Representation: " + company_data.Representation)
          d3.select("#company_details p:nth-of-type(2)").text("Maternity " + company_data.Maternal)
          d3.select("#company_details p:nth-of-type(3)").text("Support: " + company_data.Support)
          d3.select("#company_details p:nth-of-type(4)").text("Advancement: " + company_data.Advancement)
          
        //   d3.select("#company_details h4").text(d.mystate)
        //   d3.select("#company_details h4").text(d.mystate)
        //   d3.select("#company_details h4").text(d.mystate)

        //   svg.append("g").append("text")
        //   .attr("x",xPos)
        //   .attr("y",yPos +height/2)
        //   .attr("class","tooltip")
        //   .text("Random Test Text"); 
          
       })
       .on("mouseout",function(){
        //   svg.select(".tooltip").remove();
          d3.select(this).attr("stroke","pink").attr("stroke-width",0.2);
                                
        })

  var industries = []
  for (var i=0; i<data_backup.length; i++)
  {
    industries.push(data_backup[i].industry)
  }
  industries = industries.unique()
  // console.log(industries)
  

  var industry_legend = svg.selectAll(".industry_legend")
      .data(industries)
    .enter().append("g")
      //.attr("class", "legend")
      .attr("class", function (d) {
        legendClassArray.push(d.replace(/\s/g, '')); //remove spaces
        return "industry_legend";
      })
      .attr("transform", function(d, i) { return "translate(0," + (100 + i * 20) + ")"; });

  var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      //.attr("class", "legend")
      .attr("class", function (d) {
        legendClassArray.push(d.replace(/\s/g, '')); //remove spaces
        return "legend";
      })
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  //reverse order to match order in which bars are stacked    
  legendClassArray = legendClassArray.reverse();

  industry_legend.append("circle")
      .attr("cx", width - 9)
      .attr("cy", 8)
      .attr("r", 8)
      // .attr("height", 18)
      .style("fill", "white")
      .style("stroke", "black")
      .attr("active", "false")
      .attr("id", function (d, i) {
        return "id" + d.replace(/\s/g, '');
      })
      .on("mouseover",function(){        

        if (active_link === "0") d3.select(this).style("cursor", "pointer");
        else {
          if (active_link.split("class").pop() === this.id.split("id").pop()) {
            d3.select(this).style("cursor", "pointer");
          } else d3.select(this).style("cursor", "auto");
        }
      })
      .on("click", function(d)
      {
        if(d3.select(this).attr("active") != "true")
        {
          d3.select(this)
            .style("fill", "black")
            .attr("active", "true")

          plotIndustry(this)
        }
        else
        {
          d3.select(this)
            .style("fill", "white")
            .attr("active", "false")

          removeIndustry(this)
        }
      })

  industries_to_show = []

  function plotIndustry(d)
  {
    industries_to_show.push(d.id.split("id").pop())
    
    for(var i=0; i<industries.length; i++)
    {
      if(!industries_to_show.contains(industries[i].replace(/\s/g, '')))
      {
        // console.log(industries[i].replace(/\s/g, '') + " " + industry_to_show)
        d3.selectAll("." + industries[i].replace(/\s/g, ''))
        .transition()
        .duration(1000)          
        .style("opacity", 0);
      }
      else
      {
        d3.selectAll("." + industries[i].replace(/\s/g, ''))
        .transition()
        .duration(1000)          
        .style("opacity", 1);
      }
    }
  }

  function removeIndustry(d)
  {
    industries_to_show.pop(d.id.split("id").pop())
    if(industries_to_show.length != 0)
    {
      for(var i=0; i<industries.length; i++)
      {
        if(!industries_to_show.contains(industries[i].replace(/\s/g, '')))
        {
          // console.log(industries[i].replace(/\s/g, '') + " " + industry_to_show)
          d3.selectAll("." + industries[i].replace(/\s/g, ''))
          .transition()
          .duration(1000)          
          .style("opacity", 0);
        }
        else
        {
          d3.selectAll("." + industries[i].replace(/\s/g, ''))
          .transition()
          .duration(1000)          
          .style("opacity", 1);
        }
      }
    }
    else
    {
      d3.selectAll(".industry")
          .transition()
          .duration(1000)          
          .style("opacity", 1);
    } 
    
    // d3.selectAll(".industry")
    // .transition()
    // .duration(1000)          
    // .style("opacity", 0);

    // d3.selectAll(industry_to_show)
    // .transition()
    // .duration(1000) 
    // .delay()         
    // .style("opacity", 1);
    

      // d3.select("")
  }


  legend.append("circle")
      .attr("cx", width - 9)
      .attr("cy", 8)
      .attr("r", 8)
      // .attr("height", 18)
      .style("fill", color)
      .attr("id", function (d, i) {
        return "id" + d.replace(/\s/g, '');
      })
      .on("mouseover",function(){        

        if (active_link === "0") d3.select(this).style("cursor", "pointer");
        else {
          if (active_link.split("class").pop() === this.id.split("id").pop()) {
            d3.select(this).style("cursor", "pointer");
          } else d3.select(this).style("cursor", "auto");
        }
      })
      .on("click",function(d){        

        if (active_link === "0") { //nothing selected, turn on this selection
          d3.select(this)           
            .style("stroke", "black")
            .style("stroke-width", 2);

            active_link = this.id.split("id").pop();
            plotSingle(this);

            //gray out the others
            for (i = 0; i < legendClassArray.length; i++) {
              if (legendClassArray[i] != active_link) {
                d3.select("#id" + legendClassArray[i])
                  .style("opacity", 0.5);
              }
            }
    
        } else { //deactivate
          if (active_link === this.id.split("id").pop()) {//active square selected; turn it OFF
            d3.select(this)           
              .style("stroke", "none");

            active_link = "0"; //reset

            //restore remaining boxes to normal opacity
            for (i = 0; i < legendClassArray.length; i++) {              
                d3.select("#id" + legendClassArray[i])
                  .style("opacity", 1);
            }

            //restore plot to original
            restorePlot(d);

          }

        } //end active_link check
                          
                                
      });

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

  industry_legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

  function restorePlot(d) {

    state.selectAll("rect").forEach(function (d, i) {      
      //restore shifted bars to original posn
      d3.select(d[idx])
        .transition()
        .duration(1000)        
        .attr("y", y_orig[i]);
    })

    //restore opacity of erased bars
    for (i = 0; i < legendClassArray.length; i++) {
      if (legendClassArray[i] != class_keep) {
        d3.selectAll(".class" + legendClassArray[i])
          .transition()
          .duration(1000)
          .delay(750)
          .style("opacity", 1);
      }
    }

  }

  function plotSingle(d) {
      console.log(d)
        
    class_keep = d.id.split("id").pop();
    idx = legendClassArray.indexOf(class_keep);    
   
    //erase all but selected bars by setting opacity to 0
    for (i = 0; i < legendClassArray.length; i++) {
      if (legendClassArray[i] != class_keep) {
        d3.selectAll(".class" + legendClassArray[i])
          .transition()
          .duration(1000)          
          .style("opacity", 0);
      }
    }

    //lower the bars to start on x-axis
    y_orig = [];
    state.selectAll("rect").forEach(function (d, i) {        
    
      //get height and y posn of base bar and selected bar
      h_keep = d3.select(d[idx]).attr("height");
      y_keep = d3.select(d[idx]).attr("y");
      //store y_base in array to restore plot
      y_orig.push(y_keep);

      h_base = d3.select(d[0]).attr("height");
      y_base = d3.select(d[0]).attr("y");    

      h_shift = h_keep - h_base;
      y_new = y_base - h_shift;

      //reposition selected bars
      d3.select(d[idx])
        .transition()
        .ease("bounce")
        .duration(1000)
        .delay(750)
        .attr("y", y_new);
   
    })    
   
  } 

});
