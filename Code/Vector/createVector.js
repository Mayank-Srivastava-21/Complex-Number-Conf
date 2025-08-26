/***********************************************************************************/
/* createVector.js */

function createVector(data) {
  if (navigator.vibrate) { navigator.vibrate([50]); }

  for (var i in data) { this[i] = data[i]; }

  this.vector_color = (typeof color === "function" ? color(data.vectorID) : ["red", "blue", "green"][data.vectorID % 3] || "black");
  this.gray_color = "gray";
  this.manipulationMode = false;
  this.manipulationActive = false;
  this.moving = false;

    // New properties for flip functionality
  this.isFlipped = false;
  this.originalAngle = this.angle_rad;
  this.flippedAngle = this.angle_rad + Math.PI;
  this.flipAnimationDuration = 500; // ms
  this.isSelected = false; 

    // Add these properties
    this.originalAngle = this.angle_rad;  // Store original angle
    this.originalR = this.r;              // Store original magnitude
    this.showDashed = false;              // Flag for showing dashed representation
    this.dashedGroup = null;              // Reference to dashed line group

    this.trueOriginalAngle = this.angle_rad;  // Always stores the very first angle
  this.trueOriginalR = this.r;              // Always stores the very first magnitude
  this.lastFlippedAngle = null;             // Stores angle when last flipped
  this.showDashed = false;                  // Flag for showing dashed representation
  this.dashedGroup = null;                  // Reference to dashed line group

  const complexSymbols = ["z", "w", "u", "v", "p", "q", "r", "s"];
  this.symbol = complexSymbols[data.vectorID] || "z";
  this.visibility = true;
  this.addition_possible = false;
  this.multiplication_possible = false;
  this.division_possible = false;
  this.addition_data = {};
  this.multiplication_data = {};
  this.division_data = {};
  this.addedVectors = data.addedVectors || false;
  this.multiplicationResultant = data.multiplicationResultant || false;
  this.divisionResultant = data.divisionResultant || false;
  screen_svg.vector_log = screen_svg.vector_log || {};
  screen_svg.vector_log[data.vectorID] = this;
  if (this.delete_allowed === undefined) { this.delete_allowed = true; }
  if (this.addition_resolution_allowed === undefined) { this.addition_resolution_allowed = true; }
  if (this.addition_change_mode_allowed === undefined) { this.addition_change_mode_allowed = true; }
  if (this.multiplication_allowed === undefined) { this.multiplication_allowed = true; }
  if (this.division_allowed === undefined) { this.division_allowed = true; }

  this.control_circle_radius = 3 * (window.screen_dpi || 96);
  this.control_line_size = 4 * (window.screen_dpi || 96);
  this.addition_circle_radius = 2 * (window.screen_size || 100);

  if (this.taskScreen === true && this.parent.parent_svg) {
    this.parent.parent_svg.append("marker").attrs({ id: "arrow_" + this.vectorID, viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 4, markerHeight: 4, orient: "auto" })
      .append("circle").attrs({ id: "arrow-path", cx: 5, cy: 5, r: 4 }).styles({ "stroke": this.vector_color, "fill": this.vector_color });
    this.parent.parent_svg.append("marker").attrs({ id: "arrow_component_" + this.vectorID, viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 3, markerHeight: 3, orient: "auto" })
      .append("circle").attrs({ id: "arrow-path", cx: 5, cy: 5, r: 4 }).styles({ "stroke": this.vector_color, "fill": this.vector_color });
    this.parent.parent_svg.append("marker").attrs({ id: "arrow_gray_" + this.vectorID, viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 4, markerHeight: 4, orient: "auto" })
      .append("circle").attrs({ id: "arrow-path", cx: 5, cy: 5, r: 4 }).styles({ "stroke": this.gray_color, "fill": this.gray_color });
  } else if (this.parent && this.parent.canvas) {
    this.parent.canvas.append("marker").attrs({ id: "arrow_" + this.vectorID, viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 4, markerHeight: 4, orient: "auto" })
      .append("circle").attrs({ id: "arrow-path", cx: 5, cy: 5, r: 4 }).styles({ "stroke": this.vector_color, "fill": this.vector_color });
    this.parent.canvas.append("marker").attrs({ id: "arrow_component_" + this.vectorID, viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 3, markerHeight: 3, orient: "auto" })
      .append("circle").attrs({ id: "arrow-path", cx: 5, cy: 5, r: 4 }).styles({ "stroke": this.vector_color, "fill": this.vector_color });
    this.parent.canvas.append("marker").attrs({ id: "arrow_gray_" + this.vectorID, viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 4, markerHeight: 4, orient: "auto" })
      .append("circle").attrs({ id: "arrow-path", cx: 5, cy: 5, r: 4 }).styles({ "stroke": this.gray_color, "fill": this.gray_color });
  }

  this.create();
  this.setup();
  this.update();
  this.setup_view();
  if (!this.addedVectors) {
    this.createEvents();
  }
  //if (!this.multiplicationResultant && !this.divisionResultant) {
  //  this.createEventsmuldiv();
  //}
}

/***********************************************************************************/
createVector.prototype.create = function() {
  this.container = this.parent.canvas.append("g").classed("vector_g", true);
  this.circle = this.container.append("circle").data([this]);
  this.xAxis = this.container.append("line");
  this.yAxis = this.container.append("line");

  /*************************** Projection lines and paths ***************************/
  this.xComponent_triangle = this.container.append("path").attr("class", "projection_" + this.vectorID);
  this.yComponent_triangle = this.container.append("path").attr("class", "projection_" + this.vectorID);

  this.xProjection_line = this.container.append("line").attr("class", "projection_" + this.vectorID);
  this.yProjection_line = this.container.append("line").attr("class", "projection_" + this.vectorID);

  this.xProjection_circle = this.container.append("circle").attr("class", "projection_" + this.vectorID);
  this.yProjection_circle = this.container.append("circle").attr("class", "projection_" + this.vectorID);

  this.vector_head_circle = this.container.append("circle").attr("class", "projection_" + this.vectorID);
  this.vector_line_dotted = this.container.append("line").attr("class", "projection_" + this.vectorID);

  /*************************** Vectors ***************************/
  this.vector_line_inactive = this.container.append("line");
  this.vector_line = this.container.append("line");

  this.xComponent_line = this.container.append("line");
  this.yComponent_line = this.container.append("line");

  this.centre_circle = this.container.append("circle");

  /*************************** Controls ***************************/
  this.vector_resolve_rect_g = this.container.append("g");
  this.vector_resolve_rect = this.vector_resolve_rect_g.append("rect").data([this]);

  this.angle_control_line = this.container.append("line").data([this]);
  this.radius_control_circle = this.container.append("circle").data([this]);
  this.centre_control_circle = this.container.append("circle").data([this]);
  this.xComponent_control_circle = this.container.append("circle").data([this]);
  this.yComponent_control_circle = this.container.append("circle").data([this]);
  this.vector_recombine_circle = this.container.append("circle").data([this]);

  /*************************** Addition circle ***************************/
  this.addition_circle = this.container.append("circle").data([this]);

  /*************************** Multiplication circle ***************************/
  this.multiplication_circle = this.container.append("circle").data([this]);

  /*************************** Division circle ***************************/
  this.division_circle = this.container.append("circle").data([this]);

  /*************************** Extra Controls ***************************/
  this.delete_button = { size: 5 * (window.screen_size || 100), size_big: 8 * (window.screen_size || 100) };
  this.delete_button.posX = -8 * (window.screen_size || 100);
  this.delete_button.posY = -8 * (window.screen_size || 100);
  this.delete_button.shown = false;
  this.delete_button.active = false;
  this.delete_button.image = this.container.append("image")
    .attrs({ "xlink:href": "../../Images/delete.png", width: 0, height: 0 }).data([this]);

  this.create_text();
  this.create_equation();
}

