createVector.prototype.addVectors = function() {
  var object = new Object();
  if (navigator.vibrate) { navigator.vibrate([50]); }

  object.resultant = this.create_Resultant();
  object.vector_2 = this.create_Vector_2(object.resultant);
  object.vector_1 = this.create_Vector_1(object.resultant, object.vector_2);

  object.resultant.object = object;
  object.vector_1.object = object;
  object.vector_2.object = object;

  object.addition_mode = "triangle";
  object.manipulationMode = true;
  object.componentized = false;

  object.done_addition_button = { size: 5 * screen_size, size_big: 8 * screen_size };
  object.done_addition_button.posX = -8 * screen_size;
  object.done_addition_button.posY = -8 * screen_size;
  object.done_addition_button.shown = false;
  object.done_addition_button.active = false;
  object.done_addition_button.image = object.resultant.parent.canvas.append("image")
    .attrs({ "xlink:href": "../../Images/done.svg", width: 0, height: 0, x: object.resultant.cx, y: object.resultant.cy });

  object.vector_1.vector_line_dotted.styles({ "stroke-width": 0.3 * screen_size, "stroke-dasharray": "6,4" });
  object.vector_2.vector_line_dotted.styles({ "stroke-width": 0.3 * screen_size, "stroke-dasharray": "6,4" });

  object.resultant.vector_resolve_rect.attrs({ x: 0, y: -12 * screen_dpi, width: object.resultant.r, height: 24 * screen_dpi });

  object.vector_1_dotted_line = object.vector_1.container.append("line")
    .styles({ "stroke": object.vector_1.vector_color, "stroke-width": 0.3 * screen_size, "stroke-dasharray": "6,3", "display": "none" })
    .attrs({ "marker-end": "url(#arrow_" + object.vector_1.vectorID + ")" });

  object.vector_2_dotted_line = object.vector_1.container.append("line")
    .styles({ "stroke": object.vector_2.vector_color, "stroke-width": 0.3 * screen_size, "stroke-dasharray": "6,3", "display": "none" })
    .attrs({ "marker-end": "url(#arrow_" + object.vector_2.vectorID + ")" });

  object.resultant.movement_circle = object.resultant.parent.canvas.append("circle")
    .styles({ "fill": "white", "fill-opacity": 0, "display": "none" })
    .data([object.resultant]);
  object.resultant.centre_control_circle_1 = object.resultant.parent.canvas.append("circle")
    .styles({ "fill": object.resultant.vector_color, "fill-opacity": 0 });

  object.update_Added_vectors = update_Added_vectors;
  object.resolve_added_vector = resolve_added_vector;
  object.recombine_added_vector = recombine_added_vector;

  // Remove original vectors from vector_list
  for (let i = 0; i < object.vector_1.parent.vector_list.length; i++) {
    if (this.vectorID == object.vector_1.parent.vector_list[i].vectorID || this.addition_data.patner.vectorID == object.vector_1.parent.vector_list[i].vectorID) {
      object.vector_1.parent.vector_list.splice(i, 1);
      i--;
    }
  }

  // Add new vectors to vector_list
  object.vector_1.parent.vector_list.push(object.vector_1, object.vector_2, object.resultant);

  // Log the addition for the table
  screen_svg.addition_log = screen_svg.addition_log || [];
  screen_svg.addition_log.push({
    vector_1: object.vector_1,
    vector_2: object.vector_2,
    resultant: object.resultant
  });
  console.log("Addition logged:", { vector_1: object.vector_1.symbol, vector_2: object.vector_2.symbol, resultant: object.resultant.symbol });

  this.container.styles({ "display": "none" });
  this.addition_data.patner.container.styles({ "display": "none" });

  object.setup_Addition_View = setup_Addition_View;
  object.create_Addition_Events = create_Addition_Events;
  object.toggle_addition_mode = toggle_addition_mode;
  object.done_addition = done_addition;

  object.setup_Addition_View(object.vector_1, object.vector_2, object.resultant);
  object.create_Addition_Events(object.vector_1, object.vector_2, object.resultant);

  object.font_size_normal = 1.85 * screen_size;
  object.font_size_small = 1.7 * screen_size;

  var symbol_1 = object.vector_1.symbol, symbol_2 = object.vector_2.symbol, symbol_r = object.resultant.symbol;
  object.div = d3.select('body').append('div').styles({ 'font-size': object.font_size_normal, 'position': 'absolute' });
  object.div.append('text').html('\\( ' + symbol_1 + ' + ' + symbol_2 + ')_r = ' + symbol_1 + '_r + ' + symbol_2 + '_r\\)' + '<br>').styles({ 'font-size': object.font_size_normal });
  object.div.append('text').html('\\(  ' + symbol_1 + ' + ' + symbol_2 + ')_\\theta = ' + symbol_1 + '_\\theta + ' + symbol_2 + '_\\theta\\)').styles({ 'font-size': object.font_size_normal });
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  setTimeout(() => {
    object.div.styles({ 'display': 'none' });
  }, 2000);
}

