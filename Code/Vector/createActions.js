/***********************************************************************************/
/* createActions.js */

createVector.prototype.toggleManipulationMode = function() {
  /*************************** Manipulation on ***************************/
  if (this.manipulationMode === true) {
    this.circle.styles({ "fill-opacity": 0.075 });
    if (this.vector_mode === "polar") {
      this.radius_control_circle.styles({ "display": null });
      this.angle_control_line.styles({ "display": null });
      this.vector_resolve_rect.styles({ "display": null });
    }
    if (this.vector_mode === "cartesian") {
      if (this.cartesian_mode_controls === "polar") {
        this.radius_control_circle.styles({ "display": null });
        this.angle_control_line.styles({ "display": null });
      }
      if (this.cartesian_mode_controls === "cartesian") {
        this.xComponent_control_circle.styles({ "display": null });
        this.yComponent_control_circle.styles({ "display": null });
      }
    }
  }

  /*************************** Manipulation off ***************************/
  if (this.manipulationMode === false) {
    this.circle.styles({ "fill-opacity": 0 });
    this.radius_control_circle.styles({ "display": "none" });
    this.angle_control_line.styles({ "display": "none" });
    this.vector_resolve_rect.styles({ "display": "none" });
    this.xComponent_control_circle.styles({ "display": "none" });
    this.yComponent_control_circle.styles({ "display": "none" });
  }
};

/***********************************************************************************/
createVector.prototype.resolve_vector = function() {
  this.vector_mode = "cartesian";
  if (navigator.vibrate) { navigator.vibrate([50]); }

  const temp_len = parseInt(this.centre_circle.attr("r"));
  this.centre_circle
    .transition().delay(0).duration(200)
    .attrs({ r: 2 * temp_len })
    .transition().delay(50).duration(150)
    .attrs({ r: temp_len });

  this.xComponent_line
    .styles({ "display": null, "opacity": 0 })
    .transition().delay(0).duration(1500)
    .styles({ "opacity": 1 });

  this.yComponent_line
    .styles({ "display": null, "opacity": 0 })
    .attrs({ x1: this.xComponent_length, x2: this.xComponent_length })
    .transition().delay(0).duration(1500)
    .styles({ "opacity": 1 })
    .transition().delay(0).duration(1500)
    .attrs({ x1: 0, x2: 0 });

  this.vector_line
    .transition().delay(1000).duration(1000)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  this.xProjection_circle
    .transition().delay(3000).duration(0)
    .styles({ "display": "none" });
  this.yProjection_circle
    .transition().delay(3000).duration(0)
    .styles({ "display": "none" });
  this.vector_resolve_rect.styles({ "display": "none" });
  if (this.cartesian_mode_controls === "cartesian") {
    this.radius_control_circle.styles({ "display": "none" });
    this.angle_control_line.styles({ "display": "none" });
    this.xComponent_control_circle.styles({ "display": null });
    this.yComponent_control_circle.styles({ "display": null });
  }
  const temp_object = this;
  setTimeout(function() {
    temp_object.text_3.text.styles({ "display": "none" }); // Hide text_3 (a+bi) after animation
    temp_object.text_3.textBox.styles({ "display": "none" });
    temp_object.update();
  }, 3000);
};

/***********************************************************************************/
createVector.prototype.recombine_vector = function() {
  this.vector_mode = "polar";
  if (navigator.vibrate) { navigator.vibrate([50]); }

  this.yComponent_line
    .transition().delay(500).duration(1500)
    .attrs({ x1: this.xComponent_length, x2: this.xComponent_length })
    .transition().delay(500).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  this.xComponent_line
    .transition().delay(2500).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  this.vector_line
    .transition().delay(2000).duration(0)
    .styles({ "opacity": 0, "display": null })
    .transition().delay(0).duration(500)
    .styles({ "opacity": 1 });

  d3.selectAll(".projection_" + this.vectorID)
    .transition().delay(3000).duration(500)
    .styles({ "opacity": 0 })
    .transition().delay(0).duration(0)
    .styles({ "opacity": 1, "display": "none" });

  this.radius_control_circle.styles({ "display": null });
  this.angle_control_line.styles({ "display": null });
  this.xComponent_control_circle.styles({ "display": "none" });
  this.yComponent_control_circle.styles({ "display": "none" });
  this.vector_resolve_rect.styles({ "display": null });

  const temp_object = this;
  setTimeout(function() {
    temp_object.text_3.text.styles({ "display": "none" });
    temp_object.text_3.textBox.styles({ "display": "none" });
    temp_object.update();
  }, 3500);
};