/***********************************************************************************/
createVector.prototype.setup = function() {
  this.circle.styles({ "stroke": this.gray_color, "stroke-opacity": 0.5, "stroke-width": 0.1 * (window.screen_size || 100), "stroke-dasharray": "3,3", "fill": this.vector_color, "fill-opacity": 0 });
  this.xAxis.styles({ "stroke": this.gray_color, "stroke-opacity": 0.5, "stroke-width": 0.1 * (window.screen_size || 100), "stroke-dasharray": "3,3" });
  this.yAxis.styles({ "stroke": this.gray_color, "stroke-opacity": 0.5, "stroke-width": 0.1 * (window.screen_size || 100), "stroke-dasharray": "3,3" });

  /*************************** Projection lines and paths ***************************/
  this.xComponent_triangle.styles({ "fill": this.vector_color, "fill-opacity": 0.3, "stroke": "none" });
  this.yComponent_triangle.styles({ "fill": this.vector_color, "fill-opacity": 0.2, "stroke": "none" });

  this.xProjection_line.styles({ "stroke": this.vector_color, "stroke-opacity": 0.6, "stroke-width": 0.15 * (window.screen_size || 100), "stroke-dasharray": "3,3" });
  this.yProjection_line.styles({ "stroke": this.vector_color, "stroke-opacity": 0.6, "stroke-width": 0.15 * (window.screen_size || 100), "stroke-dasharray": "3,3" });

  this.xProjection_circle.styles({ "stroke": "none", "fill": this.vector_color, "fill-opacity": 0.8 });
  this.yProjection_circle.styles({ "stroke": "none", "fill": this.vector_color, "fill-opacity": 0.8 });

  this.vector_head_circle.styles({ "stroke": "none", "fill": this.vector_color, "fill-opacity": 0.8 });
  this.vector_line_dotted.styles({ "stroke": this.vector_color, "stroke-opacity": 0.6, "stroke-width": 0.2 * (window.screen_size || 100), "stroke-dasharray": "3,3" });

  /*************************** Vectors ***************************/
  this.vector_line_inactive.styles({ "stroke": this.gray_color, "stroke-width": 0.4 * (window.screen_size || 100) })
    .attrs({ "marker-end": "url(#arrow_gray_" + this.vectorID + ")" });
  this.vector_line.styles({ "stroke": this.vector_color, "stroke-width": 0.4 * (window.screen_size || 100) })
    .attrs({ "marker-end": "url(#arrow_" + this.vectorID + ")" });

  this.xComponent_line.styles({ "stroke": this.vector_color, "stroke-width": 0.4 * (window.screen_size || 100) })
    .attrs({ "marker-end": "url(#arrow_component_" + this.vectorID + ")" });
  this.yComponent_line.styles({ "stroke": this.vector_color, "stroke-width": 0.4 * (window.screen_size || 100) })
    .attrs({ "marker-end": "url(#arrow_component_" + this.vectorID + ")" });

  this.centre_circle.styles({ "stroke": "none", "fill": this.vector_color, "fill-opacity": 1 });

  /*************************** Controls ***************************/
  this.vector_resolve_rect.styles({ "stroke": "none", "fill": this.vector_color }).attr("class", "invisible");

  this.angle_control_line.styles({ "stroke": this.vector_color, "stroke-width": this.control_line_size }).attr("class", "invisible");
  this.radius_control_circle.styles({ "stroke": "none", "fill": this.vector_color }).attr("class", "invisible");
  this.xComponent_control_circle.styles({ "stroke": "none", "fill": this.vector_color }).attr("class", "invisible");
  this.yComponent_control_circle.styles({ "stroke": "none", "fill": this.vector_color }).attr("class", "invisible");
  this.centre_control_circle.styles({ "stroke": "none", "fill": this.vector_color }).attr("class", "invisible");
  this.vector_recombine_circle.styles({ "stroke": "none", "fill": this.vector_color }).attr("class", "invisible");

  /*************************** Addition circle ***************************/
  this.addition_circle.styles({ "stroke": "none", "fill": this.gray_color, "fill-opacity": 0.3 });

  this.setup_text();
  this.setup_equation();
}

/***********************************************************************************/
createVector.prototype.update = function() {
  if (isNaN(this.r) || isNaN(this.angle_rad) || isNaN(this.cx) || isNaN(this.cy)) { return; }

  /*************************** Component dimensions ***************************/
  this.angle_deg = this.angle_rad * 180 / Math.PI;
  if (this.angle_deg < 0) { this.angle_deg += 360; }

  this.xComponent_length = this.r * Math.cos(this.angle_rad);
  this.yComponent_length = this.r * Math.sin(this.angle_rad);

  this.xComponent_coordinate = this.cx + this.r * Math.cos(this.angle_rad);
  this.yComponent_coordinate = this.cy - this.r * Math.sin(this.angle_rad);

  // Update dashed representation if visible
    if (this.showDashed && this.dashedGroup) {
      const originalX = this.r * Math.cos(this.lastFlippedAngle);
      const originalY = this.r * Math.sin(this.lastFlippedAngle);
      
      this.dashedGroup.select("line")
        .attr("x2", originalX)
        .attr("y2", -originalY);
      
      this.dashedGroup.select("circle")
        .attr("cx", originalX)
        .attr("cy", -originalY);
    }

  /*************************** Container ***************************/
  console.log("Updating vector", this.vectorID, "at", this.cx, this.cy, "multiplicationResultant:", this.multiplicationResultant, "divisionResultant:", this.divisionResultant, "Canvas transform:", this.parent.canvas.attr("transform") || "none");
  this.container.attrs({ "transform": "translate(" + this.cx + "," + this.cy + ")" });
  this.circle.attrs({ cx: 0, cy: 0, r: this.r });
  this.xAxis.attrs({ x1: -this.r, y1: 0, x2: this.r, y2: 0 });
  this.yAxis.attrs({ y1: -this.r, x1: 0, y2: this.r, x2: 0 });

  /*************************** Projection lines and paths ***************************/
  this.xComponent_triangle.attrs({ d: (typeof line_gen === "function" ? line_gen([[0, 0], [this.xComponent_length, 0], [this.xComponent_length, -this.yComponent_length]]) : "") });
  this.yComponent_triangle.attrs({ d: (typeof line_gen === "function" ? line_gen([[0, 0], [0, -this.yComponent_length], [this.xComponent_length, -this.yComponent_length]]) : "") });

  this.xProjection_line.attrs({ x1: this.xComponent_length, y1: 0, x2: this.xComponent_length, y2: -this.yComponent_length });
  this.yProjection_line.attrs({ x1: 0, y1: -this.yComponent_length, x2: this.xComponent_length, y2: -this.yComponent_length });

  this.xProjection_circle.attrs({ cx: this.xComponent_length, cy: 0, r: 0.4 * (window.screen_size || 100) });
  this.yProjection_circle.attrs({ cx: 0, cy: -this.yComponent_length, r: 0.4 * (window.screen_size || 100) });

  this.vector_head_circle.attrs({ cx: this.xComponent_length, cy: -this.yComponent_length, r: 0.4 * (window.screen_size || 100) });
  this.vector_line_dotted.attrs({ x1: 0, y1: 0, x2: this.xComponent_length, y2: -this.yComponent_length });

  /*************************** Vectors ***************************/
  this.vector_line_inactive.attrs({ x1: 0, y1: 0, x2: this.xComponent_length, y2: -this.yComponent_length });
  this.vector_line.attrs({ 
    x1: 0, 
    y1: 0, 
    x2: this.xComponent_length, 
    y2: -this.yComponent_length 
  }).styles({ 
    "display": null, 
    "opacity": 1, 
    "stroke": this.vector_color, 
    "stroke-width": (this.multiplicationResultant || this.divisionResultant) ? 0.7 * (window.screen_size || 100) : 0.4 * (window.screen_size || 100) 
  });

  if (!this.addedVectors && !this.multiplicationResultant && !this.divisionResultant) {
    this.xComponent_line.attrs({ x1: 0, y1: 0, x2: this.xComponent_length, y2: 0 });
    this.yComponent_line.attrs({ x1: 0, y1: 0, x2: 0, y2: -this.yComponent_length });
  }

  this.centre_circle.attrs({ cx: 0, cy: 0, r: 0.8 * (window.screen_size || 100) });

  /*************************** Addition circle ***************************/
  this.addition_circle.attrs({ cx: this.xComponent_length, cy: -this.yComponent_length, r: this.addition_circle_radius });

  /*************************** Controls ***************************/
  this.vector_resolve_rect_g.attrs({ "transform": "rotate(" + (-this.angle_deg) + ")" });
  this.vector_resolve_rect.attrs({ x: 0, y: -10 * (window.screen_dpi || 96), width: this.r, height: 20 * (window.screen_dpi || 96) });

  this.angle_control_line.attrs({ x1: 0, y1: 0, x2: this.xComponent_length, y2: -this.yComponent_length });
  this.radius_control_circle.attrs({ cx: this.xComponent_length, cy: -this.yComponent_length, r: this.control_circle_radius });
  this.xComponent_control_circle.attrs({ cx: this.xComponent_length, cy: 0, r: this.control_circle_radius });
  this.yComponent_control_circle.attrs({ cx: 0, cy: -this.yComponent_length, r: this.control_circle_radius });

  this.centre_control_circle.attrs({ cx: 0, cy: 0, r: this.control_circle_radius });
  this.vector_recombine_circle.attrs({ cx: this.xComponent_length, cy: -this.yComponent_length, r: this.control_circle_radius });

  this.update_text();
  this.update_equation();
}

