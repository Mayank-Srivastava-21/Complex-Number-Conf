/*************************** Utility Functions ***************************/

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

// Define screen size and DPI locally
const DEFAULT_SCREEN_SIZE = 0.013 * Math.sqrt(window.innerWidth * window.innerHeight);
const DEFAULT_SCREEN_DPI = 0.07 * parseInt(d3.select("body").append("div").styles({ "width": "1in", "height": "1in" }).style("width"));
d3.select("body").select("div").remove();

/*************************** Check for Multiplication ***************************/

createVector.prototype.checkForMultiplication = function() {
  console.log("Checking for multiplication for vector ID:", this.vectorID);
  if (!this.moving || !this.movementAllowed) return;

  var vectors = screen_svg.vector_list || [];
  for (var i = 0; i < vectors.length; i++) {
    if (vectors[i].vectorID !== this.vectorID) {
      var dx = this.cx - vectors[i].cx;
      var dy = this.cy - vectors[i].cy;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.control_circle_radius * 2) {
        this.multiplication_possible = true;
        this.multiplication_data.partner = vectors[i];
        vectors[i].multiplication_possible = true;
        vectors[i].multiplication_data.partner = this;
        break;
      }
    }
  }

  if (!this.multiplication_possible && this.multiplication_grey_circle) {
    this.multiplication_grey_circle.remove();
    this.multiplication_grey_circle = null;
    this.multiplication_data = {};
  }
};

/*************************** Create Multiplication Grey Circle ***************************/

createVector.prototype.createMultiplicationGreyCircle = function() {
  if (!this.multiplication_possible || !this.multiplication_data.partner) return;

  var vector = this;
  var partner = this.multiplication_data.partner;

  // Create grey circle at the center of this vector
  this.multiplication_grey_circle = this.parent.canvas.append("circle")
    .attrs({ 
      cx: this.cx, 
      cy: this.cy, 
      r: this.control_circle_radius * 1.5 
    })
    .styles({ 
      fill: "gray", 
      "fill-opacity": 0.5 
    })
    .data([{ vector: this, partner: partner }]);

  // Set up drag behavior for the grey circle
  var drag_circle = d3.drag();
  this.multiplication_grey_circle.call(drag_circle);

  drag_circle.on("start", function(d) {
    if (d3.event.sourceEvent.type === "touchstart") {
      if (navigator.vibrate) { navigator.vibrate([25]); }
      d3.select(this).styles({ "fill-opacity": 0.7 });
      d.temp_pos = {
        x: d3.event.sourceEvent.targetTouches[0].pageX,
        y: d3.event.sourceEvent.targetTouches[0].pageY,
        cx: d.vector.cx,
        cy: d.vector.cy
      };
    }
  });

  drag_circle.on("drag", function(d) {
    if (d3.event.sourceEvent.type === "touchmove") {
      var vector = d.vector;
      var partner = d.partner;
      
      // Calculate the touch position relative to the canvas
      var touch_x = d.temp_pos.cx + (d3.event.sourceEvent.targetTouches[0].pageX - d.temp_pos.x);
      var touch_y = d.temp_pos.cy + (d3.event.sourceEvent.targetTouches[0].pageY - d.temp_pos.y);

      // Project the touch point onto the first vector's line
      var vec_dx = vector.xComponent_length;
      var vec_dy = -vector.yComponent_length; // SVG y-axis is inverted
      var vec_len = Math.sqrt(vec_dx * vec_dx + vec_dy * vec_dy);
      if (vec_len === 0) return; // Avoid division by zero

      var unit_x = vec_dx / vec_len;
      var unit_y = vec_dy / vec_len;
      var rel_x = touch_x - vector.cx;
      var rel_y = touch_y - vector.cy;
      var projection = rel_x * unit_x + rel_y * unit_y;

      // Constrain to the vector's line (0 to vec_len)
      projection = Math.max(0, Math.min(projection, vec_len));
      var new_x = vector.cx + projection * unit_x;
      var new_y = vector.cy + projection * unit_y;

      // Check if the circle is near the tail (within control_circle_radius)
      var tail_x = vector.cx + vec_dx;
      var tail_y = vector.cy + vec_dy;
      var dist_to_tail = Math.sqrt((new_x - tail_x) * (new_x - tail_x) + (new_y - tail_y) * (new_y - tail_y));

      if (dist_to_tail < vector.control_circle_radius) {
        // Snap to the tail and allow moving to partner's tail
        d3.select(this).attrs({ cx: tail_x, cy: tail_y });
        d.at_tail = true;
      } else if (d.at_tail) {
        // Move towards partner's tail (shortest distance)
        var partner_tail_x = partner.cx + partner.xComponent_length;
        var partner_tail_y = partner.cy - partner.yComponent_length;
        d3.select(this).attrs({ cx: touch_x, cy: touch_y });

        // Check if near partner's tail
        var dist_to_partner_tail = Math.sqrt((touch_x - partner_tail_x) * (touch_x - partner_tail_x) + (touch_y - partner_tail_y) * (touch_y - partner_tail_y));
        if (dist_to_partner_tail < vector.control_circle_radius) {
          // Trigger multiplication
          vector.multiplyVectors();
          d3.select(this).remove();
          d.vector.multiplication_possible = false;
          d.partner.multiplication_possible = false;
          d.vector.multiplication_data = {};
          d.partner.multiplication_data = {};
        }
      } else {
        // Move along the vector's line
        d3.select(this).attrs({ cx: new_x, cy: new_y });
        d.at_tail = false;
      }
    }
  });

  drag_circle.on("end", function(d) {
    d3.select(this).styles({ "fill-opacity": 0.5 });
    if (!d.at_tail) {
      // Remove circle if not at partner's tail
      d3.select(this).remove();
      d.vector.multiplication_possible = false;
      d.partner.multiplication_possible = false;
      d.vector.multiplication_data = {};
      d.partner.multiplication_data = {};
    }
  });
};

