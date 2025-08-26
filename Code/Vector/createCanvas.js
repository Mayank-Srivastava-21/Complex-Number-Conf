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
  });

  /*************************** Help Icon ***************************/
  screen_svg.canvas
    .append("text")
    .styles({ "font-family": "FontAwesome", "font-size": 2 * 3 * screen_dpi, "dominant-baseline": "central", "text-anchor": "middle", "fill": "#707070", 'cursor': 'pointer' })
    .attrs({ "x": temp_pos.x, y: temp_pos.y + 51 * screen_dpi })
    .html("\uf29c")
    .on("click", function () {
      window.open("https://youtu.be/RR1WX6o5hfM", "_default");
    });

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

  temp_pos = { x: 0.92 * innerWidth, y: 11 * screen_size };
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

  /*************************** Addition Table Icon ***************************/
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

  /*************************** Multiplication Table Icon ***************************/
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

  /*************************** Division Table Icon ***************************/
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
    console.log("toggleDivisionTable called, division_log:", screen_svg.division_log);
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
    .text(" Learning Sciences Research Group")
    .on("click", function () {
      window.open("http://lsr.hbcse.tifr.res.in/", "_default");
    });
}

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