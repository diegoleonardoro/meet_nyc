


function displayMap() {


    const coordinates = { lat: placeCoords[0], lng: placeCoords[1] };

    //SVG dimentions 
    var height = 600,
        width = 680,
        projection = d3.geoMercator(),
        map


    // ------------ Path & Projection ------------ //

    var path = d3.geoPath().projection(projection); // d3.geoPath() is the D3 Geo Path Data Generator helper class for generating SVG 

    // ------------------------------------------- //


    // -------- Append SVG to map div -------- //
    var svg = d3.select("#mapSvg")
        //.append("svg")
        .attr("class", "generalSVG")
        .attr("width", width)
        .attr("height", height)
        //.style("position", "relative")
        //.style("top", "0%")
        //.style("left", "12%")
    // .style("opacity", "0.3")
    // ------------------------------------------- //


    //----------- Coords object ----------- //
    const coordsObj = { lat: placeCoords[0], lng: placeCoords[1] };


    // --------- Reading NYC's boundaries ----------- //

    d3.json('/geo-data.json', function (error, data) { // GO A FOLDER UP TO READ GEO JSON DATA <------
        // console.log(data);
        if (error) return;


        //-----------Selecting the geometry features from the json OBJ------------------//
        var districts = topojson.feature(data, data.objects.districts); // inside topojson.feature we have to put the element where the "geometries" live. 
        //console.log("districts", districts);



        //-----------------------------SCALE AND TRANSLATE---------------------------//
        var b, s, t;
        projection.scale(1).translate([0, 0]);
        var b = path.bounds(districts); // bounds represent a two dimensional array : [[left, bottom], [right, top]],
        var s = .7 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        projection.scale(s).translate(t);


        // ----------------- APPENING G ELEMENT AND INJECTING THE DATA -----------------//

        map = svg.append('g').attr('class', 'boundary'); // In this "g" tag we will include the path for the district boundaries.
        nyc = map.selectAll('path').data(districts.features);
        nyc.enter()
            .append('path')
            .attr('d', path)
            .style("stroke", "black")
            .style("fill-opacity", 1)
            .attr("stroke-width", .2)
            .attr("fill", "#A0A0A0")
            .style("opacity", "0.3")

        console.log(coordsObj);

        var divLeftStyle = projection([coordsObj.lng.toString(), coordsObj.lat.toString()])[0]
        var divTopStyle = projection([coordsObj.lng.toString(), coordsObj.lat.toString()])[1]


        console.log(divLeftStyle);
        console.log(divTopStyle);

        map.append("circle")
            .attr("cx", divLeftStyle)
            .attr("id", "placeCirle")
            .attr("cy", divTopStyle)
            .attr("r", 3)
            .attr("fill", "#D35400")


        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://

        /* 

        // x=divLeftStyle, y=divTopStyle
        // path for the line:
        const d = `M ${divLeftStyle} ${divTopStyle} 
                      C  ${divLeftStyle + 400} ${divTopStyle - 10} ${divLeftStyle + 300} ${divTopStyle - 500}  ${divLeftStyle + 500} ${divTopStyle - 150}`;
        //..............//.....................................//.........................................//...........................................//
        
        //L ${divLeftStyle + 20} ${divTopStyle - 20}
        //                        ${divLeftStyle + 300} ${divTopStyle - 20}
        //                        ${divLeftStyle + 300} ${divTopStyle - 40}
        //                        ${divLeftStyle + 320} ${divTopStyle - 20}
        //                        ${divLeftStyle + 300} ${divTopStyle}
        //                        ${divLeftStyle + 300} ${divTopStyle - 20}
        

        //path for arrow:
        const arrow1_d_attr = `M ${divLeftStyle}, ${divTopStyle}
                        L ${divLeftStyle - 8}, ${divTopStyle - 20}
                        Q ${divLeftStyle}, ${418} ${divLeftStyle + 8}, ${divTopStyle - 20} Z`

        //path for arrow:
        const newDivTopStyle = divTopStyle - 5;
        const arrow2_d_attr = `M ${divLeftStyle}, ${newDivTopStyle}
                    L ${divLeftStyle - 8}, ${newDivTopStyle - 20}
                    Q ${divLeftStyle}, ${412} ${divLeftStyle + 8}, ${newDivTopStyle - 20} Z`

        //path for arrow:
        const newDivTopStyle3 = divTopStyle - 10;
        const arrow3_d_attr = `M ${divLeftStyle}, ${newDivTopStyle3}
                                L ${divLeftStyle - 8}, ${newDivTopStyle3 - 20}
                                Q ${divLeftStyle}, ${406} ${divLeftStyle + 8}, ${newDivTopStyle3 - 20} Z`



        //append arrow 3
        map.append("path")
            .attr("d", arrow1_d_attr)
            //.attr("stroke", "#D35400")
            //.attr("stroke-width", "2")
            .style("fill-opacity", 0.8)
            .attr("fill", "#D35400")
            .attr('class', 'placeArrows');


        //append arrow 1
        map.append("path")
            .attr("d", arrow2_d_attr)
            //.attr("stroke", "#D35400")
            //.attr("stroke-width", "2")
            .style("fill-opacity", 0.6)
            .attr("fill", "#D35400")
            .attr('class', 'placeArrows');

        //append arrow 1
        map.append("path")
            .attr("d", arrow3_d_attr)
            //.attr("stroke", "#D35400")
            //.attr("stroke-width", "2")
            .style("fill-opacity", 0)
            .attr("fill", "#D35400")
            .attr('class', 'placeArrows');
        */


        
        ////////////////////////////////

        // Function for arrows:
        let newOpacity = ['0', '0.8', '0.6']

        const arrowFunction = function () {
            const arrows = document.getElementsByClassName('placeArrows');
            //opacity order printed: 0.8, 0.6, 0

            for (let i = 0; i < arrows.length; i++) {
                setTimeout(function () {
                    console.log('loro');
                    arrows[i].style.opacity = newOpacity[i];// 1. ['0.1', '0.1', '1', '0.6'];
                }, 1000 * i);

                if (i === newOpacity.length - 1) {
                    lastElement = newOpacity.pop();
                    newOpacity = [lastElement].concat(newOpacity);

                }
            }
        }

        ////////////////////////////////
        function arrowAnimatiom() {
            t = setInterval(arrowFunction, 300);
        }

        function stopArrowAnimation() {
            clearInterval(t);
        }


        var hover_ = function (d) {
            arrowAnimatiom();
        };

        var hoverOut_ = function (d) {

            array = ['0', '0', '0.6', '0.6'];


            const arrows = document.getElementsByClassName('placeArrows');


            for (let i = 0; i < arrows.length; i++) {
                setTimeout(function () {
                    arrows[i].style.opacity = array[i];
                }, 1000 * i);
            }

            stopArrowAnimation();


        }

        ////////////////////////////


        // append the line

        /* 
        map.append("path")
            .attr("d", d)
            .attr("stroke", "#707B7C")
            .attr("stroke-width", "2")
            .style("fill-opacity", 1)
            .attr("fill", "none")
        */

        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://    
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://

        // Paste the text to the text svg:
        //(d3 works perfect to append elements to svg elements)

        console.log(placeDescription);

        
        d3.select("#placeTextText")
            .selectAll("tspan")
            .data(placeDescription)// this is an array of elements 
            .enter()
            .append("tspan")
            .text(function (d) { return d })
            .attr("x", "40")
            //.attr("y", "5")
            .attr("dy", "1.6em");
            


        // Paste the photo to the image svg 
        d3.select("#photoSvg")
            .append("svg:image")
            .attr("xlink:href", imgSrc)
            .attr("width", 300)
            .attr("height", 250)
            .attr("x", 0)
            .attr("y", 0)
            .on("mouseover", hover_)
            .on('mouseout', hoverOut_);

        //--------------------------------------------------------------------------------------------------------------------------//


        //CREATE BAR GRAPH
        // I added an empty space to 'Extremely dissatisfied ' and lower cased the first letter of 'neutral, beucause that is how they come from the server 

        //x values:
        let satisfactScaleValues = Object.keys(neighborhoodSatisfactValue);
        satisfactScaleValues = satisfactScaleValues.map(x => x.replace('nghbrhdSatisfaction', ''))
        let satisfactScaleKeyValues = []// <----------------------------------------------------------- "Public Transport", "Public Transport",  "Neighbors",
        for (var i = 0; i < satisfactScaleValues.length; i++) {
            let flag = true;
            let word = ''
            for (var u = 0; u < satisfactScaleValues[i].length; u++) {
                if (!flag && satisfactScaleValues[i][u] === satisfactScaleValues[i][u].toUpperCase()) {
                    word = word + ' '
                }
                if (satisfactScaleValues[i][u] === satisfactScaleValues[i][u].toUpperCase()) {
                    flag = false;
                }
                word = word + satisfactScaleValues[i][u];
            }
            satisfactScaleKeyValues.push(word);
        }

        let chartData_ = [];
        for (var i = 0; i < satisfactScaleKeyValues.length; i++) {
            chartData_.push({
                'scaleKeys': satisfactScaleKeyValues[i], 'scaleValues': Object.values(neighborhoodSatisfactValue)[i],
                'valuesExplanations': neighborhoodSatisfactification[i]
            })
        }
        
        // scaleKeys : public transportation... // scaleValuesv: neutral... // 

        const graphYvalues = ['Extremely dissatisfied ', 'Somewhat dissatisfied', 'neutral', 'Somewhat satisfied', 'Extremely satisfied']
        //console.log(chartData_);

        console.log(chartData_)


        //--------------------------------------------------------------------------------------------------------------------------//
        //--------------------------------------------------------------------------------------------------------------------------//
        //--------------------------------------------------------------------------------------------------------------------------//

        var margin_ = { top: 20, right: 20, bottom: 30, left: 120 },
            width_ = 629 - margin_.left - margin_.right,
            height_ = 320 - margin_.top - margin_.bottom;


        // set the ranges
        var x = d3.scaleBand()
            .range([0, width_])
            .padding(0.2);
        // .paddingOuter(0.9)
        // .paddingInner(0.9)
        // .round(false) 


        var y = d3.scalePoint()
            .range([height_, 0])
            .padding(0.9);


        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg_ = d3.select("#graphSvg")//.append("svg")
            .attr("width", width_ + margin_.left + margin_.right +20)
            .attr("height", height_ + margin_.top + margin_.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin_.left + "," + margin_.top + ")")




        // Scale the range of the data in the domains
        x.domain(satisfactScaleKeyValues);
        //x.domain(datas.map(function (d) { return d.salesperson; }));


        y.domain(graphYvalues);
        //y.domain([0, d3.max(datas, function (d) { return d.sales; })]);


        var setBarColor = function (value) {
            //console.log(value);
            if (value === 'Extremely satisfied') {
                return '#196F3D'
            } else if (value === 'Somewhat satisfied') {
                return '#1E8449'
            } else if (value === 'neutral') {
                return '#AF601A'
            } else if (value === 'Somewhat dissatisfied') {
                return '#A93226'
            } else if (value === 'Extremely dissatisfied ') {
                return '#7B241C'
            }
        }



        //.............................................................................//


        var hover = function (d) {

            var barElementCoords = document.getElementById(d.scaleKeys).getBoundingClientRect();;
            var div = document.getElementById('tooltip');
            div.style.left = barElementCoords.x + 'px';
            div.style.top = barElementCoords.y - 45 + 'px';
            div.innerHTML = d.valuesExplanations;
            div.style.width = d.valuesExplanations.length + 80 + 'px'

        };


        var hoverOut = function (d) {

            var div = document.getElementById('tooltip');
            div.style.top = -150 + 'px';
            div.style.left = -150 + 'px';

        }



        //.............................................................................//


        // append the rectangles for the bar chart
        svg_.selectAll(".bar")
            .data(chartData_)
            .enter().append("rect")
            .attr("class", "bar__")
            .attr("id", function (d) { return d.scaleKeys })
            .attr("x", function (d) { return x(d.scaleKeys); })
            .attr("width", x.bandwidth())
            .attr("y", function (d) { return y(d.scaleValues); })
            .attr("height", function (d) { return height_ - y(d.scaleValues); })
            .style('fill', function (d) { return setBarColor(d.scaleValues) })
            .on("mouseover", hover)
            .on('mouseout', hoverOut)




        //--------------------------------------------------------------------------------------------------------------------------//
        //--------------------------------------------------------------------------------------------------------------------------//
        //--------------------------------------------------------------------------------------------------------------------------//


        // add the x Axis
        svg_.append("g")
            .attr("transform", "translate(0," + height_ + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg_.append("g")
            .call(d3.axisLeft(y))
        //--------------------------------------------------------------------------------------------------------------------------//
        //--------------------------------------------------------------------------------------------------------------------------//
        //--------------------------------------------------------------------------------------------------------------------------//

        /* 
        var graphSvg = d3.select('#graphSvg')
        ///var graphSvgWidth = graphSvg.attr('width');
        //var graphSvgHeight = graphSvg.attr('height');
        var margins = { top: 20, right: 30, bottom: 30, left: 40 }
        var margin = 200;
        var graphSvgWidth = graphSvg.attr('width') - margin;
        // console.log(graphSvgWidth)
        var graphSvgHeight = graphSvg.attr('height') - margin;
 
        //y values:
        const graphYvalues = ['Extremely dissatisfied ', 'Somewhat dissatisfied', 'neutral', 'Somewhat satisfied', 'Extremely satisfied']
 
        // 1. Scale
        var y = d3.scaleBand()
            .domain(graphYvalues)
            .range([graphSvgHeight, 0])
        // 180 , 0
        var x = d3.scaleBand()
            .domain(satisfactScaleKeyValues)
            .range([0, graphSvgWidth])
            .padding([0.8])
 
        // 2. Axes:
        var xAxis = d3.axisBottom(x)
            .tickSize(-graphSvgHeight)
            .tickPadding(5)
            .tickSizeOuter(5)
 
        var yAxis = d3.axisLeft(y)
            .tickSize(-graphSvgWidth)
            .tickPadding(5)
            .tickSizeOuter(5)
 
        //.tickSizeOuter(0).tickSize(-600);
 
        // 3. Append g element to the svg
        var g = graphSvg.append("g")
            .attr("transform", "translate(" + 120 + "," + 100 + ")");
 
        // 4. Call both axes functions under the g element just creates 
        var xAxis_g = g.append("g") ///>>>>>> this g element represents the xAxis
            .attr('class', 'x-axis')
            .attr("transform", "translate(0," + graphSvgHeight + ")")
            .call(xAxis);
 
        // xAxis_g.append('text').attr('class', 'label').text('Satisfaction Variables')
        //     .attr('transform', `translate (${ [(10), (0)] })`)
 
        //d3.select('.x-axis .domain')
        //    .attr('transform', `translate(0, ${ 10})`)
 
        var yAxis_g = g.append("g")
            .attr('class', 'y-axis')
            .call(yAxis)///>>>>>> this g element represents the yAxis
 
 
        g.selectAll(".bar")
            .data(chartData_)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return x(d.scaleKeys); })
            .attr("y", function (d) { return y(d.scaleValues); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return graphSvgHeight - y(d.scaleValues); })
 
        */





    });

}

displayMap();