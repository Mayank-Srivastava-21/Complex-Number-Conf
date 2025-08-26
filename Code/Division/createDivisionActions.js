/*************************** Create Division Actions ***************************/

/*************************** Done Division ***************************/

var done_division = function() {
  if (navigator.vibrate) { navigator.vibrate([50]); }
  var object = this, vector_1 = this.vector_1, vector_2 = this.vector_2, resultant = this.resultant;

  var temp_list = [vector_1.container, vector_2.container, resultant.container, object.done_division_button.image, resultant.movement_circle, resultant.centre_control_circle_1, object.div];
  for (var i in temp_list) { temp_list[i].styles({ "display": "none" }); }

  // Clean up division circles
  if (vector_1.division_circle) { vector_1.division_circle.remove(); }
  if (vector_2.division_circle) { vector_2.division_circle.remove(); }

  var temp_vector = new createVector({
    parent: resultant.parent,
    cx: resultant.cx,
    cy: resultant.cy,
    r: resultant.r,
    angle_rad: resultant.angle_rad,
    xComponent_length: resultant.xComponent_length,
    yComponent_length: resultant.yComponent_length,
    manipulationPossible: true,
    manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
    resolution_allowed: true,
    movementAllowed: true,
    vector_mode: "polar",
    cartesian_mode_controls: "polar",
    vectorID: resultant.vectorID,
    addedVectors: false,
    multiplicationResultant: false,
    divisionResultant: true,
    symbol: resultant.symbol,
    gray_color: resultant.gray_color,
    stroke_color: resultant.stroke_color,
    fill_color: resultant.fill_color,
    vector_color: resultant.vector_color,
    control_circle_radius: resultant.control_circle_radius,
    addition_allowed: true,
    multiplication_allowed: true,
    division_allowed: true,
    delete_allowed: true
  });

  resultant.parent.vector_list.push(temp_vector);
  temp_vector.update();
  temp_vector.resolveTextOverlaps(resultant.parent.vector_list);

  // Reset division states
  vector_1.division_possible = false;
  vector_2.division_possible = false;
  vector_1.division_data = {};
  vector_2.division_data = {};
};

/*************************** Recombine Divided Vector ***************************/

var recombine_divided_vector = function() {
  setTimeout(() => {
    this.div.styles({ 'display': 'none' });
  }, 2000);

  this.componentized = false;

  var vector_1 = this.vector_1;
  vector_1.vector_mode = "polar";
  vector_1.yComponent_line
    .transition().delay(0).duration(1000)
    .attrs({ x1: vector_1.xComponent_length, x2: vector_1.xComponent_length })
    .transition().delay(500).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  vector_1.xComponent_line
    .transition().delay(1500).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  vector_1.vector_line
    .styles({ "opacity": 0, "display": null })
    .transition().delay(1000).duration(500)
    .styles({ "opacity": 1 });

  vector_1.vector_line_dotted
    .transition().delay(1500).duration(0)
    .styles({ "display": "none" });

  vector_1.vector_head_circle
    .transition().delay(1500).duration(0)
    .styles({ "display": "none" });

  var vector_2 = this.vector_2;
  vector_2.vector_mode = "polar";
  vector_2.yComponent_line
    .transition().delay(0).duration(1000)
    .attrs({ x1: vector_2.xComponent_length, x2: vector_2.xComponent_length })
    .transition().delay(500).duration(1000)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  vector_2.xComponent_line
    .transition().delay(0).duration(1000)
    .attrs({ y1: 0, y2: 0 })
    .transition().delay(500).duration(1000)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  vector_2.vector_line
    .styles({ "opacity": 0, "display": null })
    .transition().delay(1000).duration(500)
    .styles({ "opacity": 1 });

  vector_2.vector_line_dotted
    .transition().delay(1500).duration(0)
    .styles({ "display": "none" });

  vector_2.vector_head_circle
    .transition().delay(1500).duration(0)
    .styles({ "display": "none" });

  var resultant = this.resultant;
  resultant.vector_mode = "polar";
  resultant.vector_line
    .styles({ "display": null, "opacity": 0 })
    .transition().delay(2500).duration(500)
    .styles({ "opacity": 1 });

  resultant.xComponent_triangle
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  resultant.yComponent_triangle
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  resultant.xProjection_line
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  resultant.yProjection_line
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  resultant.vector_head_circle
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  setTimeout(function() {
    vector_1.text_2.text.styles({ "display": null });
    vector_1.text_2.textBox.styles({ "display": null });
    vector_1.text_3.text.styles({ "display": "none" });
    vector_1.text_3.textBox.styles({ "display": "none" });

    vector_2.text_2.text.styles({ "display": null });
    vector_2.text_2.textBox.styles({ "display": null });
    vector_2.text_3.text.styles({ "display": "none" });
    vector_2.text_3.textBox.styles({ "display": "none" });

    resultant.text_2.text.styles({ "display": null });
    resultant.text_2.textBox.styles({ "display": null });
    resultant.text_3.text.styles({ "display": "none" });
    resultant.text_3.textBox.styles({ "display": "none" });

    vector_1.update();
    vector_2.update();
    resultant.update();
    resultant.update_equation();
    resultant.resolveTextOverlaps([vector_1, vector_2, resultant]);
  }, 3500);
};