/***********************************************************************************/
createVector.prototype.checkForAddition = function() {
  const index = this.vectorID;
  for (let i in this.parent.vector_list) {
    if (i == index) continue;
    if (this.vector_mode === "polar" && this.parent.vector_list[i].vector_mode === "polar") {
      if (this.parent.vector_list[i].addition_possible) {
        if (this.parent.vector_list[i].addition_data.patner_ID !== this.vectorID) {
          continue;
        }
      }
      if (this.addition_allowed === false || this.parent.vector_list[i].addition_allowed === false) {
        continue;
      }
      // 1) HEAD of current vector near TAIL of the other
      const temp_dist_1 = distpoints(
        this.cx + this.xComponent_length,
        this.cy - this.yComponent_length,
        this.parent.vector_list[i].cx,
        this.parent.vector_list[i].cy
      );
      if (temp_dist_1 < this.addition_circle_radius) {
        this.cx = this.parent.vector_list[i].cx - this.xComponent_length;
        this.cy = this.parent.vector_list[i].cy + this.yComponent_length;
        this.addition_circle.styles({ "display": null });
        this.addition_data = {
          position: "first",
          patner: this.parent.vector_list[i],
          patner_ID: this.parent.vector_list[i].vectorID
        };
        this.addition_possible = true;
        this.parent.vector_list[i].addition_data = {
          position: "second",
          patner: this,
          patner_ID: this.vectorID
        };
        this.parent.vector_list[i].addition_possible = true;
        return;
      }
      // 2) TAIL of current vector near HEAD of the other
      const temp_dist_2 = distpoints(
        this.cx,
        this.cy,
        this.parent.vector_list[i].xComponent_coordinate,
        this.parent.vector_list[i].yComponent_coordinate
      );
      if (temp_dist_2 < this.addition_circle_radius) {
        this.cx = this.parent.vector_list[i].xComponent_coordinate;
        this.cy = this.parent.vector_list[i].yComponent_coordinate;
        this.addition_data = {
          position: "second",
          patner: this.parent.vector_list[i],
          patner_ID: this.parent.vector_list[i].vectorID
        };
        this.addition_possible = true;
        this.parent.vector_list[i].addition_circle.styles({ "display": null });
        this.parent.vector_list[i].addition_data = {
          position: "first",
          patner: this,
          patner_ID: this.vectorID
        };
        this.parent.vector_list[i].addition_possible = true;
        return;
      }
    }
  }
  if (this.addition_possible) {
    this.addition_data.patner.addition_possible = false;
    this.addition_data.patner.addition_circle.styles({ "display": "none" });
    this.addition_data.patner.addition_data = {};
    if (this.addition_data.patner.addition_centre_circle) {
      this.addition_data.patner.addition_centre_circle.remove();
    }
    this.addition_possible = false;
    this.addition_circle.styles({ "display": "none" });
    this.addition_data = {};
    if (this.addition_centre_circle) {
      this.addition_centre_circle.remove();
    }
  }
};

/***********************************************************************************/
createVector.prototype.checkForMultiplication = function() {
  const index = this.vectorID;
  for (let i in this.parent.vector_list) {
    if (i == index) continue;
    if (this.vector_mode === "polar" && this.parent.vector_list[i].vector_mode === "polar") {
      if (this.parent.vector_list[i].multiplication_possible) {
        if (this.parent.vector_list[i].multiplication_data.partner_ID !== this.vectorID) {
          continue;
        }
      }
      if (this.multiplication_allowed === false || this.parent.vector_list[i].multiplication_allowed === false) {
        continue;
      }
      // Check if TAILS (centers) of two vectors are close
      const temp_dist = distpoints(
        this.cx,
        this.cy,
        this.parent.vector_list[i].cx,
        this.parent.vector_list[i].cy
      );
      if (temp_dist < this.control_circle_radius * 2) {
        // Lock the centers of the two vectors
        this.cx = this.parent.vector_list[i].cx;
        this.cy = this.parent.vector_list[i].cy;

        // Show visual feedback (gray circle at center)
        this.multiplication_circle = this.multiplication_circle || this.parent.canvas.append("circle")
          .attrs({ cx: this.cx, cy: this.cy, r: this.control_circle_radius * 1 })
          .styles({ fill: "gray", "fill-opacity": 0.3 });

        // Update data for both vectors indicating multiplication is possible
        this.multiplication_data = {
          position: "first",
          partner: this.parent.vector_list[i],
          partner_ID: this.parent.vector_list[i].vectorID
        };
        this.multiplication_possible = true;

        this.parent.vector_list[i].multiplication_data = {
          position: "second",
          partner: this,
          partner_ID: this.vectorID
        };
        this.parent.vector_list[i].multiplication_possible = true;

        // Set lockedTo for center lock detection in new gesture
        this.lockedTo = this.parent.vector_list[i].vectorID;
        this.parent.vector_list[i].lockedTo = this.vectorID;

        // Raise both vectors to ensure visibility
        this.container.raise();
        this.parent.vector_list[i].container.raise();

        return;
      }
    }
  }
  if (this.multiplication_possible) {
    const partner = this.multiplication_data.partner;

    // Clear lockedTo on both vectors immediately
    if (partner) {
      partner.lockedTo = null;
    }
    this.lockedTo = null;

    // Reset partner state and remove its circle
    if (this.multiplication_data.partner) {
      this.multiplication_data.partner.multiplication_possible = false;
      if (this.multiplication_data.partner.multiplication_circle) {
        this.multiplication_data.partner.multiplication_circle.remove();
        this.multiplication_data.partner.multiplication_circle = null;
      }
      this.multiplication_data.partner.multiplication_data = {};
    }

    // Reset this vector state and remove its circle
    this.multiplication_possible = false;
    if (this.multiplication_circle) {
      this.multiplication_circle.remove();
      this.multiplication_circle = null;
    }

    this.multiplication_data = {};
  }

};

