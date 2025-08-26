/***********************************************************************************/
/* createEvents.js */

createVector.prototype.createEvents = function() {
  // Initialize temp_pos per vector instance
  this.temp_pos = { x: 0, y: 0, cx: 0, cy: 0 };

  /*************************** Circle Events ***************************/
  const drag_circle = d3.drag();
  this.circle.call(drag_circle);

  drag_circle.on("start", function(d) {
    if (d.manipulationMode === false && d3.event?.sourceEvent?.type === "touchstart") {
      d.temp_pos.x = d3.event.sourceEvent.targetTouches[0].pageX;
      d.temp_pos.y = d3.event.sourceEvent.targetTouches[0].pageY;
      d.temp_pos.cx = d.cx;
      d.temp_pos.cy = d.cy;
      // Store original radius for multiplication resultant to prevent size change
      if (d.multiplicationResultant) {
        d.temp_pos.originalRadius = d.r || d.control_circle_radius || 10;
      }
      console.log("Drag start on vector ID:", d.vectorID, "at", d.cx, d.cy);
    }
  });

  drag_circle.on("drag", function(d) {
    // Prevent dragging for addition resultant in active mode
    if (d.manipulationMode === false && d.movementAllowed === true && (!d.additionResultant || d.manipulationMode === false)) {
      d.cx = d.temp_pos.cx + (d3.event.sourceEvent.targetTouches[0].pageX - d.temp_pos.x);
      d.cy = d.temp_pos.cy + (d3.event.sourceEvent.targetTouches[0].pageY - d.temp_pos.y);
      // Restore original radius for multiplication resultant to prevent size change
      if (d.multiplicationResultant && d.temp_pos.originalRadius) {
        d.r = d.temp_pos.originalRadius;
      }
      // Call operation checks with logging to trace execution
      if (typeof d.checkForAddition === "function") {
        console.log("Checking addition for vector ID:", d.vectorID, "at", d.cx, d.cy);
        d.checkForAddition();
      }
      if (typeof d.checkForMultiplication === "function") {
        console.log("Checking multiplication for vector ID:", d.vectorID, "at", d.cx, d.cy);
        d.checkForMultiplication();
      }
      if (typeof d.checkForDivision === "function") {
        console.log("Checking division for vector ID:", d.vectorID, "at", d.cx, d.cy);
        d.checkForDivision();
      }
      d.update();
      console.log("Dragging many vector ID:", d.vectorID, "to", d.cx, d.cy);
    }
  });

  drag_circle.on("end", function(d) {
    console.log("Drag end on vector ID:", d.vectorID);
    if (d.addition_possible && typeof d.create_addition_centre_circle === "function") {
      if (d.addition_data.position === "first") {
        d.create_addition_centre_circle();
      } else if (d.addition_data.position === "second" && d.addition_data.patner) {
        d.addition_data.patner.create_addition_centre_circle();
      }
    }
    if (d.multiplication_possible && typeof d.create_multiplication_centre_circle === "function") {
      if (d.multiplication_data.partner) {
        d.create_multiplication_centre_circle(d.multiplication_data.partner);
      }
    }
    if (d.division_possible && typeof d.createDivisionGreyCircle === "function") {
      if (d.division_data.position === "numerator" && d.division_data.partner) {
        d.createDivisionGreyCircle();
      }
    }
  });

  /*************************** Addition Centre Circle Events ***************************/
  this.create_addition_centre_circle = function() {
    if (!this.parent?.canvas) return;
    this.addition_centre_circle = this.parent.canvas.append("circle")
      .styles({ "fill": this.gray_color || "gray", "fill-opacity": 0, "stroke": "none" })
      .attrs({ cx: this.cx, cy: this.cy, r: this.control_circle_radius || 10 })
      .data([this]);

    this.addition_centre_circle.on("touchstart", function(d) {
      if (!d.addition_data?.patner) return;
      d3.select(this).styles({ "fill-opacity": 0.4 });
      d.temp_circle = d.parent.canvas.append("circle")
        .styles({ "fill": d.gray_color || "gray", "fill-opacity": 0.3, "stroke": "none" })
        .attrs({
          cx: d.addition_data.patner.xComponent_coordinate,
          cy: d.addition_data.patner.yComponent_coordinate,
          r: d.control_circle_radius || 10
        })
        .on("touchstart", function() {
          if (typeof d.addVectors === "function") {
            console.log("Addition confirmed for vector ID:", d.vectorID);
            d.addVectors();
            // Reset multiplication and division flags to prevent interference
            d.multiplication_possible = false;
            d.division_possible = false;
            if (d.multiplication_data?.partner) {
              d.multiplication_data.partner.multiplication_possible = false;
              d.multiplication_data = {};
            }
            if (d.division_data?.partner) {
              d.division_data.partner.division_possible = false;
              d.division_data = {};
            }
          }
        });
    });

    this.addition_centre_circle.on("touchend", function(d) {
      d3.select(this).styles({ "fill-opacity": 0 });
      if (d.temp_circle) d.temp_circle.remove();
    });
  };

  /*************************** Multiplication Centre Circle Events ***************************/
  this.create_multiplication_centre_circle = function(partner) {
    if (!this.parent?.canvas || !partner) return;

    var object = this;
    var touchState = {
      isDragging: false,
      dragStartTime: null,
      currentStage: "center", // Stages: "center", "first_tail", "second_tail"
      dragCircle: null
    };

    // Ensure vectors are updated
    object.update();
    partner.update();

    // Create draggable gray circle at the center
    touchState.dragCircle = this.parent.canvas.append("circle")
      .styles({ "fill": this.gray_color || "gray", "fill-opacity": 0.4, "stroke": "none", "pointer-events": "all" })
      .attrs({ cx: this.cx, cy: this.cy, r: this.control_circle_radius * 1.5 })
      .data([this]);

    const dragHandler = d3.drag();
    touchState.dragCircle.call(dragHandler);

    dragHandler.on("start", function(d) {
      if (d3.event.sourceEvent.type === "touchstart") {
        touchState.isDragging = true;
        touchState.dragStartTime = Date.now();
        d3.select(this).styles({ "fill-opacity": 0.6 });
        console.log("Multiplication drag started at center for vector ID:", d.vectorID);
      }
    });

    dragHandler.on("drag", function(d) {
      if (!touchState.isDragging) return;

      const touchX = d3.event.sourceEvent.targetTouches[0].pageX - d.cx;
      const touchY = d3.event.sourceEvent.targetTouches[0].pageY - d.cy;
      const distToFirstTail = distpoints(touchX, touchY, d.xComponent_length, -d.yComponent_length);
      const distToSecondTail = distpoints(touchX, touchY, partner.xComponent_length, -partner.yComponent_length);

      // Stage 1: Check if dragged to first vector's tail
      if (touchState.currentStage === "center" && distToFirstTail < d.control_circle_radius) {
        touchState.currentStage = "first_tail";
        d3.select(this).styles({ "fill-opacity": 0.8 });
        if (navigator.vibrate) { navigator.vibrate([25]); }
        console.log("Reached first tail for vector ID:", d.vectorID);
      }
      // Stage 2: Check if dragged to second vector's tail
      else if (touchState.currentStage === "first_tail" && distToSecondTail < d.control_circle_radius) {
        touchState.currentStage = "second_tail";
        d3.select(this).styles({ "fill-opacity": 1.0 });
        if (navigator.vibrate) { navigator.vibrate([50]); }
        console.log("Reached second tail for vector ID:", partner.vectorID);
        // Trigger multiplication
        if (typeof d.multiplyVectors === "function") {
          d.multiplyVectors();
          console.log("Multiplication triggered for vector ID:", d.vectorID);
          // Reset addition and division flags to prevent interference
          d.addition_possible = false;
          d.division_possible = false;
          if (d.addition_data?.patner) {
            d.addition_data.patner.addition_possible = false;
            d.addition_data = {};
          }
          if (d.division_data?.partner) {
            d.division_data.partner.division_possible = false;
            d.division_data = {};
          }
        }
        // Cleanup
        touchState.dragCircle.remove();
        touchState.isDragging = false;
        touchState.currentStage = "center";
      }

      // Update drag circle position
      d3.select(this).attrs({ cx: touchX + d.cx, cy: touchY + d.cy });
    });

    dragHandler.on("end", function(d) {
      if (touchState.isDragging) {
        touchState.isDragging = false;
        touchState.currentStage = "center";
        d3.select(this).styles({ "fill-opacity": 0.4 });
        console.log("Multiplication drag ended for vector ID:", d.vectorID);
        // Reset multiplication-specific data only
        if (touchState.dragCircle) {
          touchState.dragCircle.remove();
          touchState.dragCircle = null;
        }
        d.multiplication_possible = false;
        partner.multiplication_possible = false;
        if (d.multiplication_circle) {
          d.multiplication_circle.remove();
          d.multiplication_circle = null;
        }
        if (partner.multiplication_circle) {
          partner.multiplication_circle.remove();
          partner.multiplication_circle = null;
        }
        d.multiplication_data = {};
        partner.multiplication_data = {};
      }
    });

    // Timeout to reset if gesture incomplete
    setTimeout(function() {
      if (touchState.isDragging) {
        touchState.isDragging = false;
        touchState.currentStage = "center";
        if (touchState.dragCircle) {
          touchState.dragCircle.remove();
          touchState.dragCircle = null;
        }
        d.multiplication_possible = false;
        partner.multiplication_possible = false;
        if (d.multiplication_circle) {
          d.multiplication_circle.remove();
          d.multiplication_circle = null;
        }
        if (partner.multiplication_circle) {
          partner.multiplication_circle.remove();
          partner.multiplication_circle = null;
        }
        d.multiplication_data = {};
        partner.multiplication_data = {};
        console.log("Multiplication gesture timeout for vector ID:", d.vectorID);
      }
    }, 15000);
  };

  /*************************** Division Centre Circle Events ***************************/
  this.createDivisionGreyCircle = function() {
    if (!this.parent?.canvas || !this.division_data?.partner) return;

    var object = this;
    var partner = this.division_data.partner;
    var touchState = {
      isDragging: false,
      dragStartTime: null,
      currentStage: "numerator_tail", // Stages: "numerator_tail", "denominator_tail", "denominator_head"
      dragCircle: null
    };

    // Ensure vectors are updated
    object.update();
    partner.update();

    // Create draggable gray circle at the numerator's tail
    var tail_x = this.cx + this.xComponent_length;
    var tail_y = this.cy - this.yComponent_length;
    touchState.dragCircle = this.parent.canvas.append("circle")
      .styles({ "fill": this.gray_color || "gray", "fill-opacity": 0.5, "stroke": "none", "pointer-events": "all" })
      .attrs({ cx: tail_x, cy: tail_y, r: this.control_circle_radius * 1.5 })
      .data([{ vector: this, partner: partner }]);

    const dragHandler = d3.drag();
    touchState.dragCircle.call(dragHandler);

    dragHandler.on("start", function(d) {
      if (d3.event.sourceEvent.type === "touchstart") {
        touchState.isDragging = true;
        touchState.dragStartTime = Date.now();
        d3.select(this).styles({ "fill-opacity": 0.7 });
        d.temp_pos = {
          x: d3.event.sourceEvent.targetTouches[0].pageX,
          y: d3.event.sourceEvent.targetTouches[0].pageY,
          cx: tail_x,
          cy: tail_y
        };
        console.log("Division drag started at numerator tail for vector ID:", d.vector.vectorID);
      }
    });

    dragHandler.on("drag", function(d) {
      if (!touchState.isDragging) return;

      var touch_x = d.temp_pos.cx + (d3.event.sourceEvent.targetTouches[0].pageX - d.temp_pos.x);
      var touch_y = d.temp_pos.cy + (d3.event.sourceEvent.targetTouches[0].pageY - d.temp_pos.y);
      var vector = d.vector;
      var partner = d.partner;

      if (touchState.currentStage === "numerator_tail") {
        // Check if dragged to denominator's tail
        var partner_tail_x = partner.cx + partner.xComponent_length;
        var partner_tail_y = partner.cy - partner.yComponent_length;
        var distToDenominatorTail = distpoints(touch_x - partner.cx, touch_y - partner.cy, partner.xComponent_length, -partner.yComponent_length);
        d3.select(this).attrs({ cx: touch_x, cy: touch_y });

        if (distToDenominatorTail < vector.control_circle_radius) {
          touchState.currentStage = "denominator_tail";
          d3.select(this).attrs({ cx: partner_tail_x, cy: partner_tail_y });
          d3.select(this).styles({ "fill-opacity": 0.8 });
          if (navigator.vibrate) { navigator.vibrate([25]); }
          console.log("Reached denominator tail for vector ID:", partner.vectorID);
        }
      } else if (touchState.currentStage === "denominator_tail") {
        // Move along denominator's line from tail to head
        var partner_vec_dx = partner.xComponent_length;
        var partner_vec_dy = -partner.yComponent_length;
        var partner_vec_len = distpoints(0, 0, partner_vec_dx, partner_vec_dy);
        if (partner_vec_len === 0) return;

        var unit_x = partner_vec_dx / partner_vec_len;
        var unit_y = partner_vec_dy / partner_vec_len;
        var rel_x = touch_x - partner.cx;
        var rel_y = touch_y - partner.cy;
        var projection = rel_x * unit_x + rel_y * unit_y;

        // Constrain to denominator's line (from tail at projection=partner_vec_len to head at projection=0)
        projection = Math.max(0, Math.min(projection, partner_vec_len));
        var new_x = partner.cx + projection * unit_x;
        var new_y = partner.cy + projection * unit_y;

        // Check if near denominator's head (center)
        var distToDenominatorHead = distpoints(new_x - partner.cx, new_y - partner.cy, 0, 0);
        if (distToDenominatorHead < vector.control_circle_radius) {
          touchState.currentStage = "denominator_head";
          d3.select(this).attrs({ cx: partner.cx, cy: partner.cy });
          d3.select(this).styles({ "fill-opacity": 1.0 });
          if (navigator.vibrate) { navigator.vibrate([50]); }
          console.log("Reached denominator head for vector ID:", partner.vectorID);
          // Trigger division
          if (typeof vector.divideVectors === "function") {
            vector.divideVectors();
            console.log("Division triggered for vector ID:", vector.vectorID);
            // Reset addition and multiplication flags to prevent interference
            vector.addition_possible = false;
            vector.multiplication_possible = false;
            if (vector.addition_data?.patner) {
              vector.addition_data.patner.addition_possible = false;
              vector.addition_data = {};
            }
            if (vector.multiplication_data?.partner) {
              vector.multiplication_data.partner.multiplication_possible = false;
              vector.multiplication_data = {};
            }
          }
          // Cleanup
          touchState.dragCircle.remove();
          touchState.isDragging = false;
          touchState.currentStage = "numerator_tail";
        } else {
          // Move along denominator's line
          d3.select(this).attrs({ cx: new_x, cy: new_y });
        }
      }
    });

    dragHandler.on("end", function(d) {
      if (touchState.isDragging) {
        touchState.isDragging = false;
        touchState.currentStage = "numerator_tail";
        d3.select(this).styles({ "fill-opacity": 0.5 });
        console.log("Division drag ended for vector ID:", d.vector.vectorID);
        // Reset division-specific data only
        if (touchState.dragCircle) {
          touchState.dragCircle.remove();
          touchState.dragCircle = null;
        }
        d.vector.division_possible = false;
        d.partner.division_possible = false;
        if (d.vector.division_circle) {
          d.vector.division_circle.remove();
          d.vector.division_circle = null;
        }
        if (d.partner.division_circle) {
          d.partner.division_circle.remove();
          d.partner.division_circle = null;
        }
        d.vector.division_data = {};
        d.partner.division_data = {};
      }
    });

    // Timeout to reset if gesture incomplete
    setTimeout(function() {
      if (touchState.isDragging) {
        touchState.isDragging = false;
        touchState.currentStage = "numerator_tail";
        if (touchState.dragCircle) {
          touchState.dragCircle.remove();
          touchState.dragCircle = null;
        }
        d.vector.division_possible = false;
        d.partner.division_possible = false;
        if (d.vector.division_circle) {
          d.vector.division_circle.remove();
          d.vector.division_circle = null;
        }
        if (d.partner.division_circle) {
          d.partner.division_circle.remove();
          d.partner.division_circle = null;
        }
        d.vector.division_data = {};
        d.partner.division_data = {};
        console.log("Division gesture timeout for vector ID:", d.vector.vectorID);
      }
    }, 15000);
  };

  /*************************** Long Press on Centre Events ***************************/
  this.dispatch = d3.dispatch("long_press");
  this.dispatch.on("long_press", function(d) {
    if (d.delete_allowed === true) {
      d.delete_button.shown = true;
      d.delete_button.image
        .transition().duration(500)
        .attrs({
          x: d.delete_button.posX - 0.5 * (d.delete_button.size || 50),
          y: d.delete_button.posY - 0.5 * (d.delete_button.size || 50),
          width: d.delete_button.size || 50,
          height: d.delete_button.size || 50
        });
    }
    // Long press on resultant vector to trigger animation
    if (d.multiplicationResultant) {
      if (typeof d.animateMultiplication === "function") {
        d.animateMultiplication();
      } else {
        // Fallback animation: pulse effect
        d3.select(d.circle.node())
          .transition()
          .duration(500)
          .attr("r", (d.r || d.control_circle_radius || 10) * 1.5)
          .transition()
          .duration(500)
          .attr("r", d.r || d.control_circle_radius || 10)
          .on("end", function() {
            console.log("Fallback pulse animation triggered for multiplication resultant ID:", d.vectorID);
          });
      }
    }
    if (d.divisionResultant && typeof d.animate_resultant === "function") {
      d.animate_resultant();
    }
  });

  /*************************** Centre Circle Events ***************************/
  this.centre_control_circle.on("touchstart", function(d) {
    screen_svg.activeVector = d;
    d3.select(this).attr("class", "visible");
    if (d.manipulationMode === false) {
      this.timer = setTimeout(function() {
        d.dispatch.call("long_press", this, d);
      }, 600);
    }
    if (d.manipulationMode === true && d.vector_mode === "cartesian") {
      this.timer = setTimeout(function() {
        d.vector_recombine_circle.styles({ "display": null }).attr("class", "visible");
      }, 100);
    }
  });

  this.centre_control_circle.on("click", function(d) {
    screen_svg.activeVector = d;
    d.manipulationMode = !d.manipulationMode;
    if (typeof d.toggleManipulationMode === "function") {
      d.toggleManipulationMode();
    } else {
      console.warn("toggleManipulationMode not implemented for vector ID:", d.vectorID);
    }
  });

  this.centre_control_circle.on("touchmove", function(d) {
    const button = d.delete_button || { size: 50, size_big: 80, posX: -80, posY: -80, shown: false, active: false, image: d.delete_button?.image };
    if (button.shown === true) {
      const temp_dist = distpoints(
        d3.event.targetTouches[0].pageX,
        d3.event.targetTouches[0].pageY,
        d.cx + button.posX,
        d.cy + button.posY
      );
      button.active = temp_dist < 0.5 * (button.size || 50);
      if (button.active) {
        button.image.attrs({
          x: button.posX - 0.5 * (button.size_big || 80),
          y: button.posY - 0.5 * (button.size_big || 80),
          width: button.size_big || 80,
          height: button.size_big || 80
        });
      } else {
        button.image.attrs({
          x: button.posX - 0.5 * (button.size || 50),
          y: button.posY - 0.5 * (button.size || 50),
          width: button.size || 50,
          height: button.size || 50
        });
      }
    }
  });

  this.centre_control_circle.on("touchend", function(d) {
    d3.select(this).attr("class", "invisible");
    clearTimeout(this.timer);
    d.vector_recombine_circle.styles({ "display": "none" });
    const button = d.delete_button || { shown: false, active: false, image: d.delete_button?.image };
    if (button.active === false) {
      button.shown = false;
      button.image
        .transition().duration(1000)
        .attrs({ width: 0, height: 0, x: 0, y: 0 });
    } else {
      d.container.styles({ "display": "none" });
      if (d.parent?.vector_list) {
        for (let i in d.parent.vector_list) {
          if (d.parent.vector_list[i].vectorID === d.vectorID) {
            d.parent.vector_list.splice(i, 1);
            break;
          }
        }
      }
    }
  });

  /*************************** Vector Recombine Circle Events ***************************/
  this.vector_recombine_circle.on("touchstart", function(d) {
    if (typeof d.recombine_vector === "function") {
      d.recombine_vector();
    } else {
      console.warn("recombine_vector not implemented for vector ID:", d.vectorID);
    }
  });

  /*************************** Radius Control Circle Events ***************************/
  const radius_control_circle_drag = d3.drag();
  this.radius_control_circle.call(radius_control_circle_drag);

  radius_control_circle_drag.on("start", function(d) {
    if (d3.event?.sourceEvent?.type === "touchstart") {
      d3.select(this).attr("class", "visible DRAM");
      d.temp_pos.dist = distpoints(0, 0, d3.event.x, d3.event.y);
      d.temp_pos.r = d.r || 0;
    }
  });

  radius_control_circle_drag.on("drag", function(d) {
    if (d3.event?.sourceEvent?.type === "touchmove") {
      const temp_dist = distpoints(0, 0, d3.event.x, d3.event.y);
      const temp_r = d.temp_pos.r + (temp_dist - d.temp_pos.dist);
      if (!isNaN(temp_r) && temp_r >= 0) {
        d.r = temp_r;
      }
      d.update();
    }
  });

  radius_control_circle_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });

  /*************************** Angle Control Line Events ***************************/
  const angle_control_line_drag = d3.drag();
  this.angle_control_line.call(angle_control_line_drag);

  angle_control_line_drag.on("start", function(d) {
    if (d3.event?.sourceEvent?.type === "touchstart") {
      d3.select(this).attr("class", "visible");
    }
  });

  angle_control_line_drag.on("drag", function(d) {
    if (d3.event?.sourceEvent?.type === "touchmove") {
      const temp_angle_rad = Math.atan2(-d3.event.y, d3.event.x);
      if (!isNaN(temp_angle_rad)) {
        d.angle_rad = temp_angle_rad;
      }
      d.update();
    }
  });

  angle_control_line_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });

  /*************************** xComponent Control Circle Events ***************************/
  const xComponent_control_circle_drag = d3.drag();
  this.xComponent_control_circle.call(xComponent_control_circle_drag);

  xComponent_control_circle_drag.on("start", function(d) {
    if (d3.event?.sourceEvent?.type === "touchstart") {
      d3.select(this).attr("class", "visible");
      d.temp_pos.xComponent_length = d.xComponent_length || 0;
      d.temp_pos.yComponent_length = d.yComponent_length || 0;
    }
  });

  xComponent_control_circle_drag.on("drag", function(d) {
    if (d3.event?.sourceEvent?.type === "touchmove") {
      d.temp_pos.xComponent_length += d3.event.dx;
      const temp_r = Math.sqrt(d.temp_pos.xComponent_length ** 2 + d.temp_pos.yComponent_length ** 2);
      const temp_angle_rad = Math.atan2(d.temp_pos.yComponent_length, d.temp_pos.xComponent_length);
      if (!isNaN(temp_r) && !isNaN(temp_angle_rad)) {
        d.r = temp_r;
        d.angle_rad = temp_angle_rad;
      }
      d.update();
    }
  });

  xComponent_control_circle_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });

  /*************************** yComponent Control Circle Events ***************************/
  const yComponent_control_circle_drag = d3.drag();
  this.yComponent_control_circle.call(yComponent_control_circle_drag);

  yComponent_control_circle_drag.on("start", function(d) {
    if (d3.event?.sourceEvent?.type === "touchstart") {
      d3.select(this).attr("class", "visible");
      d.temp_pos.xComponent_length = d.xComponent_length || 0;
      d.temp_pos.yComponent_length = d.yComponent_length || 0;
    }
  });

  yComponent_control_circle_drag.on("drag", function(d) {
    if (d3.event?.sourceEvent?.type === "touchmove") {
      d.temp_pos.yComponent_length -= d3.event.dy;
      const temp_r = Math.sqrt(d.temp_pos.xComponent_length ** 2 + d.temp_pos.yComponent_length ** 2);
      const temp_angle_rad = Math.atan2(d.temp_pos.yComponent_length, d.temp_pos.xComponent_length);
      if (!isNaN(temp_r) && !isNaN(temp_angle_rad)) {
        d.r = temp_r;
        d.angle_rad = temp_angle_rad;
      }
      d.update();
    }
  });

  yComponent_control_circle_drag.on("end", function(d) {
    d3.select(this).attr("class", "invisible");
  });

  /*************************** Vector Resolve Rect Events ***************************/
  let tempArray = [], temp_resolved = false;
  this.vector_resolve_rect.on("touchstart", function(d) {
    tempArray = [];
    temp_resolved = false;
    if (d3.event?.targetTouches?.length === 2) {
      d3.selectAll(".projection_" + d.vectorID).styles({ "display": null });
    } else {
      d3.selectAll(".projection_" + d.vectorID).styles({ "display": "none" });
    }
  });

  this.vector_resolve_rect.on("touchmove", function(d) {
    if (d3.event?.targetTouches?.length === 2) {
      tempArray.push(d3.event);
      if (tempArray.length > 5) tempArray.splice(0, 1);
      const dist_1 = distpoints(
        tempArray[0].targetTouches[0].pageX,
        tempArray[0].targetTouches[0].pageY,
        tempArray[0].targetTouches[1].pageX,
        tempArray[0].targetTouches[1].pageY
      );
      const dist_2 = distpoints(
        tempArray[tempArray.length - 1].targetTouches[0].pageX,
        tempArray[tempArray.length - 1].targetTouches[0].pageY,
        tempArray[tempArray.length - 1].targetTouches[1].pageX,
        tempArray[tempArray.length - 1].targetTouches[1].pageY
      );
      const temp_speed = (dist_1 - dist_2) / (tempArray[0].timeStamp - tempArray[tempArray.length - 1].timeStamp || 1);
      if (temp_speed > 0.4 && !temp_resolved && d.resolution_allowed && typeof d.resolve_vector === "function") {
        d.resolve_vector();
        temp_resolved = true;
      }
    } else {
      tempArray = [];
    }
  });

  this.vector_resolve_rect.on("touchend", function(d) {
    if (d.vector_mode === "polar") {
      d3.selectAll(".projection_" + d.vectorID).styles({ "display": "none" });
    }
    tempArray = [];
    temp_resolved = false;
  });
};