/***********************************************************************************/
createVector.prototype.setup_view = function() {
  this.vector_line_inactive.styles({ "display": "none" });
  this.vector_recombine_circle.styles({ "display": "none" });
  this.addition_circle.styles({ "display": "none" });

  /*************************** Hide all controls ***************************/
  this.vector_resolve_rect.styles({ "display": "none" });
  this.angle_control_line.styles({ "display": "none" });
  this.radius_control_circle.styles({ "display": "none" });
  this.xComponent_control_circle.styles({ "display": "none" });
  this.yComponent_control_circle.styles({ "display": "none" });

  /*************************** Manipulation not possible ***************************/
  if (this.manipulationPossible === false) {
    this.vector_line_inactive.styles({ "display": null });
    this.vector_line.styles({ "display": "none" });
    this.circle.styles({ "display": "none" });
    this.xAxis.styles({ "display": "none" });
    this.yAxis.styles({ "display": "none" });
    this.centre_circle.styles({ "fill": this.gray_color });
    this.vector_resolve_rect.styles({ "display": "none" });
    this.angle_control_line.styles({ "display": "none" });
    this.radius_control_circle.styles({ "display": "none" });
    this.xComponent_control_circle.styles({ "display": "none" });
    this.yComponent_control_circle.styles({ "display": "none" });
    this.centre_control_circle.styles({ "display": "none" });
    this.xComponent_line.styles({ "display": "none" });
    this.yComponent_line.styles({ "display": "none" });
    d3.selectAll(".projection_" + this.vectorID).styles({ "display": "none" });

    this.text_2.text.styles({ "display": "none" });
    this.text_2.textBox.styles({ "display": "none" });
    this.text_3.text.styles({ "display": "none" });
    this.text_3.textBox.styles({ "display": "none" });
    return;
  }

  /*************************** Controls ***************************/
  if (this.manipulables && this.manipulables.r === false) { this.radius_control_circle.attrs({ "display": "none" }); }
  if (this.manipulables && this.manipulables.angle === false) { this.angle_control_line.attrs({ "display": "none" }); }
  if (this.manipulables && this.manipulables.xComponent === false) { this.xComponent_control_circle.attrs({ "display": "none" }); }
  if (this.manipulables && this.manipulables.yComponent === false) { this.yComponent_control_circle.attrs({ "display": "none" }); }

  if (this.resolution_allowed === false) { this.vector_resolve_rect.attrs({ "display": "none" }); }

  /*************************** Vector mode ***************************/
  if (this.vector_mode === "polar") {
    this.xComponent_line.styles({ "display": "none" });
    this.yComponent_line.styles({ "display": "none" });
    d3.selectAll(".projection_" + this.vectorID).styles({ "display": "none" });
  }

  if (this.vector_mode === "cartesian") {
    this.vector_line.styles({ "display": "none" });
    this.xProjection_circle.styles({ "display": "none" });
    this.yProjection_circle.styles({ "display": "none" });
  }

  this.setup_view_text();
  this.setup_view_equation();
}

/***********************************************************************************/
createVector.prototype.checkForAddition = function() {
  console.log("Checking for addition for vector ID:", this.vectorID, "at", this.cx, this.cy);
  if (!this.moving || !this.movementAllowed) return;

  // Reset other operation flags to prevent overlap
  this.multiplication_possible = false;
  this.division_possible = false;
  this.multiplication_data = {};
  this.division_data = {};
  if (this.multiplication_circle) {
    this.multiplication_circle.remove();
    this.multiplication_circle = null;
  }
  if (this.division_circle) {
    this.division_circle.remove();
    this.division_circle = null;
  }

  var vectors = screen_svg.vector_list || [];
  for (var i = 0; i < vectors.length; i++) {
    if (vectors[i].vectorID !== this.vectorID) {
      var dx = this.xComponent_coordinate - vectors[i].cx;
      var dy = this.yComponent_coordinate - vectors[i].cy;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.control_circle_radius * 2) {
        this.addition_possible = true;
        this.addition_data.patner = vectors[i];
        this.addition_data.position = "second";
        vectors[i].addition_possible = true;
        vectors[i].addition_data.patner = this;
        vectors[i].addition_data.position = "first";
        this.addition_circle.styles({ "display": null });
        console.log("Addition possible with vector ID:", vectors[i].vectorID);
        break;
      }
    }
  }
  if (!this.addition_possible) {
    this.addition_circle.styles({ "display": "none" });
    this.addition_data = {};
  }
}

/***********************************************************************************/
createVector.prototype.checkForMultiplication = function() {
  console.log("Checking for multiplication for vector ID:", this.vectorID, "at", this.cx, this.cy);
  if (!this.moving || !this.movementAllowed) return;

  // Reset other operation flags to prevent overlap
  this.addition_possible = false;
  this.division_possible = false;
  this.addition_data = {};
  this.division_data = {};
  if (this.addition_circle) {
    this.addition_circle.styles({ "display": "none" });
  }
  if (this.division_circle) {
    this.division_circle.remove();
    this.division_circle = null;
  }

  var vectors = screen_svg.vector_list || [];
  for (var i = 0; i < vectors.length; i++) {
    if (vectors[i].vectorID !== this.vectorID) {
      var dx = this.cx - vectors[i].cx;
      var dy = this.cy - vectors[i].cy;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.control_circle_radius * 2) {
        this.multiplication_possible = true;
        this.multiplication_data.partner = vectors[i];
        this.multiplication_data.position = "first";
        vectors[i].multiplication_possible = true;
        vectors[i].multiplication_data.partner = this;
        vectors[i].multiplication_data.position = "second";

        this.multiplication_circle = this.multiplication_circle || this.parent.canvas.append("circle")
          .attrs({ cx: this.cx, cy: this.cy, r: this.control_circle_radius * 1.5 })
          .styles({ fill: "gray", "fill-opacity": 0.5 });

        this.container.raise();
        vectors[i].container.raise();
        console.log("Multiplication possible with vector ID:", vectors[i].vectorID);
        break;
      }
    }
  }

  if (!this.multiplication_possible) {
    if (this.multiplication_circle) {
      this.multiplication_circle.remove();
      this.multiplication_circle = null;
    }
    this.multiplication_data = {};
  }
}