/*************************** update Added vectors  ***************************/

var update_Added_vectors = function() {
  this.vector_1.update();

  if (this.addition_mode == "triangle") {
    this.vector_2.cx = this.vector_1.xComponent_coordinate;
    this.vector_2.cy = this.vector_1.yComponent_coordinate;
  }

  if (this.addition_mode == "parallelogram") {
    this.vector_2.cx = this.vector_1.cx;
    this.vector_2.cy = this.vector_1.cy;
  }

  this.vector_2.update();

  this.vector_1_dotted_line.attrs({
    x1: this.vector_2.xComponent_length,
    y1: -this.vector_2.yComponent_length,
    x2: this.vector_2.xComponent_length + this.vector_1.xComponent_length,
    y2: -this.vector_2.yComponent_length - this.vector_1.yComponent_length
  });
  this.vector_2_dotted_line.attrs({
    x1: this.vector_1.xComponent_length,
    y1: -this.vector_1.yComponent_length,
    x2: this.vector_2.xComponent_length + this.vector_1.xComponent_length,
    y2: -this.vector_2.yComponent_length - this.vector_1.yComponent_length
  });

  this.vector_1.xComponent_line.attrs({ x1: 0, y1: 0, x2: this.vector_1.xComponent_length, y2: 0 });
  this.vector_1.yComponent_line.attrs({ x1: 0, y1: 0, x2: 0, y2: -this.vector_1.yComponent_length });
  this.vector_2.xComponent_line.attrs({ x1: 0, y1: this.vector_1.yComponent_length, x2: this.vector_2.xComponent_length, y2: this.vector_1.yComponent_length });
  this.vector_2.yComponent_line.attrs({ x1: -this.vector_1.xComponent_length, y1: 0, x2: -this.vector_1.xComponent_length, y2: -this.vector_2.yComponent_length });

  var xComponent_length = this.vector_1.xComponent_length + this.vector_2.xComponent_length;
  var yComponent_length = this.vector_1.yComponent_length + this.vector_2.yComponent_length;
  var r = Math.sqrt(xComponent_length * xComponent_length + yComponent_length * yComponent_length);
  var angle_rad = Math.atan2(yComponent_length, xComponent_length);
  this.resultant.r = r;
  this.resultant.angle_rad = angle_rad;

  this.resultant.movement_circle.attrs({ cx: this.resultant.cx, cy: this.resultant.cy, r: this.resultant.r });
  this.resultant.centre_control_circle_1.attrs({ cx: this.resultant.cx, cy: this.resultant.cy, r: this.resultant.control_circle_radius });
  this.resultant.update();

  this.div.styles({ 'top': this.resultant.cy + this.resultant.r + 10, 'left': this.resultant.cx - 0.5 * parseInt(this.div.style('width')) });
}

/*************************** setup_Addition_View ***************************/

