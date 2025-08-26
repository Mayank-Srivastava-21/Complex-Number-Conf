/*************************** Utility Functions ***************************/

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

// Define screen size and DPI locally
const DEFAULT_SCREEN_SIZE = 0.013 * Math.sqrt(window.innerWidth * window.innerHeight);
const DEFAULT_SCREEN_DPI = 0.07 * parseInt(d3.select("body").append("div").styles({ "width": "1in", "height": "1in" }).style("width"));
d3.select("body").select("div").remove();

/*************************** Check for Division ***************************/

createVector.prototype.checkForDivision = function() {
  console.log("Checking for division for vector ID:", this.vectorID);
  if (!this.moving || !this.movementAllowed) return;

  var vectors = screen_svg.vector_list || [];
  for (var i = 0; i < vectors.length; i++) {
    if (vectors[i].vectorID !== this.vectorID && this.vector_mode === "polar" && vectors[i].vector_mode === "polar" && vectors[i].division_allowed) {
      var dx = this.cx - vectors[i].cx;
      var dy = this.cy - vectors[i].cy;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.control_circle_radius * 2 && vectors[i].r !== 0) {
        this.division_possible = true;
        this.division_data = { partner: vectors[i], partner_ID: vectors[i].vectorID, position: "numerator" };
        vectors[i].division_possible = true;
        vectors[i].division_data = { partner: this, partner_ID: this.vectorID, position: "denominator" };
        this.division_circle = this.parent.canvas.append("circle")
          .attrs({ cx: this.cx, cy: this.cy, r: this.control_circle_radius * 1.5 })
          .styles({ fill: "gray", "fill-opacity": 0.5 });
        vectors[i].division_circle = vectors[i].parent.canvas.append("circle")
          .attrs({ cx: vectors[i].cx, cy: vectors[i].cy, r: vectors[i].control_circle_radius * 1.5 })
          .styles({ fill: "gray", "fill-opacity": 0.5 });
        this.container.raise();
        vectors[i].container.raise();
        return;
      }
    }
  }

  if (this.division_possible) {
    this.division_data.partner.division_possible = false;
    if (this.division_data.partner.division_circle) {
      this.division_data.partner.division_circle.remove();
      this.division_data.partner.division_circle = null;
    }
    this.division_possible = false;
    this.division_data = {};
    if (this.division_circle) {
      this.division_circle.remove();
      this.division_circle = null;
    }
  }
};

/*************************** Create Division Grey Circle ***************************/

createVector.prototype.createDivisionGreyCircle = function() {
  if (!this.division_possible || !this.division_data.partner) return;

  var vector = this; // Numerator (vector1)
  var partner = this.division_data.partner; // Denominator (vector2)

  // Create grey circle at the tail of this vector
  var tail_x = this.cx + this.xComponent_length;
  var tail_y = this.cy - this.yComponent_length;
  this.division_grey_circle = this.parent.canvas.append("circle")
    .attrs({ 
      cx: tail_x, 
      cy: tail_y, 
      r: this.control_circle_radius * 1.5 
    })
    .styles({ 
      fill: this.gray_color, 
      "fill-opacity": 0.5 
    })
    .classed("division-circle", true)
    .data([{ vector: this, partner: partner }]);

  // Set up drag behavior for the grey circle
  var drag_circle = d3.drag();
  this.division_grey_circle.call(drag_circle);

  drag_circle.on("start", function(d) {
    if (d3.event.sourceEvent.type === "touchstart") {
      if (navigator.vibrate) { navigator.vibrate([25]); }
      d3.select(this).styles({ "fill-opacity": 0.7 });
      d.temp_pos = {
        x: d3.event.sourceEvent.targetTouches[0].pageX,
        y: d3.event.sourceEvent.targetTouches[0].pageY,
        cx: tail_x,
        cy: tail_y
      };
      d.at_first_tail = true;
      d.at_partner_tail = false;
    }
  });

  drag_circle.on("drag", function(d) {
    if (d3.event.sourceEvent.type === "touchmove") {
      var vector = d.vector;
      var partner = d.partner;
      
      var touch_x = d.temp_pos.cx + (d3.event.sourceEvent.targetTouches[0].pageX - d.temp_pos.x);
      var touch_y = d.temp_pos.cy + (d3.event.sourceEvent.targetTouches[0].pageY - d.temp_pos.y);

      if (d.at_first_tail) {
        // Moving from vector1's tail to vector2's tail
        var partner_tail_x = partner.cx + partner.xComponent_length;
        var partner_tail_y = partner.cy - partner.yComponent_length;
        d3.select(this).attrs({ cx: touch_x, cy: touch_y });

        var dist_to_partner_tail = calculateDistance(touch_x, touch_y, partner_tail_x, partner_tail_y);
        if (dist_to_partner_tail < vector.control_circle_radius) {
          d3.select(this).attrs({ cx: partner_tail_x, cy: partner_tail_y });
          d.at_first_tail = false;
          d.at_partner_tail = true;
        }
      } else if (d.at_partner_tail) {
        // Move along vector2's line from tail to head
        var partner_vec_dx = partner.xComponent_length;
        var partner_vec_dy = -partner.yComponent_length;
        var partner_vec_len = calculateDistance(0, 0, partner_vec_dx, partner_vec_dy);
        if (partner_vec_len === 0) return;

        var unit_x = partner_vec_dx / partner_vec_len;
        var unit_y = partner_vec_dy / partner_vec_len;
        var rel_x = touch_x - partner.cx;
        var rel_y = touch_y - partner.cy;
        var projection = rel_x * unit_x + rel_y * unit_y;

        // Constrain to vector2's line (from tail at projection=partner_vec_len to head at projection=0)
        projection = Math.max(0, Math.min(projection, partner_vec_len));
        var new_x = partner.cx + projection * unit_x;
        var new_y = partner.cy + projection * unit_y;

        // Check if near vector2's head (center)
        var dist_to_partner_head = calculateDistance(new_x, new_y, partner.cx, partner.cy);
        if (dist_to_partner_head < vector.control_circle_radius) {
          // Snap to head and trigger division
          d3.select(this).attrs({ cx: partner.cx, cy: partner.cy });
          vector.divideVectors();
          d3.select(this).remove();
          d.vector.division_possible = false;
          d.partner.division_possible = false;
          d.vector.division_data = {};
          d.partner.division_data = {};
        } else {
          // Move along vector2's line
          d3.select(this).attrs({ cx: new_x, cy: new_y });
        }
      }
    }
  });

  drag_circle.on("end", function(d) {
    d3.select(this).styles({ "fill-opacity": 0.5 });
    if (!d.at_partner_tail && !d.at_partner_head) {
      d3.select(this).remove();
      d.vector.division_possible = false;
      d.partner.division_possible = false;
      d.vector.division_data = {};
      d.partner.division_data = {};
    }
  });
};