/***********************************************************************************/
createVector.prototype.checkForDivision = function() {
  console.log("Checking for division for vector ID:", this.vectorID, "at", this.cx, this.cy);
  if (!this.moving || !this.movementAllowed || !this.division_allowed) return;

  // Reset other operation flags to prevent overlap
  this.addition_possible = false;
  this.multiplication_possible = false;
  this.addition_data = {};
  this.multiplication_data = {};
  if (this.addition_circle) {
    this.addition_circle.styles({ "display": "none" });
  }
  if (this.multiplication_circle) {
    this.multiplication_circle.remove();
    this.multiplication_circle = null;
  }

  var vectors = screen_svg.vector_list || [];
  for (var i = 0; i < vectors.length; i++) {
    if (vectors[i].vectorID !== this.vectorID && vectors[i].division_allowed) {
      var dx = this.cx - vectors[i].cx;
      var dy = this.cy - vectors[i].cy;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.control_circle_radius * 2) {
        this.division_possible = true;
        this.division_data.partner = vectors[i];
        this.division_data.position = "numerator";
        vectors[i].division_possible = true;
        vectors[i].division_data.partner = this;
        vectors[i].division_data.position = "denominator";

        this.division_circle = this.division_circle || this.parent.canvas.append("circle")
          .attrs({ cx: this.cx, cy: this.cy, r: this.control_circle_radius * 1.5 })
          .styles({ fill: "gray", "fill-opacity": 0.5 });

        this.container.raise();
        vectors[i].container.raise();
        console.log("Division possible with vector ID:", vectors[i].vectorID);
        break;
      }
    }
  }

  if (!this.division_possible) {
    if (this.division_circle) {
      this.division_circle.remove();
      this.division_circle = null;
    }
    this.division_data = {};
  }
}

/***********************************************************************************/
createVector.prototype.resolveTextOverlaps = function(vectors) {
  let textBoxes = vectors.map(vector => [
    { data: vector.text_1.data, type: 'text_1', vector: vector },
    { data: vector.text_2.data, type: 'text_2', vector: vector },
    { data: vector.text_3.data, type: 'text_3', vector: vector },
    { data: vector.text_4.data, type: 'text_4', vector: vector }
  ]).flat();

  function isOverlapping(box1, box2) {
    let rect1 = {
      x: box1.data.posX - 0.5 * box1.data.textBox.width,
      y: box1.data.posY - 0.5 * box1.data.textBox.height,
      width: box1.data.textBox.width,
      height: box1.data.textBox.height
    };
    let rect2 = {
      x: box2.data.posX - 0.5 * box2.data.textBox.width,
      y: box2.data.posY - 0.5 * box2.data.textBox.height,
      width: box2.data.textBox.width,
      height: box2.data.textBox.height
    };
    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y);
  }

  let maxIterations = 10;
  let iteration = 0;
  let hasOverlap = true;

  while (hasOverlap && iteration < maxIterations) {
    hasOverlap = false;
    for (let i = 0; i < textBoxes.length; i++) {
      for (let j = i + 1; j < textBoxes.length; j++) {
        if (textBoxes[i].vector !== textBoxes[j].vector && isOverlapping(textBoxes[i], textBoxes[j])) {
          hasOverlap = true;
          let box1 = textBoxes[i];
          let box2 = textBoxes[j];
          let vector1 = box1.vector;
          let vector2 = box2.vector;

          let dx = (vector1.cx || 0) - (vector2.cx || 0);
          let dy = (vector1.cy || 0) - (vector2.cy || 0);
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            dist = 1;
          }
          let shiftX = (dx / dist) * vector1.font_size_normal * 0.5;
          let shiftY = (dy / dist) * vector1.font_size_normal * 0.5;

          let vector1Boxes = textBoxes.filter(box => box.vector === vector1);
          let vector2Boxes = textBoxes.filter(box => box.vector === vector2);

          vector1Boxes.forEach(box => {
            box.data.posX += shiftX;
            box.data.posY += shiftY;
          });
          vector2Boxes.forEach(box => {
            box.data.posX -= shiftX;
            box.data.posY -= shiftY;
          });
        }
      }
    }
    iteration++;
  }

  vectors.forEach(vector => {
    ['text_1', 'text_2', 'text_3', 'text_4'].forEach(textType => {
      let box_data = vector[textType].data.textBox;
      let data = vector[textType].data;
      vector[textType].textBox.attrs({
        x: data.posX - 0.5 * box_data.width,
        y: data.posY - 0.5 * box_data.height,
        width: box_data.width,
        height: box_data.height
      });
      vector[textType].text.attrs({ x: data.posX, y: data.posY });
    });
  });
}

/***********************************************************************************/
createVector.prototype.addVectors = function() {
  console.log("Adding vectors for vector ID:", this.vectorID);
  if (navigator.vibrate) { navigator.vibrate([50]); }
  var vector1 = this;
  var vector2 = this.addition_data.patner;

  if (!vector2) {
    console.warn("No partner vector for addition");
    return;
  }

  var x_result = vector1.xComponent_length + (vector2.xComponent_length + vector2.cx - vector1.cx);
  var y_result = vector1.yComponent_length + (vector2.yComponent_length + vector2.cy - vector1.cy);
  var r_result = Math.sqrt(x_result * x_result + y_result * y_result);
  var angle_result = Math.atan2(y_result, x_result);

  var resultant = new createVector({
    parent: screen_svg,
    cx: vector1.cx,
    cy: vector1.cy,
    r: r_result,
    manipulationPossible: true,
    angle_rad: angle_result,
    manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
    resolution_allowed: true,
    movementAllowed: true,
    vector_mode: "polar",
    cartesian_mode_controls: "polar",
    vectorID: (screen_svg.vectorID || 0) + 1,
    addedVectors: true,
    delete_allowed: true,
    object: { vector_1: vector1, vector_2: vector2, resultant: null }
  });
  resultant.object.resultant = resultant;
  resultant.symbol = vector1.symbol + "+" + vector2.symbol;

  screen_svg.vectorID = (screen_svg.vectorID || 0) + 1;
  screen_svg.vector_list = screen_svg.vector_list || [];
  screen_svg.vector_list.push(resultant);

  resultant.vector_line
    .styles({ "opacity": 0, "display": null })
    .transition().duration(1000)
    .styles({ "opacity": 1 })
    .attrTween("transform", function() {
      return function(t) {
        var interpolated = d3.interpolateString("scale(0) rotate(0)", "scale(1) rotate(" + (angle_result * 180 / Math.PI) + ")")(t);
        resultant.r = r_result * t;
        resultant.angle_rad = angle_result;
        resultant.update_text();
        resultant.resolveTextOverlaps([vector1, vector2, resultant]);
        return interpolated;
      };
    })
    .on("start", function() {
      resultant.update_text();
      resultant.resolveTextOverlaps([vector1, vector2, resultant]);
    })
    .on("end", function() {
      resultant.update_text();
      resultant.resolveTextOverlaps([vector1, vector2, resultant]);
      resultant.container.raise();
      console.log("Addition animation completed for resultant vector ID:", resultant.vectorID);
    });

  screen_svg.addition_log = screen_svg.addition_log || [];
  screen_svg.addition_log.push({
    vector_1: vector1,
    vector_2: vector2,
    resultant: resultant
  });
  console.log("Addition logged:", { vector1: vector1.symbol, vector2: vector2.symbol, resultant: resultant.symbol });

  // Cleanup all operation states
  if (vector1.addition_centre_circle) vector1.addition_centre_circle.remove();
  if (vector2.addition_centre_circle) vector2.addition_centre_circle.remove();
  if (vector1.temp_circle) vector1.temp_circle.remove();
  vector1.addition_possible = false;
  vector2.addition_possible = false;
  vector1.addition_data = {};
  vector2.addition_data = {};
  vector1.multiplication_possible = false;
  vector2.multiplication_possible = false;
  vector1.multiplication_data = {};
  vector2.multiplication_data = {};
  vector1.division_possible = false;
  vector2.division_possible = false;
  vector1.division_data = {};
  vector2.division_data = {};
  if (vector1.multiplication_circle) {
    vector1.multiplication_circle.remove();
    vector1.multiplication_circle = null;
  }
  if (vector2.multiplication_circle) {
    vector2.multiplication_circle.remove();
    vector2.multiplication_circle = null;
  }
  if (vector1.division_circle) {
    vector1.division_circle.remove();
    vector1.division_circle = null;
  }
  if (vector2.division_circle) {
    vector2.division_circle.remove();
    vector2.division_circle = null;
  }
}