/***********************************************************************************/
createVector.prototype.checkForDivision = function() {
  const index = this.vectorID;
  for (let i in this.parent.vector_list) {
    if (i == index) continue;
    if (this.vector_mode === "polar" && this.parent.vector_list[i].vector_mode === "polar") {
      if (this.parent.vector_list[i].division_possible) {
        if (this.parent.vector_list[i].division_data.partner_ID !== this.vectorID) {
          continue;
        }
      }
      if (this.division_allowed === false || this.parent.vector_list[i].division_allowed === false) {
        continue;
      }
      // 1) TAIL of current vector (numerator) near TAIL of the other (denominator)
      const temp_dist_1 = distpoints(
        this.cx,
        this.cy,
        this.parent.vector_list[i].cx,
        this.parent.vector_list[i].cy
      );
      if (temp_dist_1 < this.control_circle_radius * 2) {
        // Lock the centers of the two vectors
        this.cx = this.parent.vector_list[i].cx;
        this.cy = this.parent.vector_list[i].cy;

        // Show visual feedback (gray circle at center)
        this.division_circle = this.division_circle || this.parent.canvas.append("circle")
          .attrs({ cx: this.cx, cy: this.cy, r: this.control_circle_radius * 1 })
          .styles({ fill: "gray", "fill-opacity": 0.3 });

        // Update data for both vectors indicating division is possible
        this.division_data = {
          position: "numerator",
          partner: this.parent.vector_list[i],
          partner_ID: this.parent.vector_list[i].vectorID,
          stage: "tail" // Indicates tail-to-tail alignment
        };
        this.division_possible = true;

        this.parent.vector_list[i].division_data = {
          position: "denominator",
          partner: this,
          partner_ID: this.vectorID,
          stage: "tail"
        };
        this.parent.vector_list[i].division_possible = true;

        // Set lockedTo for center lock detection in new gesture
        this.lockedTo = this.parent.vector_list[i].vectorID;
        this.parent.vector_list[i].lockedTo = this.vectorID;

        // Raise both vectors to ensure visibility
        this.container.raise();
        this.parent.vector_list[i].container.raise();

        return;
      }
      // 2) TAIL of current vector (numerator) near HEAD of the other (denominator) after tail-to-tail
      if (this.division_possible && this.division_data.stage === "tail") {
        const temp_dist_2 = distpoints(
          this.cx,
          this.cy,
          this.parent.vector_list[i].xComponent_coordinate,
          this.parent.vector_list[i].yComponent_coordinate
        );
        if (temp_dist_2 < this.control_circle_radius * 2) {
          // Snap numerator's tail to denominator's head
          this.cx = this.parent.vector_list[i].xComponent_coordinate;
          this.cy = this.parent.vector_list[i].yComponent_coordinate;

          // Update division data to indicate head alignment
          this.division_data.stage = "head";
          this.parent.vector_list[i].division_data.stage = "head";

          return;
        }
      }
    }
  }
  if (this.division_possible) {
    const partner = this.division_data.partner;
  
    // Clear lockedTo on both vectors immediately
    if (partner) {
      partner.lockedTo = null;
    }
    this.lockedTo = null;
  
    // Reset partner state and remove its circle
    if (this.division_data.partner) {
      this.division_data.partner.division_possible = false;
      if (this.division_data.partner.division_circle) {
        this.division_data.partner.division_circle.remove();
        this.division_data.partner.division_circle = null;
      }
      this.division_data.partner.division_data = {};
    }
  
    // Reset this vector state and remove its circle
    this.division_possible = false;
    if (this.division_circle) {
      this.division_circle.remove();
      this.division_circle = null;
    }
  
    this.division_data = {};
  }

};