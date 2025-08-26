/*************************** Utility Functions ***************************/

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

/*************************** Create Division Events ***************************/

var create_Division_Events = function() {
  this.create_Vector_1_Events = create_Vector_1_Events;
  this.create_Vector_1_Events();
  this.create_Vector_2_Events = create_Vector_2_Events;
  this.create_Vector_2_Events();
  this.create_Resultant_Events = create_Resultant_Events;
  this.create_Resultant_Events();
};

/*************************** Update Divided Vectors ***************************/

var update_Divided_vectors = function() {
  this.vector_1.update();
  this.vector_2.update();
  this.resultant.update();
  this.resultant.update_equation();
  this.resultant.resolveTextOverlaps([this.vector_1, this.vector_2, this.resultant]);
};

/*************************** Create Resultant Events ***************************/

var create_Resultant_Events = function() {
  var resultant = this.resultant;
  var object = this;

  object.dispatch = d3.dispatch("long_press");
  object.dispatch.on("long_press", function() {
    if (object.manipulationMode === true && object.componentized === false && resultant.change_mode_allowed === true) {
      object.resolve_divided_vector();
    }
    if (object.manipulationMode === false) {
      object.done_division_button.shown = true;
      object.done_division_button.image
        .attrs({ x: resultant.cx, y: resultant.cy, width: 0, height: 0 })
        .transition().duration(1000)
        .attrs({
          x: resultant.cx + object.done_division_button.posX - 0.5 * object.done_division_button.size,
          y: resultant.cy + object.done_division_button.posY - 0.5 * object.done_division_button.size,
          width: object.done_division_button.size,
          height: object.done_division_button.size
        });
    }
  });

  resultant.centre_control_circle_1.on("touchstart", function() {
    d3.select(this).styles({ "fill-opacity": 0.3 });
    object.timer = setTimeout(function() { object.dispatch.call("long_press", this, {}); }, 600);
    if (object.manipulationMode === true && object.componentized === true) {
      resultant.recombine_vector_circle = resultant.parent.canvas.append("circle")
        .styles({ "fill": resultant.gray_color, "fill-opacity": 0.2 })
        .attrs({ cx: resultant.xComponent_coordinate, cy: resultant.yComponent_coordinate, r: resultant.control_circle_radius })
        .on("touchstart", function() { clearTimeout(object.timer); object.recombine_divided_vector(); });
    }
  });

  resultant.centre_control_circle_1.on("touchend", function() {
    d3.select(this).styles({ "fill-opacity": 0 });
    clearTimeout(object.timer);
    if (resultant.recombine_vector_circle) { resultant.recombine_vector_circle.remove(); }

    var button = object.done_division_button;
    if (button.shown === true) {
      var temp_dist = calculateDistance(d3.event.targetTouches[0].pageX, d3.event.targetTouches[0].pageY, resultant.cx + button.posX, resultant.cy + button.posY);
      if (temp_dist < 0.5 * button.size) { button.active = true; } else { button.active = false; }
      if (button.active === true) {
        object.done_division();
      } else {
        button.shown = false;
        button.image
          .transition().duration(1000)
          .attrs({ width: 0, height: 0, x: resultant.cx, y: resultant.cy });
      }
    }
  });

  resultant.centre_control_circle_1.on("touchmove", function() {
    var button = object.done_division_button;
    if (button.shown === true) {
      var temp_dist = calculateDistance(d3.event.targetTouches[0].pageX, d3.event.targetTouches[0].pageY, resultant.cx + button.posX, resultant.cy + button.posY);
      if (temp_dist < 0.5 * button.size) { button.active = true; } else { button.active = false; }
      if (button.active === true) {
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

  resultant.centre_control_circle_1.on("click", function() {
    object.manipulationMode = !object.manipulationMode;
    if (object.manipulationMode === true) {
      resultant.movement_circle.styles({ "display": "none" });
      resultant.circle.styles({ "fill-opacity": 0.1 });
      resultant.radius_control_circle.styles({ "display": null });
      resultant.angle_control_line.styles({ "display": null });
    } else {
      resultant.movement_circle.styles({ "display": null });
      resultant.circle.styles({ "fill-opacity": 0 });
      resultant.radius_control_circle.styles({ "display": "none" });
      resultant.angle_control_line.styles({ "display": "none" });
    }
  });

  var drag_movement_circle = d3.drag();
  resultant.movement_circle.call(drag_movement_circle);

  drag_movement_circle.on("start", function(d) {
    if (d3.event.sourceEvent.type === "touchstart") {
      d.temp_pos = {};
      d.temp_pos.x = d3.event.sourceEvent.targetTouches[0].pageX;
      d.temp_pos.y = d3.event.sourceEvent.targetTouches[0].pageY;
      d.temp_pos.cx = d.cx;
      d.temp_pos.cy = d.cy;
    }
  });

  drag_movement_circle.on("drag", function(d) {
    if (d3.event.sourceEvent.type === "touchmove") {
      d.cx = d.temp_pos.cx + (d3.event.sourceEvent.targetTouches[0].pageX - d.temp_pos.x);
      d.cy = d.temp_pos.cy + (d3.event.sourceEvent.targetTouches[0].pageY - d.temp_pos.y);
      object.vector_1.cx = d.cx;
      object.vector_1.cy = d.cy;
      object.vector_2.cx = d.cx;
      object.vector_2.cy = d.cy;
      object.update_Divided_vectors();
    }
  });

  var radius_control_circle_drag = d3.drag();
  resultant.radius_control_circle.call(radius_control_circle_drag);

  radius_control_circle_drag.on("start", function(d) {
    if (d3.event.sourceEvent.type === "touchstart") {
      d3.select(this).attr("class", "visible");
      d.temp_pos = {};
      d.temp_pos.dist = calculateDistance(0, 0, d3.event.x, d3.event.y);
      d.temp_pos.r = d.r;
    }
  });

  radius_control_circle_drag.on("drag", function(d) {
    if (d3.event.sourceEvent.type === "touchmove") {
      var temp_dist = calculateDistance(0, 0, d3.event.x, d3.event.y);
      var temp_r = d.temp_pos.r + (temp_dist - d.temp_pos.dist);
      if (!isNaN(temp_r) && temp_r >= 0) { d.r = temp_r; }
      object.update_Divided_vectors();
    }
  });

  radius_control_circle_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });

  var angle_control_line_drag = d3.drag();
  resultant.angle_control_line.call(angle_control_line_drag);

  angle_control_line_drag.on("start", function(d) {
    if (d3.event.sourceEvent.type === "touchstart") {
      d3.select(this).attr("class", "visible");
    }
  });

  angle_control_line_drag.on("drag", function(d) {
    if (d3.event.sourceEvent.type === "touchmove") {
      var temp_angle_rad = Math.atan2(-d3.event.y, d3.event.x);
      if (!isNaN(temp_angle_rad)) { d.angle_rad = temp_angle_rad; }
      object.update_Divided_vectors();
    }
  });

  angle_control_line_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });
};

