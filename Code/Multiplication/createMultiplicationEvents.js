var create_Multiplication_Events = function(){
  this.create_Vector_1_Events = create_Vector_1_Events;
  this.create_Vector_1_Events();
  this.create_Vector_2_Events = create_Vector_2_Events;
  this.create_Vector_2_Events();
  this.create_Resultant_Events = create_Resultant_Events;
  this.create_Resultant_Events();
}

/*************************** Update Multiplied Vectors ***************************/

var update_Multiplied_vectors = function() {
  this.vector_1.update();
  this.vector_2.update();
  this.resultant.update();
};

/*************************** Create Resultant Events ***************************/

var create_Resultant_Events = function(){
  var resultant = this.resultant;
  var object = this;

  /*************************** Long Press on Centre Events ***************************/
  object.dispatch = d3.dispatch("long_press");
  object.dispatch.on("long_press", function(){
    if(object.manipulationMode == true && object.componentized == false && resultant.change_mode_allowed == true){
      object.toggle_multiplication_mode();
    }
    if(object.manipulationMode == false){
      object.done_multiplication_button.shown = true;
      object.done_multiplication_button.image
        .attrs({ x: resultant.cx, y: resultant.cy, width: 0, height: 0 })
        .transition().duration(1000)
        .attrs({
          x: resultant.cx + object.done_multiplication_button.posX - 0.5 * object.done_multiplication_button.size,
          y: resultant.cy + object.done_multiplication_button.posY - 0.5 * object.done_multiplication_button.size,
          width: object.done_multiplication_button.size,
          height: object.done_multiplication_button.size
        });
    }
    // Trigger grey circle for multiplication on first vector
    if (object.vector_1.multiplication_possible && object.vector_1.multiplication_data.partner) {
      object.vector_1.createMultiplicationGreyCircle();
    }
  });

  /*************************** Centre control circle Events ***************************/
  resultant.centre_control_circle_1.on("touchstart", function(){
    d3.select(this).styles({ "fill-opacity": 0.3 });
    object.timer = setTimeout(function(){ object.dispatch.call("long_press", this, {}); }, 600);
    if(object.manipulationMode == true && object.componentized == true){
      resultant.recombine_vector_circle = resultant.parent.canvas.append("circle")
        .styles({ "fill": resultant.gray_color, "fill-opacity": 0.2 })
        .attrs({ cx: resultant.xComponent_coordinate, cy: resultant.yComponent_coordinate, r: resultant.control_circle_radius })
        .on("touchstart", function(){ clearTimeout(object.timer); object.recombine_multiplied_vector(); });
    }
  });

  resultant.centre_control_circle_1.on("touchend", function(){
    d3.select(this).styles({ "fill-opacity": 0 });
    clearTimeout(object.timer);
    if(resultant.recombine_vector_circle){ resultant.recombine_vector_circle.remove(); }

    var button = object.done_multiplication_button;
    if(button.active == false){
      button.shown = false;
      button.image
        .transition().duration(1000)
        .attrs({ width: 0, height: 0, x: resultant.cx, y: resultant.cy });
    } else {
      object.done_multiplication();
    }
  });

  resultant.centre_control_circle_1.on("touchmove", function(){
    var button = object.done_multiplication_button;
    if(button.shown == true){
      var temp_dist = distpoints(d3.event.targetTouches[0].pageX, d3.event.targetTouches[0].pageY, resultant.cx + button.posX, resultant.cy + button.posY);
      if(temp_dist < 0.5 * button.size){ button.active = true; } else { button.active = false; }
      if(button.active == true){
        button.image.attrs({
          x: resultant.cx + button.posX - 0.5 * button.size_big,
          y: resultant.cy + button.posY - 0.5 * button.size_big,
          width: button.size_big,
          height: button.size_big
        });
      } else {
        button.image.attrs({
          x: resultant.cx + button.posX - 0.5 * button.size,
          y: resultant.cy + button.posY - 0.5 * button.size,
          width: button.size,
          height: button.size
        });
      }
    }
  });

  resultant.centre_control_circle_1.on("click", function(){
    object.manipulationMode = !object.manipulationMode;
    if(object.manipulationMode == true){
      object.resultant.movement_circle.styles({ "display": "none" });
      object.resultant.circle.styles({ "fill-opacity": 0.1 });
      object.resultant.radius_control_circle.styles({ "display": null });
      object.resultant.angle_control_line.styles({ "display": null });
    } else {
      object.resultant.movement_circle.styles({ "display": null });
      object.resultant.circle.styles({ "fill-opacity": 0 });
      object.resultant.radius_control_circle.styles({ "display": "none" });
      object.resultant.angle_control_line.styles({ "display": "none" });
    }
  });

  /*************************** Movement circle Events ***************************/
  var drag_movement_circle = d3.drag();
  resultant.movement_circle.call(drag_movement_circle);

  drag_movement_circle.on("start", function(d){
    if(d3.event.sourceEvent.type == "touchstart"){
      d.temp_pos = {};
      d.temp_pos.x = d3.event.sourceEvent.targetTouches[0].pageX;
      d.temp_pos.y = d3.event.sourceEvent.targetTouches[0].pageY;
      d.temp_pos.cx = d.cx;
      d.temp_pos.cy = d.cy;
    }
  });

  drag_movement_circle.on("drag", function(d){
    if(d3.event.sourceEvent.type == "touchmove"){
      d.cx = d.temp_pos.cx + (d3.event.sourceEvent.targetTouches[0].pageX - d.temp_pos.x);
      d.cy = d.temp_pos.cy + (d3.event.sourceEvent.targetTouches[0].pageY - d.temp_pos.y);
      object.vector_1.cx = d.cx;
      object.vector_1.cy = d.cy;
      object.update_Multiplied_vectors();
    }
  });

  /*************************** Radius control circle Events ***************************/
  var radius_control_circle_drag = d3.drag();
  resultant.radius_control_circle.call(radius_control_circle_drag);

  radius_control_circle_drag.on("start", function(d){
    if(d3.event.sourceEvent.type == "touchstart"){
      d3.select(this).attr("class", "visible");
      d.temp_pos = {};
      d.temp_pos.dist = distpoints(0,0, d3.event.x, d3.event.y);
      d.temp_pos.r = d.r;
    }
  });

  radius_control_circle_drag.on("drag", function(d){
    if(d3.event.sourceEvent.type == "touchmove"){
      var temp_dist = distpoints(0,0, d3.event.x, d3.event.y);
      var temp_r = d.temp_pos.r + (temp_dist - d.temp_pos.dist);
      if(!isNaN(temp_r) && temp_r >= 0){ d.r = temp_r; }
      object.update_Multiplied_vectors();
    }
  });

  radius_control_circle_drag.on("end", function(d){
    d3.select(this).attr("class", "invisible");
  });

  /*************************** Angle control line Events ***************************/
  var angle_control_line_drag = d3.drag();
  resultant.angle_control_line.call(angle_control_line_drag);

  angle_control_line_drag.on("start", function(d){
    if(d3.event.sourceEvent.type == "touchstart"){
      d3.select(this).attr("class", "visible");
    }
  });

  angle_control_line_drag.on("drag", function(d){
    if(d3.event.sourceEvent.type == "touchmove"){
      var temp_angle_rad = Math.atan2(-d3.event.y, d3.event.x);
      if(!isNaN(temp_angle_rad)){ d.angle_rad = temp_angle_rad; }
      object.update_Multiplied_vectors();
    }
  });

  angle_control_line_drag.on("end", function(d){
    d3.select(this).attr("class", "invisible");
  });
}

