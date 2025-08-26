/********************************************************************************************************/
/* createAdditionActions.js */

/********************************************************************************************************/
// Recombine added vector From Componentised form

var done_addition = function(){
  if(navigator.vibrate){ navigator.vibrate([50]); }
  var object = this, vector_1 = this.vector_1, vector_2 = this.vector_2, resultant = this.resultant;

  var temp_list = [ vector_1.container, vector_2.container, resultant.container, object.done_addition_button.image, resultant.movement_circle, resultant.centre_control_circle_1 ];
  for(i in temp_list){ temp_list[i].styles({ "display": "none" }); }

  var temp_vector = new createVector({
    parent: resultant.parent,
    cx: resultant.cx,
    cy: resultant.cy,
    r: resultant.r,
    angle_rad: resultant.angle_rad,
    manipulationPossible: true,
    manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
    resolution_allowed: true,
    movementAllowed: true,
    vector_mode: "polar",               // "cartesian", "polar"
    cartesian_mode_controls: "polar",   // "cartesian", "polar"
    vectorID: resultant.vectorID,
    addedVectors: false
  })
  resultant.parent.vector_list.push(temp_vector);

  // if(vector_1.taskScreen == true){
  //   // vector_1.screen_data.vectorID = vectorID;
  //   vector_1.screen_data.vector_list.push(temp_vector);
  // }

}

/********************************************************************************************************/
// Recombine added vector From Componentised form

var recombine_added_vector = function(){
  // if(navigator.vibrate){ navigator.vibrate([50]); }

  setTimeout(() => {
    this.div.styles({ 'display': 'none' });
  }, 2000);

  this.componentized = false;

  /*************************** Vector 1 **************************************/
  var vector_1 = this.vector_1;

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

  /*************************** Vector 2 **************************************/
  var vector_2 = this.vector_2;

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

  /*************************** Resultant **************************************/
  var resultant = this.resultant;

  resultant.vector_line
    .styles({ "display": null, "opacity": 0 })
    // .attrs({ x2: 0, y2: 0 })
    .transition().delay(2500).duration(500)
    .styles({ "opacity": 1 })
    // .transition().delay(0).duration(500)
    // .attrs({ x2: resultant.xComponent_length, y2: -resultant.yComponent_length });

  resultant.xComponent_triangle
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).delay(0)
    .styles({ "opacity": 1, "display": "none" });

  resultant.yComponent_triangle
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).delay(0)
    .styles({ "opacity": 1, "display": "none" });

  resultant.xProjection_line
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).delay(0)
    .styles({ "opacity": 1, "display": "none" });

  resultant.yProjection_line
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).delay(0)
    .styles({ "opacity": 1, "display": "none" });

  resultant.vector_head_circle
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).delay(0)
    .styles({ "opacity": 1, "display": "none" });

  setTimeout(function(){
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
  }, 3500)

}

/********************************************************************************************************/
// Resolve Added Vector into components