/*************************** Animate Resultant ***************************/

var animate_resultant = function() {
  var resultant = this.resultant;
  var vector1 = this.vector_1;
  var vector2 = this.vector_2;

  // Animate magnitude and angle from vector1 to resultant (division: r1/r2, angle1-angle2)
  resultant.vector_line
    .styles({ "opacity": 0, "display": null })
    .transition().duration(1000)
    .styles({ "opacity": 1 })
    .attrTween("transform", function() {
      var start_scale = vector1.r / resultant.r;
      var end_scale = 1;
      var start_angle = vector1.angle_rad * 180 / Math.PI;
      var end_angle = resultant.angle_rad * 180 / Math.PI;
      return function(t) {
        var scale = start_scale + (end_scale - start_scale) * t;
        var angle = start_angle + (end_angle - start_angle) * t;
        return `scale(${scale}) rotate(${angle})`;
      };
    });

  // Animate centre circle
  resultant.centre_circle
    .styles({ "fill-opacity": 0 })
    .transition().duration(1000)
    .attrs({ r: resultant.control_circle_radius })
    .styles({ "fill-opacity": 0.2 });

  // Update algebraic values dynamically
  resultant.vector_line
    .transition()
    .tween("update_equation", function() {
      var start_r = vector1.r;
      var end_r = resultant.r;
      var start_angle = vector1.angle_rad;
      var end_angle = resultant.angle_rad;
      return function(t) {
        var interpolated_r = start_r + (end_r - start_r) * t;
        var interpolated_angle = start_angle + (end_angle - start_angle) * t;
        resultant.r = interpolated_r;
        resultant.angle_rad = interpolated_angle;
        resultant.xComponent_length = interpolated_r * Math.cos(interpolated_angle);
        resultant.yComponent_length = interpolated_r * Math.sin(interpolated_angle);
        resultant.update();
        resultant.update_equation();
        resultant.update_text();
        resultant.resolveTextOverlaps([vector1, vector2, resultant]);
      };
    });
};