/*************************** Create Vector 1 Events ***************************/

var create_Vector_1_Events = function(){
  var vector_1 = this.vector_1;
  vector_1.angle_control_line.styles({ "display": null });
  vector_1.radius_control_circle.styles({ "display": null });

  var object = this;

  /*************************** Angle control line Events ***************************/
  var angle_control_line_drag = d3.drag();
  vector_1.angle_control_line.call(angle_control_line_drag);

  angle_control_line_drag.on("start", function(d){
    if(d3.event.sourceEvent.type == "touchstart"){
      d3.select(this).attr("class", "visible");
    }
  });

  angle_control_line_drag.on("drag", function(d){
    if(d3.event.sourceEvent.type == "touchmove"){
      var temp_angle_rad = Math.atan2(-d3.event.y, d3.event.x);
      if(!isNaN(temp_angle_rad)){ d.angle_rad = temp_angle_rad; }
      object.update_Multiplied_vectors();
    }
  });

  angle_control_line_drag.on("end", function(d){
    d3.select(this).attr("class", "invisible");
  });

  /*************************** Radius control circle Events ***************************/
  var radius_control_circle_drag = d3.drag();
  vector_1.radius_control_circle.call(radius_control_circle_drag);

  radius_control_circle_drag.on("start", function(d){
    if(d3.event.sourceEvent.type == "touchstart"){
      d3.select(this).attr("class", "visible");
      d.temp_pos = {};
      d.temp_pos.dist = distpoints(0,0, d3.event.x, d3.event.y);
      d.temp_pos.r = d.r;
    }
  });

  radius_control_circle_drag.on("drag", function(d){
    if(d3.event.sourceEvent.type == "touchmove"){
      var temp_dist = distpoints(0,0, d3.event.x, d3.event.y);
      var temp_r = d.temp_pos.r + (temp_dist - d.temp_pos.dist);
      if(!isNaN(temp_r) && temp_r >= 0){ d.r = temp_r; }
      object.update_Multiplied_vectors();
    }
  });

  radius_control_circle_drag.on("end", function(d){
    d3.select(this).attr("class", "invisible");
  });
}

