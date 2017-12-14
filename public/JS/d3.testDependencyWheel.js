d3.chart = d3.chart || {};
// import {takeClass} from 'test.js';
// import {unTakeClass} from 'test.js';

/**
 * Dependency wheel chart for d3.js
 *
 * Usage:
 * var chart = d3.chart.dependencyWheel();
 * d3.select('#chart_placeholder')
 *   .datum({
 *      packageNames: [the name of the packages in the matrix],
 *      matrix: [your dependency matrix]
 *   })
 *   .call(chart);
 *
 * // Data must be a matrix of dependencies. The first item must be the main package.
 * // For instance, if the main package depends on packages A and B, and package A
 * // also depends on package B, you should build the data as follows:
 *
 * var data = {
 *   packageNames: ['Main', 'A', 'B'],
 *   matrix: [[0, 1, 1], // Main depends on A and B
 *            [0, 0, 1], // A depends on B
 *            [0, 0, 0]] // B doesn't depend on A or Main
 * };
 *
 * // You can customize the chart width, margin (used to display package names),
 * // and padding (separating groups in the wheel)
 * var chart = d3.chart.dependencyWheel().width(700).margin(150).padding(.02);
 *
 * @author François Zaninotto
 * @license MIT
 * @see https://github.com/fzaninotto/DependencyWheel for complete source and license
 */
