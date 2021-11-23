


var height = 900,
    width = 1000,
    projection = d3.geoMercator(),
    map


var path = d3.geoPath().projection(projection);


// -------- Append SVG to map div -------- //
var svg = d3.select("#mapSvg")
    // .append("svg")
    .attr("class", "generalSVG")
    .attr("width", width)
    .attr("height", height)
    .style("position", "absolute")
    .style("top", "0%")
    .style("left", "-12%")


d3.json('/geo-data.json', function (error, data) { // GO A FOLDER UP TO READ GEO JSON DATA <------
    console.log(data);
    if (error) return;

    //-----------Selecting the geometry features from the json OBJ------------------//
    var districts = topojson.feature(data, data.objects.districts); // inside topojson.feature we have to put the element where the "geometries" live. 
    //console.log("districts", districts);



    //-----------------------------SCALE AND TRANSLATE---------------------------//
    var b, s, t;
    projection.scale(1).translate([0, 0]);
    var b = path.bounds(districts); // bounds represent a two dimensional array : [[left, bottom], [right, top]],
    var s = .5 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection.scale(s).translate(t);


    // ----------------- APPENING G ELEMENT AND INJECTING THE DATA -----------------//

    map = svg.append('g')// In this "g" tag we will include the path for the district boundaries.
        .attr('class', 'boundary')
        .attr('id', 'mapSvgGroup')

    nyc = map.selectAll('path').data(districts.features);
    nyc.enter()
        .append('path')
        .attr('d', path)
        .style("stroke", "black")
        .style("fill-opacity", 1)
        .attr("stroke-width", .2)
        .attr("fill", "#A0A0A0")
        .style("opacity", "0.3")




    let processedInputs = []
    for (var i = 0; i < inputsFiltered.length; i++) {

        //console.log(locations[i].location.coordinates)
        //coordsObj.push(locations[i].location.coordinates);

        var divLeftStyle = projection([inputsFiltered[i].location.coordinates[1].toString(), inputsFiltered[i].location.coordinates[0].toString()])[0]
        var divTopStyle = projection([inputsFiltered[i].location.coordinates[1].toString(), inputsFiltered[i].location.coordinates[0].toString()])[1]

        processedInputs.push({

            'imageSrc': inputsFiltered[i].imageSrc,
            'cx': divLeftStyle,
            'cy': divTopStyle,
            'placeDescription': inputsFiltered[i].placeDescription
        })

        //coordsObj.push([divLeftStyle, divTopStyle])
    }

    // console.log(coordsObj);
    // console.log(locations[1].location.coordinates[0]);
    // console.log(locations[1].location.coordinates[1]);

    console.log(processedInputs);


    //display the images:
    /* 
    d3.select("#photoSvg")
        .selectAll("image")
        .data(processedInputs)
        .enter()
        .append("image")
        .attr("xlink:href", function (d) { return d.imageSrc })
        //.attr("xlink:href", processedInputs[1].imageSrc)
        .attr("width", 300)
        .attr("height", 250)
        .attr("x", 0)
        .attr("y", 0)
    */



    // Create hover function that will display the tooltip:
    const hoverPlaceCirle = function (d) {

        const x_ = d.cx;
        const y_ = d.cy;
        const dPath = `M ${x_}, ${y_}
            L ${x_ + 40},${y_ - 40}
            ${x_ + 400},${y_ - 40}`


        map.append("path")// the parent of this path is an svg whose id is 'mapSvg'
            .attr("d", dPath)
            .attr("stroke", "#D35400")
            .attr("stroke-width", "2")
            .style("fill-opacity", 1)
            .attr("fill", "none")
            .attr("class", "pathToPhoto")
        const pathToPhotoCoords = document.getElementsByClassName('pathToPhoto')[0].getBoundingClientRect();

        var photoSvg = d3.select("#photoSvg")
            .style('display', 'inline')
            .style('top', pathToPhotoCoords.y - 125 + 'px')
            .style('left', pathToPhotoCoords.x + pathToPhotoCoords.width + 'px')


        photoSvg.append("svg:image")//image
            .attr("xlink:href", d.imageSrc)
            .attr("width", 300)
            .attr("height", 250)
            //.attr("xlink:href", processedInputs[1].imageSrc)
            .attr("x", 0)
            .attr("y", 0)


        const photoSvgCoords = document.getElementById('photoSvg').getBoundingClientRect();
        var textDiv = d3.select("#placeTextContainer")
            //.attr("width", 300)
            //.attr("height", 250)
            .style('display', 'inline')
            .style('top', photoSvgCoords.y + 'px')
            .style('left', photoSvgCoords.x + photoSvgCoords.width + 20 + 'px')


        d3.select("#placeTextText")
            .selectAll("tspan")
            .data(d.placeDescription)// this is an array of elements 
            .enter()
            .append("tspan")
            .text(function (d) { return d })
            .attr("x", "40")
            //.attr("y", "5")
            .attr("dy", "1.6em");

    }

    //Create a hover out function that will hide the path to the image and the photo and text svg
    const hoverOutPlaceCircle = function () {


        const groupMapSvg = document.getElementById('mapSvgGroup');
        groupMapSvg.removeChild(groupMapSvg.lastChild)//<--- this will remove the path that connects the pace to the photo



        const photoSvg = document.getElementById('photoSvg')
        photoSvg.style.display = 'none';// <--- hides the div that contains the photogaph
        photoSvg.removeChild(photoSvg.firstChild); // <--- this will remove the photogaph from the photo svg



        const placeTextText = document.getElementById('placeTextText')
        const placeTextContainer = document.getElementById('placeTextContainer')
        placeTextContainer.style.display = 'none';

        while (placeTextText.firstChild) {
            placeTextText.removeChild(placeTextText.firstChild)//<--- this will remove the tspan elements under placeTextText
        }

    }





    // display the place cirlces in the map 
    map.selectAll('circle')
        .data(processedInputs)
        .enter()
        .append('circle')
        .attr("cx", function (d) { return d.cx })
        .attr("cy", function (d) { return d.cy })
        .attr("id", "placeCirle")
        .attr("r", 3)
        .attr("fill", "#D35400")
        .on('mouseover', hoverPlaceCirle)
        .on('mouseout', hoverOutPlaceCircle)



    /*
    // create the path for the line that connects the circle in the map with the tooltip
    const x_ = processedInputs[0].cx;
    const y_ = processedInputs[0].cy;
    const d = `M ${x_}, ${y_}
                L ${x_ + 40},${y_ - 40}
                ${x_ + 400},${y_ - 40}`


    // path that will connect the place in the map with the photo
    map.append("path")
        .attr("d", d)
        .attr("stroke", "#D35400")
        .attr("stroke-width", "2")
        .style("fill-opacity", 1)
        .attr("fill", "none")
     */


})