var resolve_added_vector = function(){
  // if(navigator.vibrate){ navigator.vibrate([50]); }

  setTimeout(() => {
    this.div.styles({ 'display': 'none' });
  }, 2000);

  this.componentized = true;

  /*************************** Vector 1 **************************************/
  var vector_1 = this.vector_1;
  // d3.selectAll(".projection_"+vector_1.vectorID).styles({ "display": null });
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
    .styles({ "opacity": 1 })
    .transition().delay(0).duration(1500)
    .attrs({ x1: 0, x2: 0 });

  vector_1.vector_line
    .styles({ "display": null })
    .transition().delay(1000).duration(1000)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

    vector_1.vector_line_dotted.styles({ "display": null });
    vector_1.vector_head_circle.styles({ "display": null });

  // vector_1.xProjection_circle
  //   .transition().delay(3000).duration(1000)
  //   .styles({ "opacity": 0 })
  //   .transition().delay(0).duration(0)
  //   .styles({ "display": "none", "opacity": 1 });
  //
  // vector_1.yProjection_circle
  //   .transition().delay(3000).duration(1000)
  //   .styles({ "opacity": 0 })
  //   .transition().delay(0).duration(0)
  //   .styles({ "display": "none", "opacity": 1 });
  //
  // vector_1.xProjection_line
  //   .transition().delay(3000).duration(1000)
  //   .styles({ "opacity": 0 })
  //   .transition().delay(0).duration(0)
  //   .styles({ "display": "none", "opacity": 1 });
  //
  // vector_1.yProjection_line
  //   .transition().delay(3000).duration(1000)
  //   .styles({ "opacity": 0 })
  //   .transition().delay(0).duration(0)
  //   .styles({ "display": "none", "opacity": 1 });

    /*************************** Vector 2 **************************************/
    var vector_2 = this.vector_2;
    // d3.selectAll(".projection_"+vector_2.vectorID).styles({ "display": null });
    vector_2.xComponent_triangle.styles({ "display": "none" });
    vector_2.yComponent_triangle.styles({ "display": "none" });

    vector_2.xComponent_line
      .styles({ "display": null, "opacity": 0 })
      .attrs({ x1: 0, y1: 0, x2: vector_2.xComponent_length, y2: 0 })
      .transition().delay(0).duration(1500)
      .styles({ "opacity": 1 })
      .transition().delay(0).duration(1500)
      .attrs({ y1: vector_1.yComponent_length, y2: vector_1.yComponent_length });

    vector_2.yComponent_line
      .styles({ "display": null, "opacity": 0 })
      .attrs({ x1: vector_2.xComponent_length, y1: 0, x2: vector_2.xComponent_length, y2: -vector_2.yComponent_length })
      .transition().delay(0).duration(1500)
      .styles({ "opacity": 1 })
      .transition().delay(0).duration(1500)
      .attrs({ x1: -vector_1.xComponent_length, x2: -vector_1.xComponent_length });

    vector_2.vector_line
      .styles({ "display": null })
      .transition().delay(1000).duration(1000)
      .styles({ "opacity": 0 })
      .transition().delay(0).duration(0)
      .styles({ "opacity": 1, "display": "none" });

      vector_2.vector_line_dotted.styles({ "display": null });
      vector_2.vector_head_circle.styles({ "display": null });

    // vector_2.xProjection_circle
    //   .attrs({ cx: vector_2.xComponent_length, cy: 0 })
    //   .transition().delay(3000).duration(1000)
    //   .styles({ "opacity": 0 })
    //   .transition().delay(0).duration(0)
    //   .styles({ "display": "none", "opacity": 1 });
    //
    // vector_2.yProjection_circle
    //   .attrs({ cx: 0, cy: -vector_2.yComponent_length })
    //   .transition().delay(3000).duration(1000)
    //   .styles({ "opacity": 0 })
    //   .transition().delay(0).duration(0)
    //   .styles({ "display": "none", "opacity": 1 });
    //
    // vector_2.xProjection_line
    //   .attrs({ x1: 0, x2: 0 })
    //   .transition().delay(3000).duration(1000)
    //   .styles({ "opacity": 0 })
    //   .transition().delay(0).duration(0)
    //   .styles({ "display": "none", "opacity": 1 });
    //
    // vector_2.yProjection_line
    //   .attrs({ y1: 0, y2: 0 })
    //   .transition().delay(3000).duration(1000)
    //   .styles({ "opacity": 0 })
    //   .transition().delay(0).duration(0)
    //   .styles({ "display": "none", "opacity": 1 });

  /*************************** Resultant **************************************/
  var resultant = this.resultant;

  var temp_len = parseInt(resultant.centre_circle.attr("r"));
  resultant.centre_circle
    .transition().delay(0).duration(200)
    .attrs({ r: 2*temp_len })
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

  setTimeout(function(){
    vector_1.text_2.text.styles({ "display": "none" });
    vector_1.text_2.textBox.styles({ "display": "none" });
    vector_1.text_3.text.styles({ "display": "none" }); // Hide text_3 for vector_1
    vector_1.text_3.textBox.styles({ "display": "none" });

    vector_2.text_2.text.styles({ "display": "none" });
    vector_2.text_2.textBox.styles({ "display": "none" });
    vector_2.text_3.text.styles({ "display": "none" });
    vector_2.text_3.textBox.styles({ "display": "none" });

    resultant.text_2.text.styles({ "display": "none" });
    resultant.text_2.textBox.styles({ "display": "none" });
    resultant.text_3.text.styles({ "display": "none" });
    resultant.text_3.textBox.styles({ "display": "none" });
  }, 3500)

}

/********************************************************************************************************/
// Toggle Addition Mode between "triangle" and "parallelogram"

var toggle_addition_mode = function(){
  // if(navigator.vibrate){ navigator.vibrate([50]); }

  var object = this, vector_2 = this.vector_2, vector_1 = this.vector_1;

  if(object.addition_mode == "triangle"){
    object.addition_mode = "parallelogram";
    vector_2.vector_line
      .transition().delay(0).duration(1000)
      .attrs({ x1: 0 - vector_1.xComponent_length, y1: 0 + vector_1.yComponent_length, x2: vector_2.xComponent_length - vector_1.xComponent_length, y2: -vector_2.yComponent_length + vector_1.yComponent_length});

    object.vector_2_dotted_line.styles({ "display": null });
    object.vector_1_dotted_line
      .styles({ "display": null })
      .attrs({ x1: 0, y1: 0, x2: 0+this.vector_1.xComponent_length, y2: 0-this.vector_1.yComponent_length })
      .transition().delay(1000).duration(1000)
      .attrs({ x1: this.vector_2.xComponent_length, y1: -this.vector_2.yComponent_length, x2: this.vector_2.xComponent_length+this.vector_1.xComponent_length, y2: -this.vector_2.yComponent_length-this.vector_1.yComponent_length })

    setTimeout(function(){ object.update_Added_vectors(); }, 2100);

  } else {
    object.addition_mode = "triangle";

    object.vector_1_dotted_line
      .transition().delay(0).duration(1000)
      .attrs({ x1: 0, y1: 0, x2: 0+this.vector_1.xComponent_length, y2: 0-this.vector_1.yComponent_length })
      .transition().delay(0).duration(0)
      .styles({ "display": "none" });

    vector_2.vector_line
      .transition().delay(1000).duration(1000)
      .attrs({ x1: vector_1.xComponent_length, y1: -vector_1.yComponent_length, x2: vector_2.xComponent_length + vector_1.xComponent_length, y2: -vector_2.yComponent_length - vector_1.yComponent_length });

    object.vector_2_dotted_line
      .transition().delay(2000).duration(0)
      .styles({ "display": "none" });

    setTimeout(function(){ object.update_Added_vectors(); }, 2100);
  }
}