/*************************** Multiply Vectors ***************************/

createVector.prototype.multiplyVectors = function() {
  if (navigator.vibrate) { navigator.vibrate([50]); }
  var vector1 = this;
  var vector2 = this.multiplication_data.partner;

  if (!vector2) return;

  // Log input magnitudes for debugging
  console.log(`vector1: r=${vector1.r}, angle=${vector1.angle_rad}`);
  console.log(`vector2: r=${vector2.r}, angle=${vector2.angle_rad}`);

  // Convert to Cartesian components
  var a = vector1.r * Math.cos(vector1.angle_rad); // Real part of vector1
  var b = vector1.r * Math.sin(vector1.angle_rad); // Imaginary part of vector1
  var c = vector2.r * Math.cos(vector2.angle_rad); // Real part of vector2
  var d = vector2.r * Math.sin(vector2.angle_rad); // Imaginary part of vector2

  // Complex multiplication: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
  var x_result = a * c - b * d;
  var y_result = a * d + b * c;

  // Compute polar form
  var raw_r = Math.sqrt(x_result * x_result + y_result * y_result);
  var angle_result = Math.atan2(y_result, x_result);
  if (angle_result < 0) angle_result += 2 * Math.PI;

  // Log resultant for debugging
  console.log(`Resultant: r=${raw_r}, angle=${angle_result}`);

  // Create resultant vector at first vector's center
  var resultant = new createVector({
    parent: vector1.parent || { vector_list: [], vectorID: -1 },
    cx: vector1.cx,
    cy: vector1.cy,
    r: raw_r,
    manipulationPossible: true,
    angle_rad: angle_result,
    xComponent_length: x_result,
    yComponent_length: y_result,
    manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
    resolution_allowed: true,
    movementAllowed: true,
    vector_mode: "polar",
    cartesian_mode_controls: "polar",
    vectorID: (vector1.parent.vectorID || -1) + 1,
    addedVectors: false,
    multiplicationResultant: true,
    delete_allowed: true,
    symbol: "R"
  });

  // Initialize parent vector list if not present
  if (!vector1.parent.vector_list) vector1.parent.vector_list = [];
  vector1.parent.vectorID = (vector1.parent.vectorID || -1) + 1;
  vector1.parent.vector_list.push(resultant);

  // Apply fade-in animation
  resultant.vector_line
    .styles({ 
      "opacity": 0, 
      "display": null, 
      "stroke": "#FF0000", 
      "stroke-width": 0.7 * DEFAULT_SCREEN_SIZE 
    })
    .transition().duration(1000)
    .styles({ "opacity": 1 })
    .attrTween("transform", function() {
      return d3.interpolateString("scale(0) rotate(0)", "scale(1) rotate(" + (angle_result * 180 / Math.PI) + ")");
    });

  // Update text display
  if (typeof resultant.update_text === "function") {
    resultant.update_text();
  }

  // Clean up
  if (vector1.multiplication_grey_circle) vector1.multiplication_grey_circle.remove();
  if (vector2.multiplication_grey_circle) vector2.multiplication_grey_circle.remove();
  vector1.multiplication_possible = false;
  vector2.multiplication_possible = false;
  vector1.multiplication_data = {};
  vector2.multiplication_data = {};

  // Log multiplication
  screen_svg.multiplication_log = screen_svg.multiplication_log || [];
  screen_svg.multiplication_log.push({
    vector_1: vector1,
    vector_2: vector2,
    resultant: resultant
  });
  console.log("Multiplication logged:", { vector1: vector1.symbol, vector2: vector2.symbol, resultant: resultant.symbol });

  // Store multiplication object
  var multiplication = {
    vector_1: vector1,
    vector_2: vector2,
    resultant: resultant,
    manipulationMode: false,
    componentized: false,
    multiplication_mode: "default"
  };

  // Setup view and events
  multiplication.setup_Multiplication_View = setup_Multiplication_View;
  multiplication.setup_Multiplication_View();
  multiplication.create_Multiplication_Events = create_Multiplication_Events;
  multiplication.create_Multiplication_Events();

  // Assign action methods
  multiplication.done_multiplication = done_multiplication;
  multiplication.recombine_multiplied_vector = recombine_multiplied_vector;
  multiplication.resolve_multiplied_vector = resolve_multiplied_vector;
  multiplication.toggle_multiplication_mode = toggle_multiplication_mode;

  return multiplication;
};

/*************************** Setup Multiplication View ***************************/

var setup_Multiplication_View = function() {
  var vector_1 = this.vector_1;
  var vector_2 = this.vector_2;
  var resultant = this.resultant;

  vector_1.container
    .transition().delay(0).duration(1000)
    .attrs({ transform: "translate(" + vector_1.cx + "," + vector_1.cy + ")" });

  vector_2.container
    .transition().delay(0).duration(1000)
    .attrs({ transform: "translate(" + vector_2.cx + "," + vector_2.cy + ")" });

  resultant.movement_circle.styles({ "display": null });
  resultant.circle.styles({ "fill-opacity": 0 });
  resultant.radius_control_circle.styles({ "display": null });
  resultant.angle_control_line.styles({ "display": null });
};