d3.chart.dependencyWheel = function (options) {

  var width = 700;
  var margin = 150;
  var padding = 0.02;

  function chart(selection) {
    selection.each(function (data) {

      var matrix = data.matrix;
      var packageNames = data.packageNames;
      var radius = width / 2 - margin;

      var colorPre = "#21af76";
      var colorPost = "#ffc500";

      var clickFlag = new Array(packageNames.length);
      for (var k = 0; k < clickFlag.length; k++) {
        clickFlag[k] = false;
      }
      console.log("click flags: " + clickFlag);
      // create the layout
      var chord = d3.layout.chord()
        .padding(padding)
        .sortSubgroups(d3.descending);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg:svg")
        // .attr("width", width)
        // .attr("height", width)
        .attr("viewBox", "-330 -330 700 700")
        .attr("class", "dependencyWheel")
        .append("g")
      // .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

      var arc = d3.svg.arc()
        .innerRadius(radius)
        .outerRadius(radius + 20);

      var fill = function (d) {
        if (true) return '#ccc';
        //Billy
        var i = packageNames[d.index].length - 3;
        if (i < 0)
          i = 0;
        //console.log(hsl( + parseInt(((packageNames[d.index][i].charCodeAt() - 48) / 10) * 360, 10) + ,90%,70%));
        //---
        return "hsl(" + parseInt(((packageNames[d.index][i].charCodeAt() - 48) / 10) * 360, 10) + ",90%,70%)";
      };

      /*var fill = function (d, color) {
        if(!color){
          return fill2(d);
        }
        return "#ccc";
      }*/

      var findGroup = function (index) {
        svg.selectAll(".group")
          .filter(function (d) {
            return d.index == index;
          })
      };

      var clickHandler = function () {
        console.log("Entered ch generator");
        var brighten = colorIn(colorPre, colorPost, true);
        var dim = colorIn('#cccccc', '#cccccc', false);
        return function (g, i) {
          dispCourseInfo(i);
          console.log("Entered ch generated function #" + i + " : " + g.index);
          if (!clickFlag[i]) {
            prereqAlert = false;
            takeClass(i);
            clickFlag[i] = true;
            console.log(i + " on");
            brighten(g, i);

          } else {
            postreqAlert = false;
            unTakeClass(i);
            clickFlag[i] = false;
            console.log(i + " off");
            dim(g, i);

          }
        };
        /*return function(g, i) {
          svg.selectAll(".chord")
            .filter(function (d) {
              return d.source.index != i;// && d.source.clickFlag == false; // && d.target.index != i;// && d.source.clickFlag == false; 
            })
            .transition()
            .style("opacity", 0.2);
        };*/
      };

      var checkAvailable = function (g, i) {
        var flag = true;
        if (g.taken) return;
        svg.selectAll('.chord')
          .filter(function (d) {
            if (d.source.index == i && !d.target.taken) {
              console.log("Source: " + packageNames[i] + " Target: " + packageNames[d.target.index] + "Taken: " + d.target.taken)
              flag = false;
            }
            return false;
          });
        if (flag) {
          svg.selectAll('.group')
            .filter(function (d) {
              //for (var i = 0; i < length; i++) {
              if (i == d.index) return true;
              //}
              return false;
            })
            .transition()
            .style("fill", colorPost)
            .style("stroke", d3.rgb(colorPost).darker());
          //.style("color", 'black');
        }
        console.log("Availability of " + i + " = " + flag);
      };

      var reColorIn = function (g, i, colorA, colorB, taken) {
        console.log(i)
        //avoids redundancies and over coloring leading to black
        if (g.taken == taken) return;

        //sets group taken level
        g.taken = taken;
        //clickFlag[i] = taken;

        //recursive calls on prereqs
        var groups = [];
        svg.selectAll(".chord")
          .filter(function (d) {
            if (d.source.index == i && d.source.index != d.target.index) {
              console.log("matched " + d.target.index);
              if (taken) reColorIn(d.target, d.target.index);
              //takeClass(d.target.index);
              groups.push(d.target.index);
            }
            /*if (d.target.index == i) {
              groups.push(d.source.index);
            }*/
          });
        groups.push(i);

        //postreqs
        svg.selectAll(".chord")
          .filter(function (d) {
            if (d.target.index == i && !d.target.taken) {
              //d.target.taken = taken;
              return true;
            }
            return false;
          })
          .transition()
          .style("fill", colorB)
          .style("stroke", d3.rgb(colorB).darker())
        //.style("color", 'black');

        //prereqs
        svg.selectAll(".chord")
          .filter(function (d) {
            return d.source.index == i;// d.target.index == i;
          })
          .transition()
          .style("fill", colorA)
          .style("stroke", d3.rgb(colorA).darker())
        //.style("color", 'black');



        //console.log(groups);

        var length = groups.length;
        svg.selectAll('.group')
          .filter(function (d) {
            for (var i = 0; i < length; i++) {
              //console.log(d.index + " == " + i)
              if (groups[i] == d.index) return true; //false;
            }
            return false; //true;
          })
          .transition()
          .style("fill", colorA)
          .style("stroke", d3.rgb(colorA).darker());
        //.style("color", 'black');
      };

      //changes color of wheel components
      var colorIn = function (colorA, colorB, taken) {
        return function (g, i) {
          console.log(i)
          g.taken = taken;
          //postreqs
          svg.selectAll(".chord")
            .filter(function (d) {
              if (d.target.index == i && !d.target.taken) {
                //d.target.taken = taken;

                return true;
              }
              return false;
            })
            .transition()
            .style("fill", colorB)
            .style("stroke", d3.rgb(colorB).darker());
          //.style("color", 'black');

          //prereqs
          svg.selectAll(".chord")
            .filter(function (d) {
              return d.source.index == i;// d.target.index == i;
            })
            .transition()
            .style("fill", colorA)
            .style("stroke", d3.rgb(colorA).darker())
          //.style("color", 'black');

          var groups = [];
          svg.selectAll(".chord")
            .filter(function (d) {
              if (d.source.index == i) {
                if (d.source.index != d.target.index) {
                  console.log("matched " + d.target.index);
                  reColorIn(d.target, d.target.index, colorPre, colorPost, taken);
                }
              }
            });
          groups.push(i);

          //console.log(groups);

          var length = groups.length;
          svg.selectAll('.group')
            .filter(function (d) {
              for (var i = 0; i < length; i++) {
                //console.log(d.index + " == " + i)
                if (groups[i] == d.index) {
                  //takeClass(d.index);
                  return true; //false;
                }
              }
              return false; //true;
            })
            .transition()
            .style("fill", colorA)
            .style("stroke", d3.rgb(colorA).darker());
          //.style("color", 'black');

          //checkAvailable(g, i);
        };
      };
      var stupidID = 0;
      var setID = function () {
        //stupidID++;
        return stupidID++;
      }

      //opposite of the fade class but same result for click purpose
      var shade = function (opacity) {
        return function (g, i) {
          svg.selectAll(".chord")
            .filter(function (d) {
              return d.source.index == i; // && d.target.index == i;
            })
            .transition()
            .style("opacity", opacity);
          var groups = [];
          svg.selectAll(".chord")
            .filter(function (d) {
              if (d.source.index == i) {
                groups.push(d.target.index);
              }
              /*if (d.target.index == i) {
                groups.push(d.source.index);
              }*/
            });
          groups.push(i);
          var length = groups.length;
          svg.selectAll('.group')
            .filter(function (d) {
              for (var i = 0; i < length; i++) {
                if (groups[i] == d.index) return true; //false;
              }
              return false; //true;
            })
            .transition()
            .style("opacity", opacity);
        };
      };

      // Returns an event handler for fading a given chord group.
      var fade = function (opacity) {
        return function (g, i) {
          svg.selectAll(".chord")
            .filter(function (d) {
              return d.source.index != i; // && d.target.index != i;// && d.source.clickFlag == false; 
            })
            .transition()
            .style("opacity", opacity);
          var groups = [];
          svg.selectAll(".chord")
            .filter(function (d) {
              if (d.source.index == i) {
                groups.push(d.target.index);
              }
              /*if (d.target.index == i) {
                groups.push(d.source.index);
              }*/
            });
          groups.push(i);
          console.log("Groups: \n" + groups);
          var length = groups.length;
          svg.selectAll('.group')
            .filter(function (d) {
              for (var i = 0; i < length; i++) {
                if (groups[i] == d.index) return false;
              }
              return true;
            })
            .transition()
            .style("opacity", opacity);
        };
      };

      chord.matrix(matrix);

      var rootGroup = chord.groups()[0];
      var rotation = - (rootGroup.endAngle - rootGroup.startAngle) / 2 * (180 / Math.PI);

      var g = gEnter.selectAll("g.group")
        .data(chord.groups)
        .enter().append("svg:g")
        .attr("class", "group")
        .style("fill", fill)
        .style("stroke", fill)
        .attr("transform", function (d) {
          return "rotate(" + rotation + ")";
        });

      //outer circle section
      g.append("svg:path")
        .style("fill", "inherit")
        .style("stroke", "inherit")
        .attr("d", arc)
        .attr('id', function (i) {
          return 'courseWheel' + setID();
        })
        .attr('cursor', 'pointer')
        //.attr("onclick", clickHandler());
        //.each(function(){ this.attr("id", "courseWheel" + setID())})

        .on("mouseover", clickHandler())
        .on("mouseout", clickHandler())
        .on("click", clickHandler());
      //.style("opacity", 1) //billy
      //.style("opacity", 0.3); //billy
      //.on("mouseout", fade(1));
      // g.each(function () {
      //   //this wrapped in jQuery will give us the current .letter-q div
      //   $(this).append('id="courseWheel' + setID() + '"');
      // });

      // g.attr('id', function (i) {
      //   return 'courseWheel' + setID();
      // });

      //Text labels
      g.append("svg:text")
        .each(function (d) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .style("color", "black")
        .attr("text-anchor", function (d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function (d) {
          return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
            "translate(" + (radius + 26) + ")" +
            (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function (d) { return packageNames[d.index]; });

      //dependency connection arcs
      gEnter.selectAll("path.chord")
        .data(chord.chords)
        .enter().append("svg:path")
        .attr("class", "chord")
        .style("stroke", function (d) { return d3.rgb(fill(d.source)).darker(); })
        .style("fill", function (d) { return fill(d.source); })

        .attr("d", d3.svg.chord().radius(radius))
        .attr("transform", function (d) {
          return "rotate(" + rotation + ")";
        })
        .style("opacity", 1);
      //.style("opacity", 0.3); //billy


    });
  }

  chart.width = function (value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.margin = function (value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  chart.padding = function (value) {
    if (!arguments.length) return padding;
    padding = value;
    return chart;
  };

  return chart;
};