var setup_Addition_View = function() {
  var vector_1 = this.vector_1, vector_2 = this.vector_2, resultant = this.resultant;

  vector_1.xAxis
    .transition().duration(1000).delay(0)
    .styles({ "opacity": 0 });
  vector_1.yAxis
    .transition().duration(1000).delay(0)
    .styles({ "opacity": 0 });
  vector_1.circle
    .transition().duration(1000).delay(0)
    .styles({ "stroke-opacity": 0 })
    .transition().duration(0).delay(0)
    .styles({ "fill-opacity": 0.2, "display": "none" });
  vector_1.centre_circle
    .transition().duration(1000).delay(0)
    .styles({ "opacity": 0 });

  vector_2.xAxis
    .transition().duration(1000).delay(0)
    .styles({ "opacity": 0 });
  vector_2.yAxis
    .transition().duration(1000).delay(0)
    .styles({ "opacity": 0 });
  vector_2.circle
    .transition().duration(1000).delay(0)
    .styles({ "stroke-opacity": 0 })
    .transition().duration(0).delay(0)
    .styles({ "fill-opacity": 0.2, "display": "none" });
  vector_2.centre_circle
    .transition().duration(1000).delay(0)
    .styles({ "opacity": 0 });

  var xComponent_length = vector_1.xComponent_length + vector_2.xComponent_length;
  var yComponent_length = vector_1.yComponent_length + vector_2.yComponent_length;
  var r = Math.sqrt(xComponent_length * xComponent_length + yComponent_length * yComponent_length);
  var angle_rad = Math.atan2(yComponent_length, xComponent_length);
  resultant.r = r;
  resultant.angle_rad = angle_rad;

  resultant.vector_line
    .attrs({ x1: 0, y1: 0, x2: 0, y2: 0 })
    .transition().delay(1000).duration(1000)
    .attrs({ x2: xComponent_length, y2: -yComponent_length });

  resultant.circle.attrs({ "class": null }).styles({ "fill-opacity": 0.1 });

  object = this;
  setTimeout(function() { object.update_Added_vectors(); }, 2000);
}

/*************************** Create Resultant ***************************/

createVector.prototype.create_Resultant = function() {
  this.parent.vectorID++;
  var temp_vector = new createVector({
    parent: this.parent,
    cx: this.cx,
    cy: this.cy,
    r: 0,
    manipulationPossible: true,
    angle_rad: 0,
    manipulables: { r: false, angle: false, xComponent: false, yComponent: false },
    resolution_allowed: this.addition_resolution_allowed,
    movementAllowed: true,
    vector_mode: "polar",
    cartesian_mode_controls: "polar",
    vectorID: this.parent.vectorID,
    addedVectors: true,
    position: "resultant",
    taskScreen: this.taskScreen,
    screen_data: this.screen_data,
    change_mode_allowed: this.addition_change_mode_allowed
  });
  temp_vector.vector_line.styles({ "stroke-width": 0.5 * screen_size });
  return temp_vector;
}

/*************************** Create Vector 2 ***************************/

createVector.prototype.create_Vector_2 = function(resultant) {
  var data = this.addition_data.patner;
  var temp_vector = new createVector({
    parent: data.parent,
    cx: this.xComponent_coordinate,
    cy: this.yComponent_coordinate,
    r: data.r,
    manipulationPossible: true,
    angle_rad: data.angle_rad,
    manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
    resolution_allowed: true,
    movementAllowed: true,
    vector_mode: "polar",
    cartesian_mode_controls: "polar",
    vectorID: data.vectorID,
    addedVectors: true,
    position: "second",
    taskScreen: data.taskScreen,
    screen_data: data.screen_data
  });
  temp_vector.vector_line.attrs({ "marker-end": "url(#arrow_component_" + temp_vector.vectorID + ")" });
  return temp_vector;
}

/*************************** Create Vector 1 ***************************/

createVector.prototype.create_Vector_1 = function(resultant, vector_2) {
  var temp_vector = new createVector({
    parent: this.parent,
    cx: this.cx,
    cy: this.cy,
    r: this.r,
    manipulationPossible: true,
    angle_rad: this.angle_rad,
    manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
    resolution_allowed: true,
    movementAllowed: true,
    vector_mode: "polar",
    cartesian_mode_controls: "polar",
    vectorID: this.vectorID,
    addedVectors: true,
    position: "first",
    taskScreen: this.taskScreen,
    screen_data: this.screen_data
  });
  temp_vector.vector_line.attrs({ "marker-end": "url(#arrow_component_" + temp_vector.vectorID + ")" });
  return temp_vector;
}