import React, { useEffect, useState, useCallback, useRef } from "react";
import './Svg.css';

import { select, selectAll } from 'd3-selection';
import {axisLeft } from 'd3-axis';
import { scalePoint, scaleLinear } from 'd3-scale';
import {} from 'd3-path';
import {line} from 'd3-shape';
import {extent} from 'd3-array';
import {drag} from 'd3-drag';
import {brush, brushX, brushY, brushSelection} from 'd3-brush';

import { ObjectiveData } from "../types/ProblemTypes";
import { RectDimensions } from "../types/ComponentTypes";


const data = [
  {name: "kat", mpg: "6", x: "22", y: "11"},
  {name: "kit", mpg: "9", x: "33", y: "22"},
  {name: "kit", mpg: "19", x: "33", y: "22"},
  {name: "kit", mpg: "8", x: "53", y: "32"},
  {name: "kit", mpg: "6", x: "23", y: "52"},
  {name: "kit", mpg: "7", x: "13", y: "11"},
  {name: "kit", mpg: "9", x: "34", y: "22"},
  {name: "kit", mpg: "3", x: "36", y: "23"},
  {name: "kit", mpg: "8", x: "23", y: "23"},
  {name: "kit", mpg: "13", x: "43", y: "22"},
  {name: "kit", mpg: "15", x: "39", y: "32"},
  {name: "kit", mpg: "16", x: "13", y: "15"},
  {name: "kit", mpg: "18", x: "33", y: "12"},
  {name: "kit", mpg: "10", x: "33", y: "22"},
  {name: "kkotit", mpg: "12", x: "44", y: "23" }
] 


interface ParallelAxesProps {
  objectiveData: ObjectiveData;
  oldAlternative?: ObjectiveData; // old alternative solution
  dimensionsMaybe?: RectDimensions;
  selectedIndices: number[];
  handleSelection: (x: number[]) => void;
}

const defaultDimensions = {
  chartHeight: 600,
  chartWidth: 1000,
  marginLeft: 50,
  marginRight: 50,
  marginTop: 30,
  marginBottom: 30,
};


const ManySolutionsPA = ({
  objectiveData,
  oldAlternative,
  dimensionsMaybe,
  selectedIndices,
  handleSelection,
}:ParallelAxesProps) => {

  const ref = useRef(null);
  const [selection, setSelection] = useState<null | Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  >>(null);
  const [dimensions] = useState(
    dimensionsMaybe ? dimensionsMaybe : defaultDimensions
  );
  const [data, SetData] = useState(objectiveData); // if changes, the whole graph is re-rendered


  useEffect(() => {
    SetData(objectiveData);
  }, [objectiveData]);



const svgWidth = 960,
    svgHeight = 560,
    margin = { top: 30, right: 30, bottom: 30, left: 30 },
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

let x: any;
let y:any = {}
let dimensions:any;
let dragging:any;
let background:any;
let foreground:any;

var svg = select("body").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const func = (data:any) => {
        console.log("start of funct",data)

        //console.log(data.filter("6"))

        // Extract the list of dimensions as keys and create a y scale for each.
        let dimensions = Object.keys(data[0]).filter(function (key:any) {
            if (key !== "name") {
                console.log("key", key)
                y[key] = scaleLinear()
                    // @ts-ignore
                    .domain(extent(data, function (d:any) { 
                      return Number(d[key]); 
                    }))
                    .range([height, 0]);
                return key;
            }
            else {return "" }
        });
      
        console.log("dims",dimensions);
        // Creata a x scale for each dimension
        x = scalePoint()
            .domain(dimensions)
            .range([0, width]);

        // Add grey background lines for context.
        background = svg.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(data)
            .enter().append("path")
            .attr("d", pathline);

        // Add blue foreground lines for focus.
        foreground = svg.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(data)
            .enter().append("path")
            .attr("d", pathline);

        // Add a group element for each dimension.
        // TODO: fix dragging 
        let g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
            .call(drag())
                .on("start", function (d) {
                    console.log("k",d)
                    dragging[d] = x(d);
                    background.attr("visibility", "hidden");
                })
                .on("drag", function (event, d:any) {
                    console.log(d)
                    dragging[d] = Math.min(width, Math.max(0, event.x));
                    foreground.attr("d", pathline);
                    dimensions.sort(function (a:any, b:any) { return position(a) - position(b); });
                    x.domain(dimensions);
                    g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
                })
                .on("end", function (d) {
                    delete dragging[d];
                    transition(select(this)).attr("transform", "translate(" + x(d) + ")");
                    transition(foreground).attr("d",pathline);
                    background
                        .attr("d", pathline)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                });



        // Add an axis and title.
        g.append("g")
            .attr("class", "axis")
            .each(function (d:any) { select(this).call(axisLeft(y[d])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-size", "12")
            .attr("y", -9)
            .text(function (d:any) { return d; });

        // Add and store a brush for each axis.
        g.append("g")
            .attr("class", "brush")
            .each(function (d:any) {
                select(this).call(y[d].brush = brushY()
                    .extent([[-10, 0], [10, height]])
                    .on("start", brushstart)
                    .on("brush", brush)
                    .on("end", brush));
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    };

function position(d:any) {
    var v = dragging[d];
    return v == null ? x(d) : v;
}

function transition(g:any) {
    return g.transition().duration(500);
}

// Take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
const pathline = (d:any) => {
    let path =  line()(dimensions.map(function (key:any) { return [x(key), y[key](d[key])]; }));
    //let path = line()([[10,60],[30,89]])
    return path 
}

function brushstart(event:any) {
    event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
    // Get a set of dimensions with active brushes and their current extent.
    let actives: any[] = [];
    
    // TODO: make types correct, get rid of ts-ignore's

    svg.selectAll(".brush")
          // @ts-ignore
        .filter(function (d){ 
            //console.log(brushSelection(this));
          // @ts-ignore
            return brushSelection(this);
        })
        .each(function (key) {
            actives.push({
                dimension: key,
          // @ts-ignore
                extent: brushSelection(this)
            });
        });
    // Change line visibility based on brush extent.
    if (actives.length === 0) {
        foreground.style("display", null);
    } else {
        foreground.style("display", function (d:any) {
            return actives.every(function (brushObj) {
                return brushObj.extent[0] <= y[brushObj.dimension](d[brushObj.dimension]) && y[brushObj.dimension](d[brushObj.dimension]) <= brushObj.extent[1];
            }) ? null : "none";
        });
    }
}

// get from url with d3 fetch
//const data = csv('https://gist.githubusercontent.com/noamross/e5d3e859aa0c794be10b/raw/b999fb4425b54c63cab088c0ce2c0d6ce961a563/cars.csv')
//console.log(data)

// call func
func(data);

  return <div ref={ref} id="container" className="svg-container"></div>;

}

export default ManySolutionsPA;