/*************************** Divide Vectors ***************************/

createVector.prototype.divideVectors = function() {
  if (navigator.vibrate) { navigator.vibrate([50]); }
  var vector1 = this; // Numerator
  var vector2 = this.division_data.partner; // Denominator

  if (!vector2) {
    console.warn("No partner vector for division");
    return;
  }

  if (vector2.r === 0) {
    console.warn("Division by zero prevented");
    return;
  }

  // Log input magnitudes for debugging
  console.log(`vector1: r=${vector1.r}, angle=${vector1.angle_rad}`);
  console.log(`vector2: r=${vector2.r}, angle=${vector2.angle_rad}`);

  // Compute polar form: r = r1/r2, angle = angle1 - angle2
  var r1 = (typeof radius_scale === "function" ? radius_scale(vector1.r) : vector1.r);
  var r2 = (typeof radius_scale === "function" ? radius_scale(vector2.r) : vector2.r);
  var r_result = r2 !== 0 ? r1 / r2 : 0;
  var angle_result = vector1.angle_rad - vector2.angle_rad;
  if (angle_result < 0) angle_result += 2 * Math.PI;
  if (angle_result > 2 * Math.PI) angle_result -= 2 * Math.PI;

  var display_r = (typeof radius_scale_inverse === "function" ? radius_scale_inverse(r_result) : r_result);
  var x_result = display_r * Math.cos(angle_result);
  var y_result = display_r * Math.sin(angle_result);

  // Log resultant for debugging
  console.log(`Resultant: r=${display_r}, angle=${angle_result}`);

  // Create resultant vector
  var resultant = new createVector({
    parent: vector1.parent || { vector_list: [], vectorID: -1 },
    cx: vector1.cx,
    cy: vector1.cy,
    r: display_r,
    angle_rad: angle_result,
    xComponent_length: x_result,
    yComponent_length: y_result,
    manipulationPossible: true,
    manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
    resolution_allowed: true,
    movementAllowed: true,
    vector_mode: "polar",
    cartesian_mode_controls: "polar",
    vectorID: (vector1.parent.vectorID || -1) + 1,
    addedVectors: false,
    multiplicationResultant: false,
    divisionResultant: true,
    delete_allowed: true,
    symbol: `${vector1.symbol}÷${vector2.symbol}`,
    gray_color: vector1.gray_color,
    vector_color: vector1.vector_color,
    control_circle_radius: vector1.control_circle_radius
  });

  resultant.object = { vector_1: vector1, vector_2: vector2, resultant: resultant };

  if (!vector1.parent.vector_list) vector1.parent.vector_list = [];
  vector1.parent.vectorID = (vector1.parent.vectorID || -1) + 1;
  vector1.parent.vector_list.push(resultant);

  // Initialize vector line for animation
  resultant.vector_line
    .styles({ 
      "opacity": 0, 
      "display": null, 
      "stroke": vector1.vector_color, 
      "stroke-width": 0.7 * DEFAULT_SCREEN_SIZE 
    })
    .attrs({ 
      transform: `scale(${vector1.r / display_r}) rotate(${vector1.angle_rad * 180 / Math.PI})` 
    });

  // Initialize centre circle
  resultant.centre_circle
    .classed("vector-circle", true)
    .styles({ 
      "fill": vector1.vector_color, 
      "fill-opacity": 0 
    })
    .attrs({ 
      r: resultant.control_circle_radius 
    });

  // Animate resultant
  resultant.vector_line
    .transition().duration(2000)
    .styles({ "opacity": 1 })
    .attrTween("x2", function() {
      return function(t) {
        var x = d3.interpolateNumber(0, x_result)(t);
        resultant.xComponent_length = x;
        resultant.r = Math.sqrt(x * x + resultant.yComponent_length * resultant.yComponent_length);
        resultant.angle_rad = Math.atan2(resultant.yComponent_length, x);
        resultant.update_text();
        resultant.update_equation();
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
        resultant.update_equation();
        resultant.resolveTextOverlaps([vector1, vector2, resultant]);
        return y;
      };
    })
    .on("start", function() {
      resultant.update_text();
      resultant.update_equation();
      resultant.resolveTextOverlaps([vector1, vector2, resultant]);
    })
    .on("end", function() {
      resultant.update_text();
      resultant.update_equation();
      resultant.resolveTextOverlaps([vector1, vector2, resultant]);
      resultant.container.raise();
      console.log("Division animation completed for resultant vector ID:", resultant.vectorID);
    });

  // Update text and equation
  resultant.update();
  resultant.update_text();
  resultant.create_equation();
  resultant.setup_equation();
  resultant.update_equation();
  resultant.resolveTextOverlaps([vector1, vector2, resultant]);

  // Clean up
  if (vector1.division_grey_circle) vector1.division_grey_circle.remove();
  if (vector2.division_grey_circle) vector2.division_grey_circle.remove();
  if (vector1.division_circle) {
    vector1.division_circle.remove();
    vector1.division_circle = null;
  }
  if (vector2.division_circle) {
    vector2.division_circle.remove();
    vector2.division_circle = null;
  }
  vector1.division_possible = false;
  vector2.division_possible = false;
  vector1.division_data = {};
  vector2.division_data = {};

  // Log division
  screen_svg.division_log = screen_svg.division_log || [];
  screen_svg.division_log.push({
    vector_1: vector1,
    vector_2: vector2,
    resultant: resultant
  });
  console.log("Division logged:", { vector1: vector1.symbol, vector2: vector2.symbol, resultant: resultant.symbol });

  // Create division object
  var division = {
    vector_1: vector1,
    vector_2: vector2,
    resultant: resultant,
    manipulationMode: false,
    componentized: false,
    division_mode: "default",
    done_division_button: {
      size: 5 * (window.screen_size || 100),
      size_big: 8 * (window.screen_size || 100),
      posX: -8 * (window.screen_size || 100),
      posY: -8 * (window.screen_size || 100),
      shown: false,
      active: false,
      image: resultant.parent.canvas.append("image")
        .attrs({ "xlink:href": "../../Images/done.png", width: 0, height: 0 })
    },
    div: d3.select('body').append('div').styles({ 'font-size': resultant.font_size_normal })
      .html(`\\(${vector1.symbol}\\div${vector2.symbol}\\)`),
    vector_2_dotted_line: vector2.parent.canvas.append("line")
      .styles({ "stroke": vector2.gray_color, "stroke-width": 0.2 * (window.screen_size || 100), "stroke-dasharray": "3,3", "display": "none" })
  };

  // Assign methods
  division.setup_Division_View = setup_Division_View;
  division.setup_Division_View();
  division.create_Division_Events = create_Division_Events;
  division.create_Division_Events();
  division.done_division = done_division;
  division.recombine_divided_vector = recombine_divided_vector;
  division.resolve_divided_vector = resolve_divided_vector;
  division.toggle_division_mode = toggle_division_mode;
  division.animate_resultant = animate_resultant;

  // Render MathJax for division equation
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

  if (typeof screen_svg.toggleDivisionTable === "function") {
    screen_svg.toggleDivisionTable(true);
  }

  return division;
};

/*************************** Setup Division View ***************************/

var setup_Division_View = function() {
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
  resultant.circle.classed("vector-circle", true);
  resultant.radius_control_circle.styles({ "display": null });
  resultant.angle_control_line.styles({ "display": null });

  this.div.styles({ 
    'position': 'absolute', 
    'top': resultant.cy + resultant.r + 10, 
    'left': resultant.cx - 0.5 * parseInt(this.div.style('width')) 
  });
};