/*************************** Resolve Divided Vector ***************************/

var resolve_divided_vector = function() {
  setTimeout(() => {
    this.div.styles({ 'display': 'none' });
  }, 2000);

  this.componentized = true;

  var vector_1 = this.vector_1;
  vector_1.vector_mode = "cartesian";
  vector_1.xComponent_triangle.styles({ "display": "none" });
  vector_1.yComponent_triangle.styles({ "display": "none" });

  vector_1.xComponent_line
    .styles({ "display": null, "opacity": 0 })
    .attrs({ x1: 0, y1: 0, x2: vector_1.xComponent_length, y2: 0 })
    .transition().delay(0).duration(1500)
    .styles({ "opacity": 1 });

  vector_1.yComponent_line
    .styles({ "display": null, "opacity": 0 })
    .attrs({ x1: vector_1.xComponent_length, y1: 0, x2: vector_1.xComponent_length, y2: -vector_1.yComponent_length })
    .transition().delay(0).duration(1500)
    .styles({ "opacity": 1 });

  vector_1.vector_line
    .styles({ "display": null })
    .transition().delay(1000).duration(1000)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  vector_1.vector_line_dotted.styles({ "display": null });
  vector_1.vector_head_circle.styles({ "display": null });

  var vector_2 = this.vector_2;
  vector_2.vector_mode = "cartesian";
  vector_2.xComponent_triangle.styles({ "display": "none" });
  vector_2.yComponent_triangle.styles({ "display": "none" });

  vector_2.xComponent_line
    .styles({ "display": null, "opacity": 0 })
    .attrs({ x1: 0, y1: 0, x2: vector_2.xComponent_length, y2: 0 })
    .transition().delay(0).duration(1500)
    .styles({ "opacity": 1 });

  vector_2.yComponent_line
    .styles({ "display": null, "opacity": 0 })
    .attrs({ x1: vector_2.xComponent_length, y1: 0, x2: vector_2.xComponent_length, y2: -vector_2.yComponent_length })
    .transition().delay(0).duration(1500)
    .styles({ "opacity": 1 });

  vector_2.vector_line
    .styles({ "display": null })
    .transition().delay(1000).duration(1000)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  vector_2.vector_line_dotted.styles({ "display": null });
  vector_2.vector_head_circle.styles({ "display": null });

  var resultant = this.resultant;
  resultant.vector_mode = "cartesian";
  var temp_len = parseInt(resultant.centre_circle.attr("r"));
  resultant.centre_circle
    .transition().delay(0).duration(200)
    .attrs({ r: 2 * temp_len })
    .transition().delay(50).duration(150)
    .attrs({ r: temp_len });

  resultant.vector_line
    .transition().delay(2500).duration(1000)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "display": "none", "opacity": 1 });

  resultant.xProjection_circle
    .transition().delay(2500).duration(1000)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "display": "none", "opacity": 1 });

  resultant.yProjection_circle
    .transition().delay(2500).duration(1000)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "display": "none", "opacity": 1 });

  setTimeout(function() {
    vector_1.text_2.text.styles({ "display": "none" });
    vector_1.text_2.textBox.styles({ "display": "none" });
    vector_1.text_3.text.styles({ "display": null });
    vector_1.text_3.textBox.styles({ "display": null });

    vector_2.text_2.text.styles({ "display": "none" });
    vector_2.text_2.textBox.styles({ "display": "none" });
    vector_2.text_3.text.styles({ "display": null });
    vector_2.text_3.textBox.styles({ "display": null });

    resultant.text_2.text.styles({ "display": "none" });
    resultant.text_2.textBox.styles({ "display": "none" });
    resultant.text_3.text.styles({ "display": null });
    resultant.text_3.textBox.styles({ "display": null });

    vector_1.update();
    vector_2.update();
    resultant.update();
    resultant.update_equation();
    resultant.resolveTextOverlaps([vector_1, vector_2, resultant]);
  }, 3500);
};

/*************************** Toggle Division Mode ***************************/

var toggle_division_mode = function() {
  var object = this, vector_2 = this.vector_2, vector_1 = this.vector_1;

  if (object.division_mode === "default") {
    object.division_mode = "offset";
    vector_2.vector_line
      .transition().delay(0).duration(1000)
      .attrs({
        x1: vector_1.r,
        y1: 0,
        x2: vector_1.r + vector_2.xComponent_length,
        y2: -vector_2.yComponent_length
      });

    object.vector_2_dotted_line
      .styles({ "display": null, "opacity": 0 })
      .attrs({
        x1: 0,
        y1: 0,
        x2: vector_1.r,
        y2: 0
      })
      .transition().delay(0).duration(1000)
      .styles({ "opacity": 1 });

    setTimeout(function() { object.update_Divided_vectors(); }, 2100);
  } else {
    object.division_mode = "default";
    vector_2.vector_line
      .transition().delay(1000).duration(1000)
      .attrs({
        x1: 0,
        y1: 0,
        x2: vector_2.xComponent_length,
        y2: -vector_2.yComponent_length
      });

    object.vector_2_dotted_line
      .transition().delay(1000).duration(1000)
      .styles({ "opacity": 0 })
      .transition().delay(0).duration(0)
      .styles({ "display": "none" });

    setTimeout(function() { object.update_Divided_vectors(); }, 2100);
  }
};