/*************************** Create Vector 2 Events ***************************/

var create_Vector_2_Events = function(){
  var vector_2 = this.vector_2;
  vector_2.angle_control_line.styles({ "display": null });
  vector_2.radius_control_circle.styles({ "display": null });

  var object = this;

  /*************************** Angle control line Events ***************************/
  var angle_control_line_drag = d3.drag();
  vector_2.angle_control_line.call(angle_control_line_drag);

  angle_control_line_drag.on("start", function(d){
    if(d3.event.sourceEvent.type == "touchstart"){
      d3.select(this).attr("class", "visible");
    }
  });

  angle_control_line_drag.on("drag", function(d){
    if(d3.event.sourceEvent.type == "touchmove"){
      var temp_angle_rad = Math.atan2(-d3.event.y, d3.event.x);
      if(!isNaN(temp_angle_rad)){ d.angle_rad = temp_angle_rad; }
      object.update_Multiplied_vectors();
    }
  });

  angle_control_line_drag.on("end", function(d){
    d3.select(this).attr("class", "invisible");
  });

  /*************************** Radius control circle Events ***************************/
  var radius_control_circle_drag = d3.drag();
  vector_2.radius_control_circle.call(radius_control_circle_drag);

  radius_control_circle_drag.on("start", function(d){
    if(d3.event.sourceEvent.type == "touchstart"){
      d3.select(this).attr("class", "visible");
      d.temp_pos = {};
      d.temp_pos.dist = distpoints(0,0, d3.event.x, d3.event.y);
      d.temp_pos.r = d.r;
    }
  });

  radius_control_circle_drag.on("drag", function(d){
    if(d3.event.sourceEvent.type == "touchmove"){
      var temp_dist = distpoints(0,0, d3.event.x, d3.event.y);
      var temp_r = d.temp_pos.r + (temp_dist - d.temp_pos.dist);
      if(!isNaN(temp_r) && temp_r >= 0){ d.r = temp_r; }
      object.update_Multiplied_vectors();
    }
  });

  radius_control_circle_drag.on("end", function(d){
    d3.select(this).attr("class", "invisible");
  });
}