/*************************** Create Vector 1 Events ***************************/

var create_Vector_1_Events = function() {
  var vector_1 = this.vector_1;
  var object = this;

  vector_1.angle_control_line.styles({ "display": null });
  vector_1.radius_control_circle.styles({ "display": null });

  vector_1.vector_head_circle.on("touchstart", function() {
    if (object.manipulationMode === false && vector_1.division_possible && vector_1.division_data.partner) {
      vector_1.createDivisionGreyCircle();
    }
  });

  var angle_control_line_drag = d3.drag();
  vector_1.angle_control_line.call(angle_control_line_drag);

  angle_control_line_drag.on("start", function(d) {
    if (d3.event.sourceEvent.type === "touchstart") {
      d3.select(this).attr("class", "visible");
    }
  });

  angle_control_line_drag.on("drag", function(d) {
    if (d3.event.sourceEvent.type === "touchmove") {
      var temp_angle_rad = Math.atan2(-d3.event.y, d3.event.x);
      if (!isNaN(temp_angle_rad)) { d.angle_rad = temp_angle_rad; }
      object.update_Divided_vectors();
    }
  });

  angle_control_line_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });

  var radius_control_circle_drag = d3.drag();
  vector_1.radius_control_circle.call(radius_control_circle_drag);

  radius_control_circle_drag.on("start", function(d) {
    if (d3.event.sourceEvent.type === "touchstart") {
      d3.select(this).attr("class", "visible");
      d.temp_pos = {};
      d.temp_pos.dist = calculateDistance(0, 0, d3.event.x, d3.event.y);
      d.temp_pos.r = d.r;
    }
  });

  radius_control_circle_drag.on("drag", function(d) {
    if (d3.event.sourceEvent.type === "touchmove") {
      var temp_dist = calculateDistance(0, 0, d3.event.x, d3.event.y);
      var temp_r = d.temp_pos.r + (temp_dist - d.temp_pos.dist);
      if (!isNaN(temp_r) && temp_r >= 0) { d.r = temp_r; }
      object.update_Divided_vectors();
    }
  });

  radius_control_circle_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });
};

/*************************** Create Vector 2 Events ***************************/

var create_Vector_2_Events = function() {
  var vector_2 = this.vector_2;
  var object = this;

  vector_2.angle_control_line.styles({ "display": null });
  vector_2.radius_control_circle.styles({ "display": null });

  vector_2.vector_head_circle.on("touchstart", function() {
    if (object.manipulationMode === false && vector_2.division_possible && vector_2.division_data.partner) {
      vector_2.createDivisionGreyCircle();
    }
  });

  var angle_control_line_drag = d3.drag();
  vector_2.angle_control_line.call(angle_control_line_drag);

  angle_control_line_drag.on("start", function(d) {
    if (d3.event.sourceEvent.type === "touchstart") {
      d3.select(this).attr("class", "visible");
    }
  });

  angle_control_line_drag.on("drag", function(d) {
    if (d3.event.sourceEvent.type === "touchmove") {
      var temp_angle_rad = Math.atan2(-d3.event.y, d3.event.x);
      if (!isNaN(temp_angle_rad)) { d.angle_rad = temp_angle_rad; }
      object.update_Divided_vectors();
    }
  });

  angle_control_line_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });

  var radius_control_circle_drag = d3.drag();
  vector_2.radius_control_circle.call(radius_control_circle_drag);

  radius_control_circle_drag.on("start", function(d) {
    if (d3.event.sourceEvent.type === "touchstart") {
      d3.select(this).attr("class", "visible");
      d.temp_pos = {};
      d.temp_pos.dist = calculateDistance(0, 0, d3.event.x, d3.event.y);
      d.temp_pos.r = d.r;
    }
  });

  radius_control_circle_drag.on("drag", function(d) {
    if (d3.event.sourceEvent.type === "touchmove") {
      var temp_dist = calculateDistance(0, 0, d3.event.x, d3.event.y);
      var temp_r = d.temp_pos.r + (temp_dist - d.temp_pos.dist);
      if (!isNaN(temp_r) && temp_r > 0) { // Prevent division by zero
        d.r = temp_r;
        object.update_Divided_vectors();
      }
    }
  });

  radius_control_circle_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });
};