/***********************************************************************************/
createVector.prototype.multiplyVectors = function() {
  console.log("Multiplying vectors for vector ID:", this.vectorID);
  if (navigator.vibrate) { navigator.vibrate([50]); }
  var vector1 = this;
  var vector2 = this.multiplication_data.partner;

  if (!vector2) {
    console.warn("No partner vector for multiplication");
    return;
  }

  var r1 = (typeof radius_scale === "function" ? radius_scale(vector1.r) : vector1.r);
  var r2 = (typeof radius_scale === "function" ? radius_scale(vector2.r) : vector2.r);
  var r_result = r1 * r2;
  var angle_result = vector1.angle_rad + vector2.angle_rad;
  if (angle_result < 0) angle_result += 2 * Math.PI;
  if (angle_result > 2 * Math.PI) angle_result -= 2 * Math.PI;

  var display_r = (typeof radius_scale_inverse === "function" ? radius_scale_inverse(r_result) : r_result);
  var x_result = display_r * Math.cos(angle_result);
  var y_result = display_r * Math.sin(angle_result);

  var resultant = new createVector({
    parent: screen_svg,
    cx: vector1.cx,
    cy: vector1.cy,
    r: display_r,
    manipulationPossible: true,
    angle_rad: angle_result,
    xComponent_length: x_result,
    yComponent_length: y_result,
    manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
    resolution_allowed: true,
    movementAllowed: true,
    vector_mode: "polar",
    cartesian_mode_controls: "polar",
    vectorID: (screen_svg.vectorID || 0) + 1,
    multiplicationResultant: true,
    delete_allowed: true,
    object: { vector_1: vector1, vector_2: vector2, resultant: null }
  });
  resultant.object.resultant = resultant;
  resultant.symbol = vector1.symbol + "×" + vector2.symbol;

  screen_svg.vectorID = (screen_svg.vectorID || 0) + 1;
  screen_svg.vector_list = screen_svg.vector_list || [];
  screen_svg.vector_list.push(resultant);

  resultant.vector_line
    .styles({ "opacity": 0, "display": null })
    .transition().duration(2000)
    .styles({ "opacity": 1 })
    .attrTween("x2", function() {
      return function(t) {
        var x = d3.interpolateNumber(0, x_result)(t);
        resultant.xComponent_length = x;
        resultant.r = Math.sqrt(x * x + resultant.yComponent_length * resultant.yComponent_length);
        resultant.angle_rad = Math.atan2(resultant.yComponent_length, x);
        resultant.update_text();
        resultant.resolveTextOverlaps([vector1, vector2, resultant]);
        return x;
      };
    })
    .attrTween("y2", function() {
      return function(t) {
        var y = d3.interpolateNumber(0, -y_result)(t);
        resultant.yComponent_length = -y;
        resultant.r = Math.sqrt(resultant.xComponent_length * resultant.xComponent_length + y * y);
        resultant.angle_rad = Math.atan2(-y, resultant.xComponent_length);
        resultant.update_text();
        resultant.resolveTextOverlaps([vector1, vector2, resultant]);
        return y;
      };
    })
    .on("start", function() {
      resultant.update_text();
      resultant.resolveTextOverlaps([vector1, vector2, resultant]);
    })
    .on("end", function() {
      resultant.update_text();
      resultant.resolveTextOverlaps([vector1, vector2, resultant]);
      resultant.container.raise();
      console.log("Multiplication animation completed for resultant vector ID:", resultant.vectorID);
    });

  screen_svg.multiplication_log = screen_svg.multiplication_log || [];
  screen_svg.multiplication_log.push({
    vector_1: vector1,
    vector_2: vector2,
    resultant: resultant
  });
  console.log("Multiplication logged:", { vector1: vector1.symbol, vector2: vector2.symbol, resultant: resultant.symbol });

  // Cleanup all operation states
  if (vector1.multiplication_circle) {
    vector1.multiplication_circle.remove();
    vector1.multiplication_circle = null;
  }
  if (vector2.multiplication_circle) {
    vector2.multiplication_circle.remove();
    vector2.multiplication_circle = null;
  }
  if (vector1.temp_circle) vector1.temp_circle.remove();
  vector1.multiplication_possible = false;
  vector2.multiplication_possible = false;
  vector1.multiplication_data = {};
  vector2.multiplication_data = {};
  vector1.addition_possible = false;
  vector2.addition_possible = false;
  vector1.addition_data = {};
  vector2.addition_data = {};
  vector1.division_possible = false;
  vector2.division_possible = false;
  vector1.division_data = {};
  vector2.division_data = {};
  if (vector1.addition_circle) {
    vector1.addition_circle.styles({ "display": "none" });
  }
  if (vector2.addition_circle) {
    vector2.addition_circle.styles({ "display": "none" });
  }
  if (vector1.division_circle) {
    vector1.division_circle.remove();
    vector1.division_circle = null;
  }
  if (vector2.division_circle) {
    vector2.division_circle.remove();
    vector2.division_circle = null;
  }

  if (typeof screen_svg.toggleMultiplicationTable === "function") {
    screen_svg.toggleMultiplicationTable(true);
  }
}

