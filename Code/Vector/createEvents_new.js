/***********************************************************************************/
/* createEvents.js */

createVector.prototype.createEvents = function() {
  // Initialize temp_pos per vector instance
  this.temp_pos = { x: 0, y: 0, cx: 0, cy: 0 };

  // Ensure container carries an id/data attribute and class so global handlers can map DOM -> vector
  try {
    if (this.container) {
      this.container.attr && this.container.attr("data-vector-id", this.vectorID);
      this.container.classed && this.container.classed("vector_g", true);
    }
  } catch (err) {
    console.warn("Unable to set data-vector-id/class on container for vectorID:", this.vectorID, err);
  }

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
  });

  /*************************** Addition Centre Circle Events ***************************/
  this.create_addition_centre_circle = function() {
    if (!this.parent?.canvas) return;
    this.addition_centre_circle = this.parent.canvas.append("circle")
      .classed("addition-centre-circle", true)
      .styles({ "fill": this.gray_color || "gray", "fill-opacity": 0, "stroke": "none" })
      .attrs({ cx: this.cx, cy: this.cy, r: this.control_circle_radius || 10 })
      .data([this]);

    this.addition_centre_circle.on("touchstart", function(d) {
      if (!d.addition_data?.patner) return;
      d3.select(this).styles({ "fill-opacity": 0.4 });
      d.temp_circle = d.parent.canvas.append("circle")
        .classed("addition-temp-circle", true)
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
          }
        });
    });

    this.addition_centre_circle.on("touchend", function(d) {
      d3.select(this).styles({ "fill-opacity": 0 });
      if (d.temp_circle) d.temp_circle.remove();
    });
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
    // NOTE: removed synthetic click dispatch here to avoid unwanted gesture starts.
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

  // NOTE: removed synthetic angle_control_line click/touch dispatch to avoid interfering with gesture start

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

  /*************************************************************************/
  /* Added: show/hide resolve table and wrap resolve_vector to display table */
  /*************************************************************************/

  // create the resolve table (HTML inside an SVG foreignObject) and keep it until user closes
  this.showResolveTable = function() {
    if (!this.parent?.canvas) return;
    // if already shown, do nothing
    if (this._resolve_table_node) return;

    // Layout parameters
    const tableWidth = 420;
    const tableHeight = 140;
    const padding = 8;

    // Position the table below the vector's circle (cx, cy are svg coords)
    const xPos = (this.cx || 0) - tableWidth / 2;
    const yPos = (this.cy || 0) + (this.r || this.control_circle_radius || 10) + 12;

    // Build HTML content for the table matching the requested layout
    const html = `
      <div xmlns='http://www.w3.org/1999/xhtml' style='font-family: Arial, Helvetica, sans-serif; font-size:13px; color:#073642;'>
        <div style='display:flex; align-items:flex-start; gap:8px;'>
          <div style='min-width:200px;'>
            <div style='display:flex; justify-content:space-between; align-items:center; padding:4px 6px;'>
              <div style='text-align:left; font-weight:600;'>Zx</div>
              <div style='text-align:center;'>=</div>
              <div style='text-align:right;'>Zr <span style="opacity:0.9">cos(</span> Aθ <span style="opacity:0.9">)</span></div>
            </div>
            <div style='display:flex; justify-content:space-between; padding:0 6px;'>
              <div style='text-align:left; font-weight:700; font-size:16px;'>12</div>
              <div style='text-align:center; color:rgba(0,0,0,0.6);'>18</div>
              <div style='text-align:right; font-weight:700; font-size:16px;'>46</div>
            </div>
          </div>

          <div style='min-width:200px;'>
            <div style='display:flex; justify-content:space-between; align-items:center; padding:4px 6px;'>
              <div style='text-align:left; font-weight:600;'>Zy</div>
              <div style='text-align:center;'>=</div>
              <div style='text-align:right;'>Zr <span style="opacity:0.9">sin(</span> Aθ <span style="opacity:0.9">)</span></div>
            </div>
            <div style='display:flex; justify-content:space-between; padding:0 6px;'>
              <div style='text-align:left; font-weight:700; font-size:16px;'>13</div>
              <div style='text-align:center; color:rgba(0,0,0,0.6);'>18</div>
              <div style='text-align:right; font-weight:700; font-size:16px;'>46</div>
            </div>
          </div>
        </div>

        <hr style='margin:8px 0; border:none; border-top:1px solid rgba(0,0,0,0.12)' />

        <div style='text-align:center; font-weight:600;'>
          Z̄ = <span style='display:inline-block; min-width:50px; text-align:right;'>12</span> i + <span style='display:inline-block; min-width:50px; text-align:right;'>13</span> j
        </div>

        <div style='position:absolute; right:6px; top:6px;'>
          <button id='close_resolve_${this.vectorID}' style='border:none; background:#eee; padding:4px 6px; border-radius:4px; cursor:pointer;'>×</button>
        </div>
      </div>
    `;

    // append foreignObject to svg
    const fo = this.parent.canvas.append('foreignObject')
      .attr('class', 'vector-resolve-fo vector-resolve-' + this.vectorID)
      .attr('x', xPos)
      .attr('y', yPos)
      .attr('width', tableWidth)
      .attr('height', tableHeight)
      .data([this]);

    fo.append('xhtml:div')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml')
      .html(html);

    // store reference
    this._resolve_table_node = fo;

    // attach close handler via DOM (needs to run after appended)
    try {
      // query the close button within the foreignObject
      const btn = document.getElementById('close_resolve_' + this.vectorID);
      if (btn) {
        btn.addEventListener('click', () => {
          this.hideResolveTable();
        });
      }
    } catch (err) {
      // ignore
      console.warn('Could not attach close handler for resolve table', err);
    }
  };

  this.hideResolveTable = function() {
    if (!this._resolve_table_node) return;
    try {
      this._resolve_table_node.remove();
    } catch (err) {
      console.warn('Error removing resolve table', err);
    }
    this._resolve_table_node = null;
  };

  // If resolve_vector already exists, wrap it to show the table after resolution
  if (typeof this.resolve_vector === 'function') {
    const original_resolve = this.resolve_vector.bind(this);
    this.resolve_vector = function() {
      // call original functionality
      original_resolve();
      // show the resolve table and keep it until user closes
      try {
        this.showResolveTable();
      } catch (err) {
        console.warn('Error showing resolve table after resolve_vector', err);
      }
    };
  } else {
    // If resolve_vector is not defined yet, provide a safe placeholder that shows the table when invoked
    this.resolve_vector = function() {
      // custom resolution placeholder: show the table
      try {
        this.showResolveTable();
      } catch (err) {
        console.warn('resolve_vector placeholder failed', err);
      }
    };
  }

  // ensure table removed when vector container hidden/deleted
  const orig_container_styles = this.container && this.container.styles ? this.container.styles : null;
  // hook into delete path by overriding centre_control_circle touchend logic is already removing container; listen for removal
  const self = this;
  // observe DOM removal (best-effort): when container is removed, hide table
  try {
    const observer = new MutationObserver(function(mutations) {
      for (const m of mutations) {
        for (const node of (m.removedNodes || [])) {
          if (node === self.container && self._resolve_table_node) {
            self.hideResolveTable();
          }
        }
      }
    });
    if (this.container && this.container.node) {
      const parentNode = this.container.node().parentNode;
      if (parentNode) observer.observe(parentNode, { childList: true });
    }
  } catch (err) {
    // ignore observer errors
  }

};
