function createCanvas(body){

  body_width = parseInt(body.style("width"));
  body_height = parseInt(body.style("height"));

  parent_div = body.append("div").styles({ width: body_width, height: body_height });
  parent_svg = parent_div.append("svg").attrs({ width: body_width, height: body_height });

  /*************************** Heading ***************************/

  tasks_list = [];
  tasks_list[0] = "Create and add two vectors. Long press at the centre to change to parallelogram law.";

  number_of_screens = tasks_list.length;

  currentScreen_count = 0; screens_list = [];

  for(i = 0; i < number_of_screens; i++){
    screens_list[i] = {};
    screens_list[i].canvas = parent_svg.append("svg").attrs({ width: body_width, height: body_height });
    screens_list[i].canvas.append("rect").attrs({ width: body_width, height: body_height }).styles({ "fill": "none" });
    screens_list[i].vector_list = [];
    screens_list[i].task = tasks_list[i];
    screens_list[i].parent_svg = parent_svg;
  }

  title = parent_svg.append("text").styles({"font-size": 2*screen_size}).attrs({x: 0.5*body_width, y: 4*screen_size}).text("Addition of Vectors - Parallelogram law");

  /*************************** Help ***************************/

  temp_pos = { x: 0.92*innerWidth, y: 9*screen_size };
  parent_svg.append("text")
    .styles({ "font-family": "FontAwesome", "font-size": 5*screen_dpi, "dominant-baseline": "central", "text-anchor": "middle", "fill": "#707070" })
    .attrs({ "x": temp_pos.x - screen_dpi, y: temp_pos.y + 8*screen_dpi })
    .html("\uf29c")
    .on("click", function(){ help_slideshow(); })

  function help_slideshow(){
    swal.setDefaults({ confirmButtonText: 'Next &rarr;', showCancelButton: true })
    var steps = [
      { imageUrl: '../../Images/vector_add_parallelogram.gif', imageWidth: '100%',
        html: '<span class="help_heading">Parallelogram law</span> <br> <span class="help_body">Long press the centre to switch between triangle law and parallelogram law.</span>',
        confirmButtonText: 'Done'
      },
    ]

    swal.queue(steps).then((result) => {
      swal.resetDefaults()
    })
  }

  /*************************** Footer ***************************/

  var temp_text = parent_svg.append("text")
                          .attrs({ x: 0.5*innerWidth, y: 0.97*innerHeight })
                          .styles({ "font-size": 1.8*screen_dpi });

  temp_text.append("tspan")
    .styles({ "color": "gray" })
    .text("- designed by")

  temp_text.append("tspan")
    .styles({ "fill": "steelblue", "font-size": 1.8*screen_dpi, "cursor": "hand", "font-weight": "normal", "font-family": "sans-serif" })
    .text(" Learning Sciences Research Group")
    .on("click", function(){
      window.open("http://lsr.hbcse.tifr.res.in/", "_default");
    })

  /*************************** Heading ***************************/

  next_g = parent_svg.append("g");
  next_g.append("circle").attrs({cx: body_width-10*screen_size, cy: 4*screen_size, r: 2.5*screen_size}).styles({"stroke-width": 0.2*screen_size, "fill": "white", "stroke": "gray"});

  temp_path = [ [-0.5*screen_size, -1*screen_size], [0.5*screen_size, 0], [-0.5*screen_size, 1*screen_size] ];
  next_g.append("g").attrs({ "transform": "translate(" +(body_width-10*screen_size)+ "," +(4*screen_size)+ ")" })
        .append("path").attrs({ d: line_gen(temp_path) }).styles({ "fill": "none", "stroke": "gray", "stroke-width": 0.3*screen_size })

  next_g.on("click", function(){
    if(currentScreen_count < number_of_screens-1){
      // screens_list[currentScreen_count].vector_list = vector_list;
      currentScreen_count++;
      updateScreen();
    }
  })

  /*************************** Heading ***************************/

  back_g = parent_svg.append("g");
  back_g.append("circle").attrs({cx: 10*screen_size, cy: 4*screen_size, r: 2.5*screen_size}).styles({"stroke-width": 0.2*screen_size, "fill": "white", "stroke": "gray"});

  temp_path = [ [0.5*screen_size, -1*screen_size], [-0.5*screen_size, 0], [0.5*screen_size, 1*screen_size] ];
  back_g.append("g").attrs({ "transform": "translate(" +(10*screen_size)+ "," +(4*screen_size)+ ")" })
        .append("path").attrs({ d: line_gen(temp_path) }).styles({ "fill": "none", "stroke": "gray", "stroke-width": 0.3*screen_size })

  back_g.on("click", function(){
    if(currentScreen_count > 0){
      // screens_list[currentScreen_count].vector_list = vector_list;
      currentScreen_count--;
      updateScreen();
    }
  })

  /*************************** Heading ***************************/

  task_div = parent_div.append("div")
    .styles({ "position": "absolute", "top": 7*screen_size, "left": 3*screen_size, "width": body_width-10*screen_size, heigth: 15*screen_size, "text-align": "center", "background": "#e1e1e1",
            "padding-top": 1*screen_size, "padding-bottom": 1*screen_size, "padding-left": 2*screen_size, "padding-right": 2*screen_size, "border-radius": (1.5*screen_size)+"px" });
  task_div.append("text").styles({ "font-size": 2*screen_size, "color": "#000" });

  appendmarker(0); appendmarker(1);
  createScreens();
  updateScreen();
}

/****************************************************************************/

function updateScreen(){
  if(currentScreen_count == number_of_screens-1){ next_g.styles({ "display": "none" }); } else { next_g.styles({ "display": null }); }
  if(currentScreen_count == 0){ back_g.styles({ "display": "none" }); } else { back_g.styles({ "display": null }); }

  // vector_list = screens_list[currentScreen_count].vector_list;

  for(i in screens_list){ screens_list[i].canvas.styles({ "display": "none" }); }
  screens_list[currentScreen_count].canvas.styles({ "display": null });

  task_div.select("text").text(screens_list[currentScreen_count].task);
}

/****************************************************************************/

function appendmarker(vectorID){

  parent_svg.append("marker").attrs({ id: "arrow_"+vectorID, viewBox: "0 0 10 10", refX: 9.3, refY: 5, markerWidth: 4, markerHeight: 4, orient: "auto" })
    .append("path").attrs({ id: "arrow-path", d: "M 0 0 L 10 5 L 0 10 z" }).styles({ "stroke": color(vectorID), "fill": color(vectorID) });

  parent_svg.append("marker").attrs({ id: "arrow_component_"+vectorID, viewBox: "0 0 10 10", refX: 9.3, refY: 5, markerWidth: 3, markerHeight: 3, orient: "auto" })
    .append("path").attrs({ id: "arrow-path", d: "M 0 0 L 10 5 L 0 10 z" }).styles({ "stroke": color(vectorID), "fill": color(vectorID) });

  parent_svg.append("marker").attrs({ id: "arrow_gray_"+vectorID, viewBox: "0 0 10 10", refX: 9.3, refY: 5, markerWidth: 4, markerHeight: 4, orient: "auto" })
    .append("path").attrs({ id: "arrow-path", d: "M 0 0 L 10 5 L 0 10 z" }).styles({ "stroke": "gray", "fill": "gray" });

}