/***********************************************************************************/
createVector.prototype.animateMultiplication = function() {
  console.log("Animating multiplication for resultant vector ID:", this.vectorID);
  if (!this.multiplicationResultant) return;

  var logEntry = screen_svg.multiplication_log && screen_svg.multiplication_log.find(function(entry) {
    return entry.resultant.vectorID === this.vectorID;
  }.bind(this));

  // Fallback animation if log entry is not found
  if (!logEntry) {
    console.warn("No multiplication log entry found for vector ID:", this.vectorID, "using fallback animation");
    this.circle
      .transition()
      .duration(500)
      .attr("r", this.r * 1.5)
      .transition()
      .duration(500)
      .attr("r", this.r)
      .on("end", function() {
        console.log("Fallback pulse animation completed for vector ID:", this.vectorID);
      }.bind(this));
    return;
  }

  var vector1 = logEntry.vector_1;
  var vector2 = logEntry.vector_2;
  var r1 = (typeof radius_scale === "function" ? radius_scale(vector1.r) : vector1.r);
  var r2 = (typeof radius_scale === "function" ? radius_scale(vector2.r) : vector2.r);
  var angle1 = vector1.angle_rad;
  var angle2 = vector2.angle_rad;
  var r_result = r1 * r2;
  var angle_result = angle1 + angle2;
  if (angle_result < 0) angle_result += 2 * Math.PI;
  if (angle_result > 2 * Math.PI) angle_result -= 2 * Math.PI;

  var display_r = (typeof radius_scale_inverse === "function" ? radius_scale_inverse(r_result) : r_result);

  this.r = r1;
  this.angle_rad = angle1;
  this.update();

  // Animate vector line and circle for a more noticeable effect
  this.vector_line
    .transition()
    .duration(1500)
    .attrTween("x2", function() {
      return function(t) {
        var x = d3.interpolateNumber(this.xComponent_length, display_r * Math.cos(angle1))(t);
        this.xComponent_length = x;
        this.r = Math.sqrt(x * x + this.yComponent_length * this.yComponent_length);
        this.angle_rad = Math.atan2(this.yComponent_length, x);
        this.update_text();
        this.resolveTextOverlaps([vector1, vector2, this]);
        return x;
      }.bind(this);
    }.bind(this))
    .attrTween("y2", function() {
      return function(t) {
        var y = d3.interpolateNumber(-this.yComponent_length, -display_r * Math.sin(angle1))(t);
        this.yComponent_length = -y;
        this.r = Math.sqrt(this.xComponent_length * this.xComponent_length + y * y);
        this.angle_rad = Math.atan2(-y, this.xComponent_length);
        this.update_text();
        this.resolveTextOverlaps([vector1, vector2, this]);
        return y;
      }.bind(this);
    }.bind(this))
    .on("start", function() {
      this.r = display_r;
      this.update_text();
      this.resolveTextOverlaps([vector1, vector2, this]);
      // Start circle pulse
      this.circle
        .transition()
        .duration(750)
        .attr("r", this.r * 1.2)
        .transition()
        .duration(750)
        .attr("r", this.r);
    }.bind(this))
    .on("end", function() {
      this.vector_line
        .transition()
        .duration(1500)
        .attrTween("x2", function() {
          return function(t) {
            var x = d3.interpolateNumber(display_r * Math.cos(angle1), display_r * Math.cos(angle_result))(t);
            this.xComponent_length = x;
            this.r = Math.sqrt(x * x + this.yComponent_length * this.yComponent_length);
            this.angle_rad = Math.atan2(this.yComponent_length, x);
            this.update_text();
            this.resolveTextOverlaps([vector1, vector2, this]);
            return x;
          }.bind(this);
        }.bind(this))
        .attrTween("y2", function() {
          return function(t) {
            var y = d3.interpolateNumber(-display_r * Math.sin(angle1), -display_r * Math.sin(angle_result))(t);
            this.yComponent_length = -y;
            this.r = Math.sqrt(this.xComponent_length * this.xComponent_length + y * y);
            this.angle_rad = Math.atan2(-y, this.xComponent_length);
            this.update_text();
            this.resolveTextOverlaps([vector1, vector2, this]);
            return y;
          }.bind(this);
        }.bind(this))
        .on("start", function() {
          this.angle_rad = angle_result;
          this.update_text();
          this.resolveTextOverlaps([vector1, vector2, this]);
          // Second circle pulse
          this.circle
            .transition()
            .duration(750)
            .attr("r", this.r * 1.2)
            .transition()
            .duration(750)
            .attr("r", this.r);
        }.bind(this))
        .on("end", function() {
          this.r = display_r;
          this.angle_rad = angle_result;
          this.update();
          this.resolveTextOverlaps([vector1, vector2, this]);
          console.log("Multiplication animation replay completed for vector ID:", this.vectorID);
        }.bind(this));
    }.bind(this));
}

/***********************************************************************************/
createVector.prototype.divideVectors = function() {
  console.log("Dividing vectors for vector ID:", this.vectorID);
  if (navigator.vibrate) { navigator.vibrate([50]); }
  var vector1 = this;
  var vector2 = this.division_data.partner;

  if (!vector2) {
    console.warn("No partner vector for division");
    return;
  }

  var r1 = (typeof radius_scale === "function" ? radius_scale(vector1.r) : vector1.r);
  var r2 = (typeof radius_scale === "function" ? radius_scale(vector2.r) : vector2.r);
  if (r2 === 0) {
    console.warn("Division by zero is not allowed");
    swal({
      title: "Error",
      text: "Division by zero is not allowed.",
      icon: "error"
    });
    return;
  }
  var r_result = r1 / r2;
  var angle_result = vector1.angle_rad - vector2.angle_rad;
  if (angle_result < 0) angle_result += 2 * Math.PI;
  if (angle_result > 2 * Math.PI) angle_result -= 2 * Math.PI;

  var display_r = (typeof radius_scale_inverse === "function" ? radius_scale_inverse(r_result) : r_result);
  var x_result = display_r * Math.cos(angle_result);
  var y_result = display_r * Math.sin(angle_result);

  var resultant = new createVector({
    parent: screen_svg,
    cx: vector1.cx,
    cy: vector1.cy,
    r: display_r,
    manipulationPossible: true,
    angle_rad: angle_result,
    xComponent_length: x_result,
    yComponent_length: y_result,
    manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
    resolution_allowed: true,
    movementAllowed: true,
    vector_mode: "polar",
    cartesian_mode_controls: "polar",
    vectorID: (screen_svg.vectorID || 0) + 1,
    divisionResultant: true,
    delete_allowed: true,
    object: { vector_1: vector1, vector_2: vector2, resultant: null }
  });
  resultant.object.resultant = resultant;
  resultant.symbol = vector1.symbol + "÷" + vector2.symbol;

  screen_svg.vectorID = (screen_svg.vectorID || 0) + 1;
  screen_svg.vector_list = screen_svg.vector_list || [];
  screen_svg.vector_list.push(resultant);

  resultant.vector_line
    .styles({ "opacity": 0, "display": null })
    .transition().duration(2000)
    .styles({ "opacity": 1 })
    .attrTween("x2", function() {
      return function(t) {
        var x = d3.interpolateNumber(0, x_result)(t);
        resultant.xComponent_length = x;
        resultant.r = Math.sqrt(x * x + resultant.yComponent_length * resultant.yComponent_length);
        resultant.angle_rad = Math.atan2(resultant.yComponent_length, x);
        resultant.update_text();
        resultant.resolveTextOverlaps([vector1, vector2, resultant]);
        return x;
      };
    })
    .attrTween("y2", function() {
      return function(t) {
        var y = d3.interpolateNumber(0, -y_result)(t);
        resultant.yComponent_length = -y;
        resultant.r = Math.sqrt(resultant.xComponent_length * resultant.xComponent_length + y * y);
        resultant.angle_rad = Math.atan2(-y, resultant.xComponent_length);
        resultant.update_text();
        resultant.resolveTextOverlaps([vector1, vector2, resultant]);
        return y;
      };
    })
    .on("start", function() {
      resultant.update_text();
      resultant.resolveTextOverlaps([vector1, vector2, resultant]);
    })
    .on("end", function() {
      resultant.update_text();
      resultant.resolveTextOverlaps([vector1, vector2, resultant]);
      resultant.container.raise();
      console.log("Division animation completed for resultant vector ID:", resultant.vectorID);
    });

  screen_svg.division_log = screen_svg.division_log || [];
  screen_svg.division_log.push({
    vector_1: vector1,
    vector_2: vector2,
    resultant: resultant
  });
  console.log("Division logged:", { vector1: vector1.symbol, vector2: vector2.symbol, resultant: resultant.symbol });

  // Cleanup all operation states
  if (vector1.division_circle) {
    vector1.division_circle.remove();
    vector1.division_circle = null;
  }
  if (vector2.division_circle) {
    vector2.division_circle.remove();
    vector2.division_circle = null;
  }
  if (vector1.temp_circle) vector1.temp_circle.remove();
  vector1.division_possible = false;
  vector2.division_possible = false;
  vector1.division_data = {};
  vector2.division_data = {};
  vector1.addition_possible = false;
  vector2.addition_possible = false;
  vector1.addition_data = {};
  vector2.addition_data = {};
  vector1.multiplication_possible = false;
  vector2.multiplication_possible = false;
  vector1.multiplication_data = {};
  vector2.multiplication_data = {};
  if (vector1.addition_circle) {
    vector1.addition_circle.styles({ "display": "none" });
  }
  if (vector2.addition_circle) {
    vector2.addition_circle.styles({ "display": "none" });
  }
  if (vector1.multiplication_circle) {
    vector1.multiplication_circle.remove();
    vector1.multiplication_circle = null;
  }
  if (vector2.multiplication_circle) {
    vector2.multiplication_circle.remove();
    vector2.multiplication_circle = null;
  }

  if (typeof screen_svg.toggleDivisionTable === "function") {
    screen_svg.toggleDivisionTable(true);
  }
}

