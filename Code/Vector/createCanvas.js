/***********************************************************************************/
/* createCanvas.js */
function createCanvas(element) {
  var element_width = parseInt(element.style("width"));
  var element_height = parseInt(element.style("height"));
  var outer_div = element.append("div").styles({ "width": element_width, "height": element_height });
  screen_svg = {};
  screen_svg.canvas = outer_div.append("svg").styles({ "width": "100%", "height": "100%" });
  screen_svg.vector_log = [];
  screen_svg.vector_list = [];
  screen_svg.vectorID = -1;
  screen_svg.settings = { show_decimals: false };
  screen_svg.addition_log = [];
  screen_svg.multiplication_log = [];
  screen_svg.division_log = [];
  // NEW: mode for gestures: null | "multiply" | "divide"
  screen_svg.mode = null;
  // NEW: store a currently active gesture object (dotted line, source vector, target angle, etc.)
  screen_svg.gesture = null;
  screen_svg.canvas.on("touchstart", function () {
    d3.event.preventDefault();
  });
  screen_svg.canvas.on("touchmove", function () {
    d3.event.preventDefault();
  });
  createCanvasEvents();
  /*************************** Heading ***************************/
  screen_svg.canvas.append("text")
    .styles({ "font-size": 2 * screen_size, "fill": "black", "font-family": "serif" })
    .attrs({ x: 0.5 * innerWidth, y: 4 * screen_size })
    .text("Touchy Feely Complex Numbers");
  /*************************** Refresh Icon ***************************/
  refresh_icon_size = 3 * screen_dpi;
  temp_pos = { x: 0.92 * innerWidth, y: 8 * screen_size };
  screen_svg.canvas.append("image")
    .attrs({ x: temp_pos.x - 0.5 * refresh_icon_size, y: temp_pos.y - 0.5 * refresh_icon_size, width: refresh_icon_size, height: refresh_icon_size, "xlink:href": "../../Images/settings.svg" });
  refresh_icon_circle = screen_svg.canvas.append("circle")
    .styles({ "fill": "gray", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size })
    .attrs({ cx: temp_pos.x, cy: temp_pos.y, r: 0.8 * refresh_icon_size });
  refresh_icon_circle.on("touchstart", function () {
    d3.select(this).styles({ "fill-opacity": 0.2, "stroke": "#555" });
  });
  refresh_icon_circle.on("touchend", function () {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  });
  refresh_icon_circle.on("click", function () {
    swal({
      title: 'Settings',
      html: '<input id="settings_show_decimals" type="checkbox" ' + (screen_svg.settings.show_decimals ? "checked = ''" : "") + ' /> Show Decimals',
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: 'Done',
    }).then((result) => {
      screen_svg.settings.show_decimals = document.getElementById('settings_show_decimals').checked;
      screen_svg.vector_log.forEach(function (vector) {
        if(vector) vector.update();
      });
    });
  });
  temp_pos = { x: 0.92 * innerWidth, y: 12 * screen_size };
  screen_svg.canvas.append("image")
    .attrs({ x: temp_pos.x - 0.5 * refresh_icon_size, y: temp_pos.y - 0.5 * refresh_icon_size, width: refresh_icon_size, height: refresh_icon_size, "xlink:href": "../../Images/refresh.svg" });
  refresh_icon_circle = screen_svg.canvas.append("circle")
    .styles({ "fill": "gray", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size })
    .attrs({ cx: temp_pos.x, cy: temp_pos.y, r: 0.8 * refresh_icon_size });
  refresh_icon_circle.on("touchstart", function () {
    d3.select(this).styles({ "fill-opacity": 0.2, "stroke": "#555" });
  });
  refresh_icon_circle.on("touchend", function () {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  });
  refresh_icon_circle.on("click", function () {
    d3.selectAll(".vector_g").remove();
    screen_svg.vector_list = [];
    screen_svg.addition_log = [];
    screen_svg.multiplication_log = [];
    screen_svg.division_log = [];
    screen_svg.vectorID = -1;
    if (screen_svg.addition_table) {
      screen_svg.addition_table.styles({ "display": "none" });
    }
    if (screen_svg.multiplication_table) {
      screen_svg.multiplication_table.styles({ "display": "none" });
    }
    if (screen_svg.division_table) {
      screen_svg.division_table.styles({ "display": "none" });
    }
    // reset any gesture/mode
    screen_svg.mode = null;
    if (screen_svg.gesture) {
      clearGesture();
    }
    updateIconStates();
  });
  /*************************** Help Icon ***************************/
  //screen_svg.canvas
  //  .append("text")
  //  .styles({ "font-family": "FontAwesome", "font-size": 2 * 3 * screen_dpi, "dominant-baseline": "central", "text-anchor": "middle", "fill": "#707070", 'cursor': 'pointer' })
  //  .attrs({ "x": temp_pos.x, y: temp_pos.y + 51 * screen_dpi })
  //  .html("\uf29c")
  //  .on("click", function () {
  //    window.open("https://youtu.be/RR1WX6o5hfM", "_default");
  //  });
  /*************************** Multiplication Action Icon (NEW) ***************************/
  // This icon activates multiplication-gesture mode. It is placed below the Help icon as requested.
  let multiply_action_icon_size = 3 * screen_dpi;
  // Position it just below the help icon (adjust offset as necessary)
  let multiply_action_pos = { x: temp_pos.x, y: temp_pos.y + 30 * screen_dpi };
  screen_svg.canvas.append("image")
    .attrs({
      x: multiply_action_pos.x - 0.5 * multiply_action_icon_size,
      y: multiply_action_pos.y - 0.5 * multiply_action_icon_size,
      width: multiply_action_icon_size,
      height: multiply_action_icon_size,
      // reuse existing multiplication image; replace path if different
      "xlink:href": "../../Images/mul.jpg"
    });
  let multiply_action_circle = screen_svg.canvas.append("circle")
    .styles({ "fill": "transparent", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size, "cursor": "pointer" })
    .attrs({ cx: multiply_action_pos.x, cy: multiply_action_pos.y, r: 0.8 * multiply_action_icon_size });
  multiply_action_circle.on("touchstart", function () {
    d3.select(this).styles({ "fill-opacity": 0.15, "stroke": "#555" });
  });
  multiply_action_circle.on("touchend", function () {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  });
  multiply_action_circle.on("click", function () {
    // Activate multiplication mode
    screen_svg.mode = (screen_svg.mode === "multiply") ? null : "multiply";
    // If toggling on, ensure division mode is off and any previous gesture cleared
    if (screen_svg.mode === "multiply") {
      if (screen_svg.gesture) clearGesture();
      swal({ title: "Multiplication Mode", text: "Tap any of the two center-locked complex numbers to start the multiplication gesture.", icon: "info", timer: 1400, buttons: false });
    } else {
      if (screen_svg.gesture) clearGesture();
    }
    updateIconStates();
    console.log("Mode is now:", screen_svg.mode);
  });
  /*************************** Division Action Icon (NEW) ***************************/
  // This icon activates division-gesture mode and is placed below multiplication icon.
  let divide_action_icon_size = 3 * screen_dpi;
  let divide_action_pos = { x: multiply_action_pos.x, y: multiply_action_pos.y + 5 * screen_dpi + divide_action_icon_size };
  screen_svg.canvas.append("image")
    .attrs({
      x: divide_action_pos.x - 0.5 * divide_action_icon_size,
      y: divide_action_pos.y - 0.5 * divide_action_icon_size,
      width: divide_action_icon_size,
      height: divide_action_icon_size,
      // reuse existing division image; replace path if different
      "xlink:href": "../../Images/div.png"
    });
  let divide_action_circle = screen_svg.canvas.append("circle")
    .styles({ "fill": "transparent", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size, "cursor": "pointer" })
    .attrs({ cx: divide_action_pos.x, cy: divide_action_pos.y, r: 0.8 * divide_action_icon_size });
  divide_action_circle.on("touchstart", function () {
    d3.select(this).styles({ "fill-opacity": 0.15, "stroke": "#555" });
  });
  divide_action_circle.on("touchend", function () {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  });
  divide_action_circle.on("click", function () {
    // Activate division mode
    screen_svg.mode = (screen_svg.mode === "divide") ? null : "divide";
    if (screen_svg.mode === "divide") {
      if (screen_svg.gesture) clearGesture();
      swal({ title: "Division Mode", text: "Place numerator on denominator (center-lock). Then tap the numerator to start the division gesture.", icon: "info", timer: 1600, buttons: false });
    } else {
      if (screen_svg.gesture) clearGesture();
    }
    updateIconStates();
    console.log("Mode is now:", screen_svg.mode);
  });
  function updateIconStates() {
    const isMultiply = screen_svg.mode === "multiply";
    const isDivide = screen_svg.mode === "divide";
    multiply_action_circle.styles({
      stroke: isMultiply ? "green" : "gray",
      fill: isMultiply ? "lightgreen" : "transparent",
      "fill-opacity": isMultiply ? 0.2 : 0
    });
    divide_action_circle.styles({
      stroke: isDivide ? "green" : "gray",
      fill: isDivide ? "lightgreen" : "transparent",
      "fill-opacity": isDivide ? 0.2 : 0
    });
  }
  /*************************** Conjugate Icon ***************************/
  let conj_icon_size = 3 * screen_dpi;
  temp_pos = { x: 0.92 * innerWidth, y: 20.2 * screen_size };
  screen_svg.canvas.append("image")
    .attrs({
      x: temp_pos.x - 0.5 * conj_icon_size,
      y: temp_pos.y - 0.5 * conj_icon_size,
      width: conj_icon_size,
      height: conj_icon_size,
      "xlink:href": "../../Images/conjugate.png"
    });
  let conj_icon_circle = screen_svg.canvas.append("circle")
    .styles({ "fill": "gray", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size })
    .attrs({ cx: temp_pos.x, cy: temp_pos.y, r: 0.8 * conj_icon_size });
  conj_icon_circle.on("touchstart", function() {
    d3.select(this).styles({ "fill-opacity": 0.2, "stroke": "#555" });
  });
  conj_icon_circle.on("touchend", function() {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  });
  conj_icon_circle.on("click", function() {
    if (screen_svg.activeVector) {
      screen_svg.activeVector.conjugate();
    } else {
      console.log("No active vector selected");
    }
  });
  /*************************** Flip Button ***********************/
  temp_pos = { x: 0.92 * innerWidth, y: 7 * screen_size };
  screen_svg.canvas.append("image")
    .attrs({ x: temp_pos.x - 0.5 * refresh_icon_size, y: temp_pos.y + 10 * refresh_icon_size, width: refresh_icon_size, height: refresh_icon_size, "xlink:href": "../../Images/flip.jpg" });
  flip_icon = screen_svg.canvas.append("circle")
    .styles({ "fill": "gray", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size })
    .attrs({ cx: temp_pos.x , cy: temp_pos.y + 10.5 * refresh_icon_size, r: 0.8 * refresh_icon_size });
  flip_icon.on("touchstart", function () {
    d3.select(this).styles({ "fill-opacity": 0.2, "stroke": "#555" });
  })
  flip_icon.on("touchend", function () {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  })
  flip_icon.classed("flip-button", true);
  flip_icon.on("click", function() {
    if (screen_svg.activeVector) {
      screen_svg.activeVector.flip_vector();
    } else {
      console.log("No active vector selected");
    }
  });
  /*************************** Formula Icon ***************************/
  let formula_icon_size = 3 * screen_dpi;
  temp_pos = { x: 0.92 * innerWidth, y: 16 * screen_size };
  screen_svg.canvas.append("image")
    .attrs({
      x: temp_pos.x - 0.5 * formula_icon_size,
      y: temp_pos.y - 0.5 * formula_icon_size,
      width: formula_icon_size,
      height: formula_icon_size,
      "xlink:href": "../../Images/formula.png"
    });
  let formula_icon_circle = screen_svg.canvas.append("circle")
    .styles({ "fill": "gray", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size })
    .attrs({ cx: temp_pos.x, cy: temp_pos.y, r: 0.8 * formula_icon_size });
  formula_icon_circle.on("touchstart", function() {
    d3.select(this).styles({ "fill-opacity": 0.2, "stroke": "#555" });
  });
  formula_icon_circle.on("touchend", function() {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  });
  formula_icon_circle.on("click", function() {
    console.log("Formula icon clicked");
    toggleFormulaBox();
  });

  /*************************** Addition Table Icon (COMMENTED OUT) ***************************/
  /*
  let table_icon_size = 3 * screen_dpi;
  temp_pos = { x: 0.92 * innerWidth, y: 24.5 * screen_size };
  screen_svg.canvas.append("image")
    .attrs({
      x: temp_pos.x - 0.5 * table_icon_size,
      y: temp_pos.y - 0.5 * table_icon_size,
      width: table_icon_size,
      height: table_icon_size,
      "xlink:href": "../../Images/add.jpg"
    });
  let table_icon_circle = screen_svg.canvas.append("circle")
    .styles({ "fill": "gray", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size })
    .attrs({ cx: temp_pos.x, cy: temp_pos.y, r: 0.8 * table_icon_size });
  table_icon_circle.on("touchstart", function() {
    d3.select(this).styles({ "fill-opacity": 0.2, "stroke": "#555" });
  });
  table_icon_circle.on("touchend", function() {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  });
  table_icon_circle.on("click", function() {
    console.log("Addition table icon clicked");
    toggleAdditionTable();
  });
  */

  /*************************** Multiplication Table (ICON) (COMMENTED OUT) ***************************/
  /*
  let mult_table_icon_size = 3 * screen_dpi;
  temp_pos = { x: 0.92 * innerWidth, y: 32.3 * screen_size };
  screen_svg.canvas.append("image")
    .attrs({
      x: temp_pos.x - 0.5 * mult_table_icon_size,
      y: temp_pos.y - 0.5 * mult_table_icon_size,
      width: mult_table_icon_size,
      height: mult_table_icon_size,
      "xlink:href": "../../Images/mul.jpg"
    });
  let mult_table_icon_circle = screen_svg.canvas.append("circle")
    .styles({ "fill": "gray", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size })
    .attrs({ cx: temp_pos.x, cy: temp_pos.y, r: 0.8 * mult_table_icon_size });
  mult_table_icon_circle.on("touchstart", function() {
    d3.select(this).styles({ "fill-opacity": 0.2, "stroke": "#555" });
  });
  mult_table_icon_circle.on("touchend", function() {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  });
  mult_table_icon_circle.on("click", function() {
    console.log("Multiplication table icon clicked");
    toggleMultiplicationTable();
  });
  */

  /*************************** Division Table (ICON) (COMMENTED OUT) ***************************/
  /*
  let div_table_icon_size = 3 * screen_dpi;
  temp_pos = { x: 0.92 * innerWidth, y: 36.2 * screen_size };
  screen_svg.canvas.append("image")
    .attrs({
      x: temp_pos.x - 0.5 * div_table_icon_size,
      y: temp_pos.y - 0.5 * div_table_icon_size,
      width: div_table_icon_size,
      height: div_table_icon_size,
      "xlink:href": "../../Images/div.png"
    });
  let div_table_icon_circle = screen_svg.canvas.append("circle")
    .styles({ "fill": "gray", "fill-opacity": 0, "stroke": "gray", "stroke-width": 0.2 * screen_size })
    .attrs({ cx: temp_pos.x, cy: temp_pos.y, r: 0.8 * div_table_icon_size });
  div_table_icon_circle.on("touchstart", function() {
    d3.select(this).styles({ "fill-opacity": 0.2, "stroke": "#555" });
  });
  div_table_icon_circle.on("touchend", function() {
    d3.select(this).styles({ "fill-opacity": 0, "stroke": "gray" });
  });
  div_table_icon_circle.on("click", function() {
    console.log("Division table icon clicked");
    toggleDivisionTable();
  });
  */

  /*************************** Formula Box ***************************/
  screen_svg.formula_box = d3.select('body').append("div")
    .styles({
      "display": "none",
      "position": "fixed",
      "top": "10%",
      "left": "10%",
      "width": "80%",
      "height": "80%",
      "background-color": "white",
      "border": "2px solid #cccccc",
      "border-radius": "15px",
      "box-shadow": "0 4px 8px rgba(0,0,0,0.2)",
      "z-index": "1000",
      "overflow-y": "auto",
      "padding": "20px"
    });
  screen_svg.formula_box.append("div")
    .styles({
      "font-size": 2 * screen_size + "px",
      "font-family": "sans-serif",
      "color": "#333333",
      "font-weight": "bold",
      "text-align": "center",
      "margin-bottom": "20px"
    })
    .text("Complex Number Formulas");
  screen_svg.formula_box.append("div")
    .styles({
      "font-family": "sans-serif",
      "font-size": 1.3 * screen_size + "px",
      "color": "#333333",
      "text-align": "left",
      "padding": "10px",
      "line-height": "1.4"
    })
    .html(`
      <div style="font-weight: bold; color: #007bff; margin-bottom: 5px;">Addition (Rectangular):</div>
      <div>\\( (a + bi) + (c + di) = (a + c) + (b + d)i \\)</div>
    `);
  screen_svg.formula_box.append("div")
    .styles({
      "font-family": "sans-serif",
      "font-size": 1.3 * screen_size + "px",
      "color": "#333333",
      "text-align": "left",
      "padding": "10px",
      "line-height": "1.4"
    })
    .html(`
      <div style="font-weight: bold; color: #007bff; margin-bottom: 5px;">Addition (Polar):</div>
      <div>\\( r_1(\\cos\\theta_1 + i\\sin\\theta_1) + r_2(\\cos\\theta_2 + i\\sin\\theta_2) = (r_1\\cos\\theta_1 + r_2\\cos\\theta_2) + i(r_1\\sin\\theta_1 + r_2\\sin\\theta_2) \\)</div>
    `);
  screen_svg.formula_box.append("div")
    .styles({
      "font-family": "sans-serif",
      "font-size": 1.3 * screen_size + "px",
      "color": "#333333",
      "text-align": "left",
      "padding": "10px",
      "line-height": "1.4"
    })
    .html(`
      <div style="font-weight: bold; color: #007bff; margin-bottom: 5px;">Multiplication (Rectangular):</div>
      <div>\\( (a + bi)(c + di) = (ac - bd) + (ad + bc)i \\)</div>
    `);
  screen_svg.formula_box.append("div")
    .styles({
      "font-family": "sans-serif",
      "font-size": 1.3 * screen_size + "px",
      "color": "#333333",
      "text-align": "left",
      "padding": "10px",
      "line-height": "1.4"
    })
    .html(`
      <div style="font-weight: bold; color: #007bff; margin-bottom: 5px;">Multiplication (Polar):</div>
      <div>\\( r_1(\\cos\\theta_1 + i\\sin\\theta_1) \\cdot r_2(\\cos\\theta_2 + i\\sin\\theta_2) = r_1 r_2 [\\cos(\\theta_1 + \\theta_2) + i\\sin(\\theta_1 + \\theta_2)] \\)</div>
    `);
  screen_svg.formula_box.append("div")
    .styles({
      "font-family": "sans-serif",
      "font-size": 1.3 * screen_size + "px",
      "color": "#333333",
      "text-align": "left",
      "padding": "10px",
      "line-height": "1.4"
    })
    .html(`
      <div style="font-weight: bold; color: #007bff; margin-bottom: 5px;">Division (Polar):</div>
      <div>\\( \\frac{r_1(\\cos\\theta_1 + i\\sin\\theta_1)}{r_2(\\cos\\theta_2 + i\\sin\\theta_2)} = \\frac{r_1}{r_2} [\\cos(\\theta_1 - \\theta_2) + i\\sin(\\theta_1 - \\theta_2)] \\)</div>
    `);
  screen_svg.formula_box.append("div")
    .styles({
      "position": "absolute",
      "top": "10px",
      "right": "10px",
      "width": "30px",
      "height": "30px",
      "background-color": "#ff4d4d",
      "border-radius": "50%",
      "display": "flex",
      "align-items": "center",
      "justify-content": "center",
      "cursor": "pointer",
      "color": "white",
      "font-size": 1.5 * screen_size + "px",
      "text-align": "center"
    })
    .text("×")
    .on("click", function() {
      screen_svg.formula_box.styles({ "display": "none" });
    });
  /*************************** Addition Table ***************************/
  screen_svg.addition_table = screen_svg.canvas.append("g")
    .styles({ "display": "none" });
  const tableWidth = 0.8 * innerWidth;
  const tableHeight = 0.25 * innerHeight;
  const tableX = 0.1 * innerWidth;
  const tableY = 0.65 * innerHeight;
  const rowHeight = tableHeight / 4;
  const colWidth = tableWidth / 5;
  screen_svg.addition_table.append("rect")
    .attrs({
      x: tableX,
      y: tableY,
      width: tableWidth,
      height: tableHeight,
      rx: 10,
      ry: 10,
      "class": "addition-table-bg"
    });
  for (let row = 1; row < 4; row++) {
    screen_svg.addition_table.append("line")
      .attrs({
        x1: tableX,
        y1: tableY + row * rowHeight,
        x2: tableX + tableWidth,
        y2: tableY + row * rowHeight,
        "class": "table-grid"
      });
  }
  for (let col = 1; col < 5; col++) {
    screen_svg.addition_table.append("line")
      .attrs({
        x1: tableX + col * colWidth,
        y1: tableY,
        x2: tableX + col * colWidth,
        y2: tableY + tableHeight,
        "class": "table-grid"
      });
  }
  const headers = ["Symbol", "Magnitude", "Angle (°)", "X-Comp", "Y-Comp"];
  headers.forEach((header, i) => {
    screen_svg.addition_table.append("rect")
      .attrs({
        x: tableX + i * colWidth,
        y: tableY,
        width: colWidth,
        height: rowHeight,
        "class": "table-header"
      });
    screen_svg.addition_table.append("text")
      .attrs({
        x: tableX + (i + 0.5) * colWidth,
        y: tableY + 0.5 * rowHeight,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "class": "table-header-text"
      })
      .text(header);
  });
  for (let row = 1; row <= 3; row++) {
    for (let col = 0; col < 5; col++) {
      screen_svg.addition_table.append("rect")
        .attrs({
          x: tableX + col * colWidth,
          y: tableY + row * rowHeight,
          width: colWidth,
          height: rowHeight,
          "class": `table-cell-bg row-${row}`
        });
      screen_svg.addition_table.append("text")
        .attrs({
          x: tableX + (col + 0.5) * colWidth,
          y: tableY + (row + 0.5) * rowHeight,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          "class": `table-cell row-${row} col-${col}`
        });
    }
  }
  /*************************** Multiplication Table ***************************/
  screen_svg.multiplication_table = screen_svg.canvas.append("g")
    .styles({ "display": "none" });
  screen_svg.multiplication_table.append("rect")
    .attrs({
      x: tableX,
      y: tableY,
      width: tableWidth,
      height: tableHeight,
      rx: 10,
      ry: 10,
      "class": "multiplication-table-bg"
    });
  for (let row = 1; row < 4; row++) {
    screen_svg.multiplication_table.append("line")
      .attrs({
        x1: tableX,
        y1: tableY + row * rowHeight,
        x2: tableX + tableWidth,
        y2: tableY + row * rowHeight,
        "class": "table-grid"
      });
  }
  for (let col = 1; col < 5; col++) {
    screen_svg.multiplication_table.append("line")
      .attrs({
        x1: tableX + col * colWidth,
        y1: tableY,
        x2: tableX + col * colWidth,
        y2: tableY + tableHeight,
        "class": "table-grid"
      });
  }
  headers.forEach((header, i) => {
    screen_svg.multiplication_table.append("rect")
      .attrs({
        x: tableX + i * colWidth,
        y: tableY,
        width: colWidth,
        height: rowHeight,
        "class": "table-header"
      });
    screen_svg.multiplication_table.append("text")
      .attrs({
        x: tableX + (i + 0.5) * colWidth,
        y: tableY + 0.5 * rowHeight,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "class": "table-header-text"
      })
      .text(header);
  });
  for (let row = 1; row <= 3; row++) {
    for (let col = 0; col < 5; col++) {
      screen_svg.multiplication_table.append("rect")
        .attrs({
          x: tableX + col * colWidth,
          y: tableY + row * rowHeight,
          width: colWidth,
          height: rowHeight,
          "class": `table-cell-bg row-${row}`
        });
      screen_svg.multiplication_table.append("text")
        .attrs({
          x: tableX + (col + 0.5) * colWidth,
          y: tableY + (row + 0.5) * rowHeight,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          "class": `table-cell row-${row} col-${col}`
        });
    }
  }
  /*************************** Division Table ***************************/
  screen_svg.division_table = screen_svg.canvas.append("g")
    .styles({ "display": "none" });
  screen_svg.division_table.append("rect")
    .attrs({
      x: tableX,
      y: tableY,
      width: tableWidth,
      height: tableHeight,
      rx: 10,
      ry: 10,
      "class": "division-table-bg"
    });
  for (let row = 1; row < 4; row++) {
    screen_svg.division_table.append("line")
      .attrs({
        x1: tableX,
        y1: tableY + row * rowHeight,
        x2: tableX + tableWidth,
        y2: tableY + row * rowHeight,
        "class": "table-grid"
      });
  }
  for (let col = 1; col < 5; col++) {
    screen_svg.division_table.append("line")
      .attrs({
        x1: tableX + col * colWidth,
        y1: tableY,
        x2: tableX + col * colWidth,
        y2: tableY + tableHeight,
        "class": "table-grid"
      });
  }
  headers.forEach((header, i) => {
    screen_svg.division_table.append("rect")
      .attrs({
        x: tableX + i * colWidth,
        y: tableY,
        width: colWidth,
        height: rowHeight,
        "class": "table-header"
      });
    screen_svg.division_table.append("text")
      .attrs({
        x: tableX + (i + 0.5) * colWidth,
        y: tableY + 0.5 * rowHeight,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "class": "table-header-text"
      })
      .text(header);
  });
  for (let row = 1; row <= 3; row++) {
    for (let col = 0; col < 5; col++) {
      screen_svg.division_table.append("rect")
        .attrs({
          x: tableX + col * colWidth,
          y: tableY + row * rowHeight,
          width: colWidth,
          height: rowHeight,
          "class": `table-cell-bg row-${row}`
        });
      screen_svg.division_table.append("text")
        .attrs({
          x: tableX + (col + 0.5) * colWidth,
          y: tableY + (row + 0.5) * rowHeight,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          "class": `table-cell row-${row} col-${col}`
        });
    }
  }
  /*************************** Toggle Formula Box Function ***************************/
  function toggleFormulaBox() {
    const isVisible = screen_svg.formula_box.style("display") !== "none";
    screen_svg.formula_box.style("display", isVisible ? "none" : "block");
    if (!isVisible) {
      setTimeout(() => {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
      }, 100);
    }
  }
  /*************************** Toggle Addition Table Function ***************************/
  function toggleAdditionTable() {
    console.log("toggleAdditionTable called, addition_log:", screen_svg.addition_log);
    if (!screen_svg.addition_log || screen_svg.addition_log.length === 0) {
      console.log("No addition performed");
      swal({
        title: "No Addition Performed",
        text: "Please add two vectors to create a resultant vector first.",
        icon: "warning"
      });
      return;
    }
    const isVisible = screen_svg.addition_table.style("display") !== "none";
    screen_svg.addition_table.style("display", isVisible ? "none" : "block");
    console.log("Addition table visibility toggled to:", isVisible ? "hidden" : "visible");
    if (!isVisible) {
      try {
        const addition = screen_svg.addition_log[screen_svg.addition_log.length - 1];
        console.log("Latest addition:", addition);
        if (!addition || !addition.vector_1 || !addition.vector_2 || !addition.resultant) {
          console.error("Invalid addition data");
          screen_svg.addition_table.style("display", "none");
          swal({
            title: "Error",
            text: "Unable to display addition table due to invalid data.",
            icon: "error"
          });
          return;
        }
        const vectors = [
          addition.vector_1,
          addition.vector_2,
          addition.resultant
        ];
        vectors.forEach((vector, row) => {
          if (!vector) {
            console.warn(`Vector at row ${row} is undefined`);
            return;
          }
          const data = [
            vector.symbol || "N/A",
            screen_svg.settings.show_decimals ? (Math.round(radius_scale(vector.r) * 100) / 100).toFixed(2) : Math.round(radius_scale(vector.r)),
            screen_svg.settings.show_decimals ? (Math.round(vector.angle_deg * 100) / 100).toFixed(2) : Math.round(vector.angle_deg),
            screen_svg.settings.show_decimals ? (Math.round(vector.xComponent_length * 100) / 100).toFixed(2) : Math.round(vector.xComponent_length),
            screen_svg.settings.show_decimals ? (Math.round(vector.yComponent_length * 100) / 100).toFixed(2) : Math.round(vector.yComponent_length)
          ];
          data.forEach((value, col) => {
            screen_svg.addition_table.select(`.table-cell.row-${row + 1}.col-${col}`)
              .text(value);
          });
        });
        setTimeout(() => {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }, 100);
      } catch (error) {
        console.error("Error updating addition table:", error);
        screen_svg.addition_table.style("display", "none");
        swal({
          title: "Error",
          text: "An error occurred while updating the addition table.",
          icon: "error"
        });
      }
    }
  }
  /*************************** Toggle Multiplication Table Function ***************************/
  function toggleMultiplicationTable() {
    console.log("toggleMultiplicationTable called, multiplication_log:", screen_svg.multiplication_log);
    if (!screen_svg.multiplication_log || screen_svg.multiplication_log.length === 0) {
      console.log("No multiplication performed");
      swal({
        title: "No Multiplication Performed",
        text: "Please multiply two vectors to create a resultant vector first.",
        icon: "warning"
      });
      return;
    }
    const isVisible = screen_svg.multiplication_table.style("display") !== "none";
    screen_svg.multiplication_table.style("display", isVisible ? "none" : "block");
    console.log("Multiplication table visibility toggled to:", isVisible ? "hidden" : "visible");
    if (!isVisible) {
      try {
        const multiplication = screen_svg.multiplication_log[screen_svg.multiplication_log.length - 1];
        console.log("Latest multiplication:", multiplication);
        if (!multiplication || !multiplication.vector_1 || !multiplication.vector_2 || !multiplication.resultant) {
          console.error("Invalid multiplication data");
          screen_svg.multiplication_table.style("display", "none");
          swal({
            title: "Error",
            text: "Unable to display multiplication table due to invalid data.",
            icon: "error"
          });
          return;
        }
        const vectors = [
          multiplication.vector_1,
          multiplication.vector_2,
          multiplication.resultant
        ];
        vectors.forEach((vector, row) => {
          if (!vector) {
            console.warn(`Vector at row ${row} is undefined`);
            return;
          }
          const data = [
            vector.symbol || "N/A",
            screen_svg.settings.show_decimals ? (Math.round(radius_scale(vector.r) * 100) / 100).toFixed(2) : Math.round(radius_scale(vector.r)),
            screen_svg.settings.show_decimals ? (Math.round(vector.angle_deg * 100) / 100).toFixed(2) : Math.round(vector.angle_deg),
            screen_svg.settings.show_decimals ? (Math.round(vector.xComponent_length * 100) / 100).toFixed(2) : Math.round(vector.xComponent_length),
            screen_svg.settings.show_decimals ? (Math.round(vector.yComponent_length * 100) / 100).toFixed(2) : Math.round(vector.yComponent_length)
          ];
          data.forEach((value, col) => {
            screen_svg.multiplication_table.select(`.table-cell.row-${row + 1}.col-${col}`)
              .text(value);
          });
        });
        setTimeout(() => {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }, 100);
      } catch (error) {
        console.error("Error updating multiplication table:", error);
        screen_svg.multiplication_table.style("display", "none");
        swal({
          title: "Error",
          text: "An error occurred while updating the multiplication table.",
          icon: "error"
        });
      }
    }
  }
  /*************************** Toggle Division Table Function ***************************/
  function toggleDivisionTable() {
    console.log("toggleDivisionTableCalled, division_log:", screen_svg.division_log);
    if (!screen_svg.division_log || screen_svg.division_log.length === 0) {
      console.log("No division performed");
      swal({
        title: "No Division Performed",
        text: "Please divide two vectors to create a resultant vector first.",
        icon: "warning"
      });
      return;
    }
    const isVisible = screen_svg.division_table.style("display") !== "none";
    screen_svg.division_table.style("display", isVisible ? "none" : "block");
    console.log("Division table visibility toggled to:", isVisible ? "hidden" : "visible");
    if (!isVisible) {
      try {
        const division = screen_svg.division_log[screen_svg.division_log.length - 1];
        console.log("Latest division:", division);
        if (!division || !division.vector_1 || !division.vector_2 || !division.resultant) {
          console.error("Invalid division data");
          screen_svg.division_table.style("display", "none");
          swal({
            title: "Error",
            text: "Unable to display division table due to invalid data.",
            icon: "error"
          });
          return;
        }
        const vectors = [
          division.vector_1,
          division.vector_2,
          division.resultant
        ];
        vectors.forEach((vector, row) => {
          if (!vector) {
            console.warn(`Vector at row ${row} is undefined`);
            return;
          }
          const data = [
            vector.symbol || "N/A",
            screen_svg.settings.show_decimals ? (Math.round(radius_scale(vector.r) * 100) / 100).toFixed(2) : Math.round(radius_scale(vector.r)),
            screen_svg.settings.show_decimals ? (Math.round(vector.angle_deg * 100) / 100).toFixed(2) : Math.round(vector.angle_deg),
            screen_svg.settings.show_decimals ? (Math.round(vector.xComponent_length * 100) / 100).toFixed(2) : Math.round(vector.xComponent_length),
            screen_svg.settings.show_decimals ? (Math.round(vector.yComponent_length * 100) / 100).toFixed(2) : Math.round(vector.yComponent_length)
          ];
          data.forEach((value, col) => {
            screen_svg.division_table.select(`.table-cell.row-${row + 1}.col-${col}`)
              .text(value);
          });
        });
        setTimeout(() => {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }, 100);
      } catch (error) {
        console.error("Error updating division table:", error);
        screen_svg.division_table.style("display", "none");
        swal({
          title: "Error",
          text: "An error occurred while updating the division table.",
          icon: "error"
        });
      }
    }
  }
  /*************************** Footer ***************************/
  var temp_text = screen_svg.canvas.append("text")
    .attrs({ x: 0.5 * innerWidth, y: 0.97 * innerHeight })
    .styles({ "font-size": 2 * screen_dpi });
  temp_text.append("tspan")
    .styles({ "color": "gray" })
    .text("- designed by");
  temp_text.append("tspan")
    .styles({ "fill": "steelblue", "font-size": 2 * screen_dpi, "cursor": "hand", "font-weight": "normal", "font-family": "sans-serif" })
    .text(" Homi Bhabha Centre For Science Education")
    .on("click", function () {
      window.open("https://www.hbcse.tifr.res.in/", "_default");
    });
  /*************************** Gesture / Manipulator Helpers (NEW) ***************************/
  // These helper functions implement the dotted-line gesture UI for multiplication and division.
  // They make a best-effort integration with the existing vector objects. They are defensive:
  // if a required property doesn't exist on a vector, the function logs and notifies the user.

  // ---- NEW helper: invertRadiusScale(logical) ----
  // Converts a logical/display magnitude (what radius_scale(...) returns) back to SVG px radius.
  // Uses radius_scale.invert if available; otherwise uses a binary-search numeric invert.
  function invertRadiusScale(targetLogical) {
    try {
      if (typeof radius_scale === "function" && typeof radius_scale.invert === "function") {
        return radius_scale.invert(targetLogical);
      }
      // binary search fallback
      // search px in [0, maxPx]; choose a sufficiently large maxPx so big resultants are handled
      const maxPx = Math.max(innerWidth, innerHeight) * 3;
      let lo = 0;
      let hi = maxPx;
      // if radius_scale isn't defined (unlikely), treat mapping as identity
      if (typeof radius_scale !== "function") {
        return targetLogical;
      }
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        const val = radius_scale(mid);
        if (isNaN(val)) break;
        if (val > targetLogical) hi = mid;
        else lo = mid;
      }
      return (lo + hi) / 2;
    } catch (err) {
      console.error("invertRadiusScale error:", err);
      return targetLogical;
    }
  }
  // ---- END invert helper ----

  // Utility: find two vectors that are center-locked to each other (best-effort)
  function findCenterLockedPair() {
    // Try common property names that might indicate locking
    // Best-effort: check for lockedTo or locked_to or center_locked_to or locked_with
    const findLockId = (v) => v.lockedTo || v.locked_to || v.center_locked_to || v.locked_with || v.lockedToId || null;
    for (let i = 0; i < screen_svg.vector_list.length; i++) {
      const v1 = screen_svg.vector_list[i];
      if (!v1) continue;
      const lock = findLockId(v1);
      if (lock == null) continue;
      // try to find counterpart
      for (let j = 0; j < screen_svg.vector_list.length; j++) {
        if (i === j) continue;
        const v2 = screen_svg.vector_list[j];
        if (!v2) continue;
        const lock2 = findLockId(v2);
        // mutual lock or locked to the same center point
        if ( (typeof lock === 'number' && lock === v2.vectorID) ||
             (typeof lock2 === 'number' && lock2 === v1.vectorID) ||
             (lock === lock2 && lock != null) ) {
          return { v1: v1, v2: v2 };
        }
      }
    }
    // fallback: if there are exactly two vectors at almost same cx/cy, treat as locked
    if (screen_svg.vector_list.length === 2) {
      return { v1: screen_svg.vector_list[0], v2: screen_svg.vector_list[1] };
    }
    return null;
  }
  // freeze vectors used in a gesture so they don't move while gesture is active
  function freezeVectorsForGesture(lockedPair) {
    if (!lockedPair) return;
    [lockedPair.v1, lockedPair.v2].forEach(v => {
      if (!v) return;
      // attempt several common property names to disable movement/manipulation
      try { v.movementAllowedPrev = v.movementAllowed; v.movementAllowed = false; } catch (e) {}
      try { v.manipulationPossiblePrev = v.manipulationPossible; v.manipulationPossible = false; } catch (e) {}
      try { v.lockedForGesturePrev = v.lockedForGesture; v.lockedForGesture = true; } catch (e) {}
      try { if (v.circle) v.circle.styles({ "pointer-events": "none" }); } catch (e) {}
      try { if (v.group) v.group.styles({ "pointer-events": "none" }); } catch (e) {}
    });
  }
  // unfreeze after gesture end
  function unfreezeVectorsForGesture(lockedPair) {
    if (!lockedPair) return;
    [lockedPair.v1, lockedPair.v2].forEach(v => {
      if (!v) return;
      try { if (typeof v.movementAllowedPrev !== "undefined") v.movementAllowed = v.movementAllowedPrev; } catch (e) {}
      try { if (typeof v.manipulationPossiblePrev !== "undefined") v.manipulationPossible = v.manipulationPossiblePrev; } catch (e) {}
      try { v.lockedForGesture = false; } catch (e) {}
      try { if (v.circle) v.circle.styles({ "pointer-events": null }); } catch (e) {}
      try { if (v.group) v.group.styles({ "pointer-events": null }); } catch (e) {}
    });
  }
  // Create a dotted manipulator line for a source vector.
  // vector: the createVector instance
  // opts: { mode: "multiply"|"divide", isNumerator: true|false (for division) }
  function createDottedManipulator(vector, opts) {
    try {
      clearGesture(); // clear any existing manipulators
      if (!vector) {
        console.warn("createDottedManipulator: no vector provided");
        return;
      }
      // The vector must have center coordinates and an angle.
      // Best-effort property names: cx, cy, centerX, centerY, angle_rad, angle_deg, r
      const cx = (typeof vector.cx !== "undefined") ? vector.cx : (typeof vector.centerX !== "undefined" ? vector.centerX : null);
      const cy = (typeof vector.cy !== "undefined") ? vector.cy : (typeof vector.centerY !== "undefined" ? vector.centerY : null);
      const angle_rad = (typeof vector.angle_rad !== "undefined") ? vector.angle_rad : (typeof vector.angle !== "undefined" ? vector.angle : null);
      // Determine radius (in px) robustly using multiple fallbacks:
      // - vector.r or vector.radius
      // - vector.endX/ endY (distance from center)
      // - vector.xComponent_length and yComponent_length
      // - DOM circle radius (if available)
      let r = null;
      if (typeof vector.r !== "undefined") r = vector.r;
      else if (typeof vector.radius !== "undefined") r = vector.radius;
      else if (typeof vector.endX !== "undefined" && typeof vector.endY !== "undefined" && cx != null && cy != null) {
        r = Math.hypot(vector.endX - cx, vector.endY - cy);
      } else if (typeof vector.xComponent_length !== "undefined" && typeof vector.yComponent_length !== "undefined") {
        r = Math.hypot(vector.xComponent_length, vector.yComponent_length);
      } else if (vector.circle && vector.circle.node && vector.circle.node().getAttribute) {
        // attempt to read SVG circle radius attribute
        try {
          const rr = parseFloat(vector.circle.node().getAttribute("r"));
          if (!isNaN(rr) && rr > 0) r = rr;
        } catch (e) {}
      }
      // final fallback to a reasonable px value
      if (r == null || r <= 0) r = 80;
      if (cx == null || cy == null || angle_rad == null) {
        swal({ title: "Gesture Unavailable", text: "This vector does not expose the expected properties for gesture manipulation.", icon: "warning" });
        console.warn("Vector missing cx/cy/angle_rad:", vector);
        return;
      }
      // initial endpoint for dotted line (on circumference)
      const x2 = cx + r * Math.cos(angle_rad);
      const y2 = cy - r * Math.sin(angle_rad);
      // create group
      const g = screen_svg.canvas.append("g").attr("class", "gesture_g");
      // dotted thin gray line (initial)
      const dotted = g.append("line")
        .attrs({ x1: cx, y1: cy, x2: x2, y2: y2 })
        .styles({ "stroke": "#888", "stroke-width": 1, "stroke-dasharray": "4,4", "pointer-events": "none" });
      // add a small handle circle at endpoint for visual feedback (hidden - pointer events handled globally)
      const handle = g.append("circle")
        .attrs({ cx: x2, cy: y2, r: 2 })
        .styles({ "fill": "#888", "fill-opacity": 0.9, "pointer-events": "none" });
      screen_svg.gesture = {
        group: g,
        dotted: dotted,
        handle: handle,
        origin: { cx: cx, cy: cy },
        vector: vector,
        mode: opts.mode,
        isNumerator: opts.isNumerator || false,
        r_px: r,
        currentAngle_rad: angle_rad,
        green: false,
        completed: false,
        waitingForRadial: false,
        fixedAngle_rad: null,
        lockedPairSnapshot: null // will store locked pair we froze
      };
      // freeze both vectors (if a locked pair exists) so original vectors remain static during manipulation
      const locked = findCenterLockedPair();
      if (locked) {
        freezeVectorsForGesture(locked);
        screen_svg.gesture.lockedPairSnapshot = locked;
      }
      // attach pointer listeners so user can drag/manipulate the dotted line around the circle
      // For simplicity listen on document so dragging outside SVG also works.
      function onPointerMove(e) {
        if (!screen_svg.gesture || screen_svg.gesture.completed) return;
        e.preventDefault();
        const p = getEventPosition(e);
        if (screen_svg.gesture.waitingForRadial) {
          // radial mode: fixed angle, vary length
          const fixedAng = screen_svg.gesture.fixedAngle_rad;
          const d = Math.hypot(p.x - screen_svg.gesture.origin.cx, p.y - screen_svg.gesture.origin.cy);
          const ex = screen_svg.gesture.origin.cx + d * Math.cos(fixedAng);
          const ey = screen_svg.gesture.origin.cy - d * Math.sin(fixedAng);
          screen_svg.gesture.dotted.attrs({ x2: ex, y2: ey });
          screen_svg.gesture.handle.attrs({ cx: ex, cy: ey });

          // <-- simplified direction-based trigger (minimal change)
          // Once the angle is matched (green) and the user slides a little in the correct radial direction,
          // finalize immediately (don't require reaching raw product/quotient magnitude).
          const radialStart = screen_svg.gesture.radialStartD || 0;
          const minMovePx = 4; // small slide threshold in pixels
          const delta = d - radialStart;
          if (screen_svg.gesture.mode === "multiply") {
            // outward slide triggers multiplication
            if (delta > minMovePx) {
              const targetMag = computeTargetMagnitude();
              finalizeGesture(targetMag);
              document.removeEventListener('pointermove', onPointerMove);
              document.removeEventListener('pointerup', onPointerUp);
              return;
            }
          } else if (screen_svg.gesture.mode === "divide") {
            // inward slide triggers division
            if (delta < -minMovePx) {
              const targetMag = computeTargetMagnitude();
              finalizeGesture(targetMag);
              document.removeEventListener('pointermove', onPointerMove);
              document.removeEventListener('pointerup', onPointerUp);
              return;
            }
          }
          // (end simplified trigger)
        } else {
          // angle mode: fixed length, vary angle
          const dx = p.x - screen_svg.gesture.origin.cx;
          const dy = -(p.y - screen_svg.gesture.origin.cy); // invert y to match angle_rad convention
          const ang = Math.atan2(dy, dx); // radians
          screen_svg.gesture.currentAngle_rad = ang;
          // update dotted line endpoint (project onto circle radius for visual)
          const ex = screen_svg.gesture.origin.cx + screen_svg.gesture.r_px * Math.cos(ang);
          const ey = screen_svg.gesture.origin.cy - screen_svg.gesture.r_px * Math.sin(ang);
          screen_svg.gesture.dotted.attrs({ x2: ex, y2: ey });
          screen_svg.gesture.handle.attrs({ cx: ex, cy: ey });
          // check proximity to target angle (depends on mode and the locked pair)
          checkAngleProximity(ang);
          // NEW: If just turned green, immediately switch to radial mode for automatic resultant on slide
          if (screen_svg.gesture.green && !screen_svg.gesture.waitingForRadial) {
            screen_svg.gesture.waitingForRadial = true;
            screen_svg.gesture.fixedAngle_rad = ang;
            // Project current position to the fixed angle ray for smooth transition
            const fixedAng = screen_svg.gesture.fixedAngle_rad;
            const d = Math.hypot(p.x - screen_svg.gesture.origin.cx, p.y - screen_svg.gesture.origin.cy);
            // store radial start distance so we can require correct sliding direction later
            screen_svg.gesture.radialStartD = d;
            const ex_rad = screen_svg.gesture.origin.cx + d * Math.cos(fixedAng);
            const ey_rad = screen_svg.gesture.origin.cy - d * Math.sin(fixedAng);
            screen_svg.gesture.dotted.attrs({ x2: ex_rad, y2: ey_rad });
            screen_svg.gesture.handle.attrs({ cx: ex_rad, cy: ey_rad });
            // Check if already close to target magnitude — if so finalize (but still respect direction)
            const targetMag = computeTargetMagnitude();
            if (targetMag != null) {
              const diffRel = Math.abs(d - targetMag) / (targetMag || 1);
              // If current position is already within a tiny tolerance, finalize immediately.
              // Use a stricter tolerance here so accidental tiny matches don't finalize incorrectly.
              if (diffRel < 0.02) {
                // Respect direction: if multiply requires outward but radialStartD ~ d so no outward movement yet,
                // allow finalize immediately as an exception (user had already reached target while angle pick).
                finalizeGesture(targetMag);
                return;
              }
            }
          }
        }
      }
      function checkAngleProximity(ang) {
        const lockedLocal = findCenterLockedPair();
        if (!lockedLocal) {
          // nothing to compare to yet
          return;
        }
        // Determine which vectors correspond to numerator/denominator in division or either order for multiplication.
        // For multiplication: targetAngle = theta1 + theta2 (either order)
        // For division: must compute numeratorAngle - denominatorAngle (order matters)
        const v1 = lockedLocal.v1;
        const v2 = lockedLocal.v2;
        const a1 = (typeof v1.angle_rad !== "undefined") ? v1.angle_rad : ((typeof v1.angle !== "undefined") ? v1.angle : null);
        const a2 = (typeof v2.angle_rad !== "undefined") ? v2.angle_rad : ((typeof v2.angle !== "undefined") ? v2.angle : null);
        if (a1 == null || a2 == null) {
          return;
        }
        // normalize angle helpers
        const normalize = (x) => {
          let a = x;
          while (a <= -Math.PI) a += 2 * Math.PI;
          while (a > Math.PI) a -= 2 * Math.PI;
          return a;
        };
        let targetAngle = null;
        if (screen_svg.mode === "multiply") {
          // target = a1 + a2 (any order)
          targetAngle = normalize(a1 + a2);
        } else if (screen_svg.mode === "divide") {
          // Decide numerator based on which vector was used to create gesture.
          const srcIsV1 = (screen_svg.gesture.vector === v1) || (screen_svg.gesture.vector.vectorID === v1.vectorID);
          if (srcIsV1) {
            targetAngle = normalize(a1 - a2);
          } else {
            targetAngle = normalize(a2 - a1);
          }
        } else {
          return;
        }
        // compute difference between current angle and targetAngle (in absolute degrees)
        const diff = Math.abs((normalize(ang) - targetAngle));
        // adjust for wrap-around near PI/-PI
        const diffAdj = Math.min(diff, 2 * Math.PI - diff);
        const diffDeg = Math.abs(diffAdj * 180 / Math.PI);
        const THRESHOLD_DEG = 4; // how close to treat as matched
        if (diffDeg <= THRESHOLD_DEG) {
          // switch to green dotted line (only once)
          if (!screen_svg.gesture.green) {
            screen_svg.gesture.green = true;
            screen_svg.gesture.dotted.styles({ "stroke": "#2ecc71" }); // green dotted
            screen_svg.gesture.handle.styles({ "fill": "#2ecc71" });
            // vibration/haptic: best-effort
            try {
              if (navigator && navigator.vibrate) navigator.vibrate(40);
            } catch (err) { /* ignore */ }
          }
        } else {
          if (screen_svg.gesture.green) {
            // revert to gray if moved away
            screen_svg.gesture.green = false;
            screen_svg.gesture.dotted.styles({ "stroke": "#888" });
            screen_svg.gesture.handle.styles({ "fill": "#888" });
          }
        }
      }

      // ---- computeTargetMagnitude() now uses radius_scale(...) (logical) and invertRadiusScale(...) properly
      function computeTargetMagnitude() {
        const lockedLocal = findCenterLockedPair();
        let targetMagnitude_px = null;

        // helper: logical magnitude from a vector (what user sees via radius_scale)
        function logicalMagFromVector(v) {
          try {
            if (typeof radius_scale === "function") {
              return radius_scale(v.r || v.radius || screen_svg.gesture.r_px);
            } else {
              return v.r || v.radius || screen_svg.gesture.r_px;
            }
          } catch (err) {
            return v.r || v.radius || screen_svg.gesture.r_px;
          }
        }

        if (lockedLocal) {
          const vA = lockedLocal.v1;
          const vB = lockedLocal.v2;

          try {
            const magA_logical = logicalMagFromVector(vA);
            const magB_logical = logicalMagFromVector(vB);

            if (screen_svg.mode === "multiply") {
              const resLogical = (magA_logical || 0) * (magB_logical || 0); // logical product
              targetMagnitude_px = invertRadiusScale(resLogical);
            } else if (screen_svg.mode === "divide") {
              const numeratorIsGestureSource = (screen_svg.gesture.vector.vectorID === vA.vectorID) || (screen_svg.gesture.vector === vA);
              const numLogical = numeratorIsGestureSource ? magA_logical : magB_logical;
              const denLogical = numeratorIsGestureSource ? magB_logical : magA_logical;
              if (!denLogical || denLogical === 0) {
                swal({ title: "Division Error", text: "Denominator magnitude is zero.", icon: "error" });
                clearGesture();
                return null;
              }
              const resLogical = (numLogical || 0) / (denLogical || 1);
              targetMagnitude_px = invertRadiusScale(resLogical);
            } else {
              targetMagnitude_px = screen_svg.gesture.r_px;
            }
          } catch (err) {
            console.error("computeTargetMagnitude error:", err);
            targetMagnitude_px = screen_svg.gesture.r_px;
          }
        } else {
          // fallback
          targetMagnitude_px = screen_svg.gesture.r_px;
        }
        return targetMagnitude_px;
      }
      // ---- end computeTargetMagnitude ----

      function onPointerUp(e) {
        if (!screen_svg.gesture) return;
        if (screen_svg.gesture.waitingForRadial && !screen_svg.gesture.completed) {
          // if lifting during radial without hitting threshold, revert to angle mode or clear
          screen_svg.gesture.waitingForRadial = false;
          //snap back to circle
          const ang = screen_svg.gesture.fixedAngle_rad;
          const ex = screen_svg.gesture.origin.cx + screen_svg.gesture.r_px * Math.cos(ang);
          const ey = screen_svg.gesture.origin.cy - screen_svg.gesture.r_px * Math.sin(ang);
          screen_svg.gesture.dotted.attrs({ x2: ex, y2: ey });
          screen_svg.gesture.handle.attrs({ cx: ex, cy: ey });
        }
      }
      // Attach high-level pointer listeners for angle manipulation
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      // Save references to listeners so they can be removed later
      screen_svg.gesture._listeners = { onPointerMove: onPointerMove, onPointerUp: onPointerUp };
    } catch (err) {
      console.error("createDottedManipulator error:", err);
      clearGesture();
    }
  }
  // Finalize the gesture: convert dotted to bold green line and create a resultant entry in logs.
  function finalizeGesture(targetMagnitude_px) {
    if (!screen_svg.gesture) return;
    try {
      // mark completed
      screen_svg.gesture.completed = true;

      // --- CHANGES HERE: DO NOT create the bold/animated green line. ---
      // Instead create only the resultant circle (no extra temporary line),
      // and DO NOT clamp the computed math magnitude so the circle can be very large
      // (user requested resultants may go off-screen).

      const ang = screen_svg.gesture.fixedAngle_rad || screen_svg.gesture.currentAngle_rad;
      const ox = screen_svg.gesture.origin.cx;
      const oy = screen_svg.gesture.origin.cy;

      // remove dotted and handle immediately
      if (screen_svg.gesture.dotted) screen_svg.gesture.dotted.remove();
      if (screen_svg.gesture.handle) screen_svg.gesture.handle.remove();

      // Initial resultant data
      let math_r = targetMagnitude_px;
      let math_ang = ang;
      const locked = findCenterLockedPair();
      if (locked) {
        const vA = locked.v1;
        const vB = locked.v2;
        const aA = (typeof vA.angle_rad !== "undefined") ? vA.angle_rad : vA.angle;
        const aB = (typeof vB.angle_rad !== "undefined") ? vB.angle_rad : vB.angle;

        function normalizeAngle(a) {
          while (a <= -Math.PI) a += 2 * Math.PI;
          while (a > Math.PI) a -= 2 * Math.PI;
          return a;
        }

        // Use logical magnitudes (radius_scale(...)) for math, then invert to px for circle.
        function logicalMagFromVector(v) {
          try {
            if (typeof radius_scale === "function") {
              return radius_scale(v.r || v.radius || screen_svg.gesture.r_px);
            } else {
              return v.r || v.radius || screen_svg.gesture.r_px;
            }
          } catch (err) {
            return v.r || v.radius || screen_svg.gesture.r_px;
          }
        }

        if (screen_svg.mode === "multiply") {
          const magA_logical = logicalMagFromVector(vA);
          const magB_logical = logicalMagFromVector(vB);
          const exactLogical = (magA_logical || 0) * (magB_logical || 0);
          math_r = invertRadiusScale(exactLogical);
          math_ang = normalizeAngle(aA + aB);
        } else if (screen_svg.mode === "divide") {
          const magA_logical = logicalMagFromVector(vA);
          const magB_logical = logicalMagFromVector(vB);
          const srcIsA = (screen_svg.gesture.vector.vectorID === vA.vectorID) || (screen_svg.gesture.vector === vA);
          const numLogical = srcIsA ? magA_logical : magB_logical;
          const denLogical = srcIsA ? magB_logical : magA_logical;
          const numA = srcIsA ? aA : aB;
          const denA = srcIsA ? aB : aA;
          if (!denLogical || denLogical === 0) {
            console.warn("Division by zero is not allowed");
            swal({
              title: "Error",
              text: "Division by zero is not allowed.",
              icon: "error"
            });
            if (screen_svg.gesture && screen_svg.gesture.group) screen_svg.gesture.group.remove();
            screen_svg.gesture = null;
            return;
          }
          const exactLogical = (numLogical || 0) / (denLogical || 1);
          math_r = invertRadiusScale(exactLogical);
          math_ang = normalizeAngle(numA - denA);
        }
      }

      // Create the resultant vector circle (use createVector as before)
      screen_svg.vectorID++;
      const resultantVector = new createVector({
        parent: screen_svg,
        cx: ox,
        cy: oy,
        r: math_r,
        angle_rad: math_ang,
        manipulationPossible: true,
        manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
        resolution_allowed: true,
        movementAllowed: true,
        vector_mode: "polar",
        cartesian_mode_controls: "polar",
        vectorID: screen_svg.vectorID,
        addition_allowed: true,
        multiplication_allowed: true,
        division_allowed: true,
        addedVectors: false,
        delete_allowed: true,
        taskScreen: false,
        addition_resolution_allowed: true,
        addition_change_mode_allowed: true,
        symbol: "z"
      });

      // ensure the resultant is only shown as a circle — hide its vector line if present
      try {
        if (resultantVector.vector_line) resultantVector.vector_line.styles({ "display": "none" });
      } catch (e) { /* ignore */ }

      // --- IMPORTANT: do NOT fill the resultant circle with solid green ---
      // make it transparent fill and keep stroke so area is not fully colored.
      try {
        if (resultantVector.circle) resultantVector.circle.styles({ "fill-opacity": 0, "stroke-opacity": 1 });
      } catch (e) { /* ignore */ }

      screen_svg.vector_list.push(resultantVector);
      // Set components
      resultantVector.xComponent_length = math_r * Math.cos(math_ang);
      resultantVector.yComponent_length = math_r * Math.sin(math_ang);
      resultantVector.angle_deg = math_ang * 180 / Math.PI;
      resultantVector.update();

      // Push to log
      const log = screen_svg.mode === "multiply" ? screen_svg.multiplication_log : screen_svg.division_log;
      let v1 = screen_svg.gesture.vector;
      let v2 = null;
      if (locked) {
        v2 = (locked.v1.vectorID === v1.vectorID ? locked.v2 : locked.v1);
        if (screen_svg.mode === "divide") {
          // Ensure v1 is numerator (gesture vector)
          if (v1.vectorID !== screen_svg.gesture.vector.vectorID) {
            [v1, v2] = [v2, v1];
          }
        }
      }
      log.push({ vector_1: v1, vector_2: v2, resultant: resultantVector });

      // Provide haptic confirmation and a short message
      try { if (navigator && navigator.vibrate) navigator.vibrate([30, 20, 30]); } catch (err) {}

      // Clean up listeners bound to gesture
      if (screen_svg.gesture && screen_svg.gesture._listeners) {
        document.removeEventListener('pointermove', screen_svg.gesture._listeners.onPointerMove);
        document.removeEventListener('pointerup', screen_svg.gesture._listeners.onPointerUp);
      }
      // Unfreeze vectors previously frozen for gesture
      if (screen_svg.gesture.lockedPairSnapshot) {
        unfreezeVectorsForGesture(screen_svg.gesture.lockedPairSnapshot);
      }
      // Clear mode after one operation (so user must tap multiply/divide icon again)
      screen_svg.mode = null;
      updateIconStates();

      // remove gesture graphics after a short delay (keeps UI tidy)
      setTimeout(() => {
        try {
          if (screen_svg.gesture && screen_svg.gesture.group) {
            screen_svg.gesture.group.remove();
          }
        } catch (e) {}
        screen_svg.gesture = null;
      }, 500);
    } catch (err) {
      console.error("finalizeGesture error:", err);
      clearGesture();
    }
  }
  // Remove any existing gesture and its listeners/graphics
  function clearGesture() {
    try {
      if (!screen_svg.gesture) return;
      if (screen_svg.gesture._listeners) {
        document.removeEventListener('pointermove', screen_svg.gesture._listeners.onPointerMove);
        document.removeEventListener('pointerup', screen_svg.gesture._listeners.onPointerUp);
      }
      // Unfreeze any vectors that were frozen
      if (screen_svg.gesture.lockedPairSnapshot) {
        try { unfreezeVectorsForGesture(screen_svg.gesture.lockedPairSnapshot); } catch (e) {}
      }
      if (screen_svg.gesture.group) {
        screen_svg.gesture.group.remove();
      }
      screen_svg.gesture = null;
    } catch (err) {
      console.error("clearGesture error:", err);
      screen_svg.gesture = null;
    }
  }
  // Utility: get pointer/mouse/touch position from event
  function getEventPosition(e) {
    if (!e) return { x: 0, y: 0 };
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].pageX, y: e.touches[0].pageY };
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  }
  // Attach click/touch handlers on vectors to start gesture depending on mode.
  // We try to attach a delegated listener to any element with class "vector_g".
  // If createVector creates its own DOM nodes with that classname, this will pick them up.
  // Otherwise users can still start gesture by clicking the vector object (which should set screen_svg.activeVector).
  document.addEventListener('click', function (ev) {
    try {
      // First, if the mode is not multiply/divide, ignore
      if (screen_svg.mode !== "multiply" && screen_svg.mode !== "divide") return;
      // Find the nearest createVector instance to act on:
      // Prefer screen_svg.activeVector if set (createVector likely sets it on selection)
      let vector = screen_svg.activeVector || null;
      // If activeVector not set, try to infer from clicked DOM element:
      if (!vector) {
        // traverse up DOM to find an element with class "vector_g" and attempt to map to vector object
        let node = ev.target;
        while (node && node !== document) {
          if (node.classList && node.classList.contains && node.classList.contains('vector_g')) {
            // try to find vector by matching an attribute data-vector-id or similar
            const vid = node.getAttribute && node.getAttribute('data-vector-id');
            if (vid != null) {
              vector = screen_svg.vector_list.find(v => String(v.vectorID) === String(vid));
            }
            break;
          }
          node = node.parentNode;
        }
      }
      // If still not found, fall back to picking the closest vector by distance
      if (!vector && screen_svg.vector_list && screen_svg.vector_list.length > 0) {
        // use click position
        const pos = getEventPosition(ev);
        let minD = Infinity;
        let nearest = null;
        for (let i = 0; i < screen_svg.vector_list.length; i++) {
          const v = screen_svg.vector_list[i];
          if (!v) continue;
          const vx = (typeof v.cx !== "undefined") ? v.cx : (v.centerX || null);
          const vy = (typeof v.cy !== "undefined") ? v.cy : (v.centerY || null);
          if (vx == null || vy == null) continue;
          const d = Math.hypot(pos.x - vx, pos.y - vy);
          if (d < minD) { minD = d; nearest = v; }
        }
        // only accept if reasonably close
        if (minD < 120) vector = nearest;
      }
      if (!vector) {
        swal({ title: "No Vector Selected", text: "Tap a complex number (vector) to start the gesture.", icon: "warning", timer: 1200, buttons: false });
        return;
      }
      // For division mode, ensure the tapped vector is the numerator (must be the one placed on top/locked onto denominator)
      if (screen_svg.mode === "divide") {
        // Check that the vector tapped is indeed the numerator in the locked pair.
        const locked = findCenterLockedPair();
        if (!locked) {
          swal({ title: "Center Lock Required", text: "Place numerator on denominator (center-lock) before starting division.", icon: "warning" });
          return;
        }
        // determine which one is numerator: heuristics: a vector that was moved onto the center may have a property like lockedTo or locked_to
        const srcIsLockedTo = (vector.lockedTo || vector.locked_to || vector.center_locked_to || vector.movedOnto || null);
        // We'll allow if vector is either member of locked pair but prefer the one that was moved.
        const isNumerator = (vector.vectorID === locked.v1.vectorID) || (vector.vectorID === locked.v2.vectorID);
        if (!isNumerator) {
          swal({ title: "Tap Numerator", text: "For division, tap the numerator complex number (the one placed on top).", icon: "info", timer: 1400, buttons: false });
          return;
        }
        // create manipulator for tapped vector and mark isNumerator true
        createDottedManipulator(vector, { mode: "divide", isNumerator: true });
      } else if (screen_svg.mode === "multiply") {
        // For multiplication mode, ensure there exists a center-locked pair
        const locked = findCenterLockedPair();
        if (!locked) {
          swal({ title: "Center Lock Required", text: "Center-lock two complex numbers (drag one to center of other) before multiplication.", icon: "warning" });
          return;
        }
        // create manipulator for whichever vector was tapped (multiplication is symmetric)
        createDottedManipulator(vector, { mode: "multiply", isNumerator: false });
      }
    } catch (err) {
      console.error("vector click handler error:", err);
    }
  }, false); // use bubble phase to avoid interfering with addition gestures
  // END of createCanvas()
}
/*************************** createCanvasEvents() ***************************/
function createCanvasEvents() {
  screen_svg.canvas.on("touchstart", function () {
    if (d3.event.touches.length == 2) {
      touch_1 = d3.event.touches[0];
      touch_2 = d3.event.touches[1];
      if (touch_1.target.nodeName == "svg" && touch_2.target.nodeName == "svg") {
        screen_svg.vectorID++;
        var temp_vector = new createVector({
          parent: screen_svg,
          cx: touch_1.pageX,
          cy: touch_1.pageY,
          r: distpoints(touch_1.pageX, touch_1.pageY, touch_2.pageX, touch_2.pageY),
          manipulationPossible: true,
          angle_rad: Math.atan2(-(touch_2.pageY - touch_1.pageY), (touch_2.pageX - touch_1.pageX)),
          manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
          resolution_allowed: true,
          movementAllowed: true,
          vector_mode: "polar",
          cartesian_mode_controls: "polar",
          vectorID: screen_svg.vectorID,
          addition_allowed: true,
          multiplication_allowed: true,
          division_allowed: true,
          addedVectors: false,
          delete_allowed: true,
          taskScreen: false,
          addition_resolution_allowed: true,
          addition_change_mode_allowed: true
        });
        screen_svg.vector_list.push(temp_vector);
      }
    }
  });
}