/***********************************************************************************/
createVector.prototype.animateDivision = function() {
  console.log("Animating division for resultant vector ID:", this.vectorID);
  if (!this.divisionResultant) return;

  var logEntry = screen_svg.division_log && screen_svg.division_log.find(function(entry) {
    return entry.resultant.vectorID === this.vectorID;
  }.bind(this));

  if (!logEntry) {
    console.warn("No division log entry found for vector ID:", this.vectorID);
    return;
  }

  var vector1 = logEntry.vector_1;
  var vector2 = logEntry.vector_2;
  var r1 = (typeof radius_scale === "function" ? radius_scale(vector1.r) : vector1.r);
  var r2 = (typeof radius_scale === "function" ? radius_scale(vector2.r) : vector2.r);
  if (r2 === 0) {
    console.warn("Division by zero is not allowed in animation");
    return;
  }
  var angle1 = vector1.angle_rad;
  var angle2 = vector2.angle_rad;
  var r_result = r1 / r2;
  var angle_result = angle1 - angle2;
  if (angle_result < 0) angle_result += 2 * Math.PI;
  if (angle_result > 2 * Math.PI) angle_result -= 2 * Math.PI;

  var display_r = (typeof radius_scale_inverse === "function" ? radius_scale_inverse(r_result) : r_result);

  this.r = display_r;
  this.angle_rad = angle1;
  this.update();

  this.vector_line
    .transition().duration(1500)
    .attrTween("x2", function() {
      return function(t) {
        var x = d3.interpolateNumber(this.xComponent_length, display_r * Math.cos(angle1))(t);
        this.xComponent_length = x;
        this.r = Math.sqrt(x * x + this.yComponent_length * this.yComponent_length);
        this.angle_rad = Math.atan2(this.yComponent_length, x);
        this.update_text();
        this.resolveTextOverlaps([vector1, vector2, this]);
        return x;
      }.bind(this);
    }.bind(this))
    .attrTween("y2", function() {
      return function(t) {
        var y = d3.interpolateNumber(-this.yComponent_length, -display_r * Math.sin(angle1))(t);
        this.yComponent_length = -y;
        this.r = Math.sqrt(this.xComponent_length * this.xComponent_length + y * y);
        this.angle_rad = Math.atan2(-y, this.xComponent_length);
        this.update_text();
        this.resolveTextOverlaps([vector1, vector2, this]);
        return y;
      }.bind(this);
    }.bind(this))
    .on("start", function() {
      this.r = display_r;
      this.update_text();
      this.resolveTextOverlaps([vector1, vector2, this]);
    }.bind(this))
    .on("end", function() {
      this.vector_line
        .transition().duration(1500)
        .attrTween("x2", function() {
          return function(t) {
            var x = d3.interpolateNumber(display_r * Math.cos(angle1), display_r * Math.cos(angle_result))(t);
            this.xComponent_length = x;
            this.r = Math.sqrt(x * x + this.yComponent_length * this.yComponent_length);
            this.angle_rad = Math.atan2(this.yComponent_length, x);
            this.update_text();
            this.resolveTextOverlaps([vector1, vector2, this]);
            return x;
          }.bind(this);
        }.bind(this))
        .attrTween("y2", function() {
          return function(t) {
            var y = d3.interpolateNumber(-display_r * Math.sin(angle1), -display_r * Math.sin(angle_result))(t);
            this.yComponent_length = -y;
            this.r = Math.sqrt(this.xComponent_length * this.xComponent_length + y * y);
            this.angle_rad = Math.atan2(-y, this.xComponent_length);
            this.update_text();
            this.resolveTextOverlaps([vector1, vector2, this]);
            return y;
          }.bind(this);
        }.bind(this))
        .on("start", function() {
          this.angle_rad = angle_result;
          this.update_text();
          this.resolveTextOverlaps([vector1, vector2, this]);
        }.bind(this))
        .on("end", function() {
          this.r = display_r;
          this.angle_rad = angle_result;
          this.update();
          this.resolveTextOverlaps([vector1, vector2, this]);
          console.log("Division animation replay completed for vector ID:", this.vectorID);
        }.bind(this));
    }.bind(this));
}

/***********************************************************************************/
createVector.prototype.conjugate = function() {
  console.log("Conjugating vector ID:", this.vectorID);
  if (navigator.vibrate) { navigator.vibrate([50]); }
  this.angle_rad = -this.angle_rad;
  this.update();
}

// createVector.prototype.flip_vector = function() {
//   console.log("Conjugating vector ID:", this.vectorID);
//   if (navigator.vibrate) { navigator.vibrate([50]); }
//   this.angle_rad = -this.angle_rad;
//   this.update();
// }

createVector.prototype.createDashedRepresentation = function (x, y) {
  this.removeDashedRepresentation(); // Clean up any existing

  this.dashedGroup = this.container.append("g")
    .classed("dashed-line-group", true)
    .classed("original-vector", true);

  this.dashedGroup.append("line")
    .styles({
      "stroke": this.vector_color,
      "stroke-opacity": 0.6,
      "stroke-width": 0.2 * screen_size,
      "stroke-dasharray": "3,3"
    })
    .attrs({
      x1: 0,
      y1: 0,
      x2: x,
      y2: -y // Flip Y for screen coordinates
    });

  this.dashedGroup.append("circle")
    .styles({
      "stroke": this.vector_color,
      "stroke-width": 0.2 * screen_size,
      "fill": this.vector_color,
      "fill-opacity": 0
    })
    .attrs({
      cx: x,
      cy: -y,
      r: 0.4 * screen_size
    });
};

createVector.prototype.removeDashedRepresentation = function () {
  if (this.dashedGroup) {
    this.dashedGroup.remove();
    this.dashedGroup = null;
  }
};

/***********************************************************************************/
/* Enhanced Dashed Representation with Endpoint Circle */

createVector.prototype.dashed_representation = function(original_x, original_y) {
  // Remove any existing dashed representation
  this.container.selectAll(".dashed-line-group").remove();
  
  // Create a group for the dashed elements
  const dashedGroup = this.container.append("g").classed("dashed-line-group", true);
  
  // Create the dashed line
  dashedGroup.append("line")
    .attr("class", "projection_" + this.vectorID)
    .styles({
      "stroke": this.vector_color,
      "stroke-opacity": 0.6,
      "stroke-width": 0.2 * screen_size,
      "stroke-dasharray": "3,3"
    })
    .attrs({
      x1: 0,
      y1: 0,
      x2: original_x,
      y2: -original_y
    });
  
  // Add EMPTY circle at endpoint (changed fill-opacity to 0)
  dashedGroup.append("circle")
    .attr("class", "projection_" + this.vectorID)
    .styles({
      "stroke": this.vector_color,
      "stroke-width": 0.2 * screen_size,
      "fill": this.vector_color,
      "fill-opacity": 0  
    })
    .attrs({
      cx: original_x,
      cy: -original_y,
      r: 0.4 * screen_size
    });
};

/***********************************************************************************/
/* Enhanced Flip with Animation and Selection Awareness */

createVector.prototype.flip_vector = function () {
  if (this.isFlipping) return;

  if (navigator.vibrate) navigator.vibrate([30]);

  const startAngle = this.normalizeAngle(this.angle_rad);
  const targetAngle = this.normalizeAngle(startAngle + Math.PI);
  const duration = this.flipAnimationDuration || 500;
  const startTime = Date.now();

  // Check if we're flipping for the first time or flipping back
  const flippingToNegative = !this.isFlipped;

  // Store original position for dashed line (only if flipping to -z)
  let originalX, originalY;
  if (flippingToNegative) {
    originalX = this.r * Math.cos(startAngle);
    originalY = this.r * Math.sin(startAngle);
    this.removeDashedRepresentation(); // Clean up before drawing new one
    this.createDashedRepresentation(originalX, originalY); // Show old position
  } else {
    this.removeDashedRepresentation(); // On flipping back, remove dashed
  }

  this.isFlipped = flippingToNegative; // Update flip state
  this.isFlipping = true;

  const animateFlip = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 0.5 * (1 - Math.cos(progress * Math.PI));

    this.angle_rad = startAngle + (targetAngle - startAngle) * easedProgress;
    this.update();

    if (progress < 1) {
      requestAnimationFrame(animateFlip);
    } else {
      this.angle_rad = targetAngle;
      this.update();
      this.isFlipping = false;
    }
  };

  requestAnimationFrame(animateFlip);
};

createVector.prototype.normalizeAngle = function (angle) {
  return (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
};

/***********************************************************************************/
createVector.prototype.createEvents = function() {
  if (this.movementAllowed) {
    this.centre_control_circle.on("mousedown", this.startDragCenter.bind(this));
    this.centre_control_circle.on("touchstart", this.startDragCenter.bind(this));
  }
  if (this.manipulables.r || this.manipulables.angle) {
    this.radius_control_circle.on("mousedown", this.startDrag.bind(this));
    this.radius_control_circle.on("touchstart", this.startDrag.bind(this));
  }
  if (this.manipulables.xComponent) {
    this.xComponent_control_circle.on("mousedown", this.startDragX.bind(this));
    this.xComponent_control_circle.on("touchstart", this.startDragX.bind(this));
  }
  if (this.manipulables.yComponent) {
    this.yComponent_control_circle.on("mousedown", this.startDragY.bind(this));
    this.yComponent_control_circle.on("touchstart", this.startDragY.bind(this));
  }
  if (this.delete_allowed) {
    this.delete_button.image.on("mousedown", this.deleteVector.bind(this));
    this.delete_button.image.on("touchstart", this.deleteVector.bind(this));
  }
}
/***********************************************************************************/
//createVector.prototype.createEventsmuldiv = function() {
//  if (this.movementAllowed) {
//    this.centre_control_circle.on("mousedown", this.startDragCenter.bind(this));
//    this.centre_control_circle.on("touchstart", this.startDragCenter.bind(this));
//  }
//  if (this.manipulables.r || this.manipulables.angle) {
//    this.radius_control_circle.on("mousedown", this.startDrag.bind(this));
//    this.radius_control_circle.on("touchstart", this.startDrag.bind(this));
//  }
//  if (this.manipulables.xComponent) {
//    this.xComponent_control_circle.on("mousedown", this.startDragX.bind(this));
//    this.xComponent_control_circle.on("touchstart", this.startDragX.bind(this));
//  }
//  if (this.manipulables.yComponent) {
//    this.yComponent_control_circle.on("mousedown", this.startDragY.bind(this));
//    this.yComponent_control_circle.on("touchstart", this.startDragY.bind(this));
//  }
//  if (this.delete_allowed) {
//    this.delete_button.image.on("mousedown", this.deleteVector.bind(this));
//    this.delete_button.image.on("touchstart", this.deleteVector.bind(this));
//  }
//}
/***********************************************************************************/
createVector.prototype.startDragCenter = function() {
  this.moving = true;
  this.parent.activeVector = this;
  d3.event.preventDefault();
  this.parent.canvas.on("mousemove", this.dragCenter.bind(this));
  this.parent.canvas.on("touchmove", this.dragCenter.bind(this));
  this.parent.canvas.on("mouseup", this.endDrag.bind(this));
  this.parent.canvas.on("touchend", this.endDrag.bind(this));
}

/***********************************************************************************/
createVector.prototype.startDrag = function() {
  this.parent.activeVector = this;
  d3.event.preventDefault();
  this.parent.canvas.on("mousemove", this.drag.bind(this));
  this.parent.canvas.on("touchmove", this.drag.bind(this));
  this.parent.canvas.on("mouseup", this.endDrag.bind(this));
  this.parent.canvas.on("touchend", this.endDrag.bind(this));
}

/***********************************************************************************/
createVector.prototype.startDragX = function() {
  this.parent.activeVector = this;
  d3.event.preventDefault();
  this.parent.canvas.on("mousemove", this.dragX.bind(this));
  this.parent.canvas.on("touchmove", this.dragX.bind(this));
  this.parent.canvas.on("mouseup", this.endDrag.bind(this));
  this.parent.canvas.on("touchend", this.endDrag.bind(this));
}

/***********************************************************************************/
createVector.prototype.startDragY = function() {
  this.parent.activeVector = this;
  d3.event.preventDefault();
  this.parent.canvas.on("mousemove", this.dragY.bind(this));
  this.parent.canvas.on("touchmove", this.dragY.bind(this));
  this.parent.canvas.on("mouseup", this.endDrag.bind(this));
  this.parent.canvas.on("touchend", this.endDrag.bind(this));
}

/***********************************************************************************/
createVector.prototype.dragCenter = function() {
  var e = d3.event.type === "touchmove" ? d3.event.touches[0] : d3.event;
  this.cx = e.clientX - window.innerWidth / 2;
  this.cy = -(e.clientY - window.innerHeight / 2);
  this.checkForAddition();
  this.checkForMultiplication();
  this.checkForDivision();
  this.update();
}

/***********************************************************************************/
createVector.prototype.drag = function() {
  var e = d3.event.type === "touchmove" ? d3.event.touches[0] : d3.event;
  var x = e.clientX - window.innerWidth / 2;
  var y = -(e.clientY - window.innerHeight / 2);
  if (this.manipulables.r && !(this.multiplicationResultant && !this.manipulationMode)) {
    this.r = Math.sqrt(Math.pow(x - this.cx, 2) + Math.pow(y - this.cy, 2));
  }
  if (this.manipulables.angle) {
    this.angle_rad = Math.atan2(y - this.cy, x - this.cx);
  }
  this.update();
}

/***********************************************************************************/
createVector.prototype.dragX = function() {
  var e = d3.event.type === "touchmove" ? d3.event.touches[0] : d3.event;
  var x = e.clientX - window.innerWidth / 2;
  this.xComponent_length = x - this.cx;
  this.r = Math.sqrt(Math.pow(this.xComponent_length, 2) + Math.pow(this.yComponent_length, 2));
  this.angle_rad = Math.atan2(this.yComponent_length, this.xComponent_length);
  this.update();
}

/***********************************************************************************/
createVector.prototype.dragY = function() {
  var e = d3.event.type === "touchmove" ? d3.event.touches[0] : d3.event;
  var y = -(e.clientY - window.innerHeight / 2);
  this.yComponent_length = y - this.cy;
  this.r = Math.sqrt(Math.pow(this.xComponent_length, 2) + Math.pow(this.yComponent_length, 2));
  this.angle_rad = Math.atan2(this.yComponent_length, this.xComponent_length);
  this.update();
}

/***********************************************************************************/
createVector.prototype.endDrag = function() {
  // Prioritize addition if multiple operations are possible
  if (this.addition_possible) {
    this.addVectors();
  } else if (this.multiplication_possible) {
    this.multiplyVectors();
  } else if (this.division_possible) {
    this.divideVectors();
  }
  this.moving = false;
  this.parent.canvas.on("mousemove", null);
  this.parent.canvas.on("touchmove", null);
  this.parent.canvas.on("mouseup", null);
  this.parent.canvas.on("touchend", null);
}

/***********************************************************************************/
createVector.prototype.deleteVector = function() {
  console.log("Deleting vector ID:", this.vectorID);
  if (navigator.vibrate) { navigator.vibrate([50]); }
  this.container.remove();
  screen_svg.vector_list = screen_svg.vector_list.filter(function(v) { return v.vectorID !== this.vectorID; }.bind(this));
  delete screen_svg.vector_log[this.vectorID];
}

/***********************************************************************************/
createVector.prototype.create_equation = function() {
  // Placeholder for equation creation if needed
}

/***********************************************************************************/
createVector.prototype.setup_equation = function() {
  // Placeholder for equation setup if needed
}

/***********************************************************************************/
createVector.prototype.update_equation = function() {
  // Placeholder for equation update if needed
}