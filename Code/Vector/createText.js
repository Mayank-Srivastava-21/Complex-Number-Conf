/***********************************************************************************/
/* createText.js */

createVector.prototype.create_text = function(){
  this.font_size_normal = 1.85 * screen_size;
  this.font_size_small = 1.7 * screen_size;

  this.text_4 = {};
  this.text_4.data = {
    posX: 0,
    posY: -this.r - 4.4 * this.font_size_normal,
    textBox: { 
      "fill": this.vector_color, 
      "fill-opacity": 0.1, 
      width: 8 * this.font_size_normal, 
      height: 1.8 * this.font_size_normal 
    },
    tspans: [
      {
        index: 0,
        value: this.symbol + " = ",
        "dominant-baseline": "middle",
        "font-size": this.font_size_normal,
        fill: this.vector_color,
        "font-family": "sans-serif"
      },
      {
        index: 1,
        value: 0,
        "dominant-baseline": "middle",
        "font-size": this.font_size_normal,
        fill: "black",
        "font-family": "sans-serif"
      },
      {
        index: 2,
        value: "",
        "dominant-baseline": "middle",
        "font-size": this.font_size_normal,
        fill: "black",
        "font-family": "sans-serif"
      },
      {
        index: 3,
        value: 0,
        "dominant-baseline": "middle",
        "font-size": this.font_size_normal,
        fill: "black",
        "font-family": "sans-serif"
      }
    ]
  };
  this.text_4.group = this.container.append("g");
  this.text_4.textBox = this.text_4.group.append("rect").styles({ "pointer-events": "none" });
  this.text_4.text = this.text_4.group.append("text").styles({ "pointer-events": "none" });
  this.text_4.tspans = [];
  for (let i in this.text_4.data.tspans) {
    this.text_4.tspans[i] = this.text_4.text.append("tspan");
  }

  this.text_3 = {};
  this.text_3.data = {
    posX: 0,
    posY: -this.r - 3.4 * this.font_size_normal,
    textBox: { 
      "fill": this.vector_color, 
      "fill-opacity": 0.1, 
      width: 8 * this.font_size_normal, 
      height: 1.8 * this.font_size_normal 
    },
    tspans: [
      {
        index: 0,
        value: this.symbol + " = ",
        "dominant-baseline": "middle",
        "font-size": this.font_size_normal,
        fill: this.vector_color,
        "font-family": "sans-serif"
      },
      {
        index: 1,
        value: 0,
        "dominant-baseline": "middle",
        "font-size": this.font_size_normal,
        fill: "black",
        "font-family": "sans-serif"
      },
      {
        index: 2,
        value: "",
        "dominant-baseline": "middle",
        "font-size": this.font_size_normal,
        fill: "black",
        "font-family": "sans-serif"
      },
      {
        index: 3,
        value: 0,
        "dominant-baseline": "middle",
        "font-size": this.font_size_normal,
        fill: "black",
        "font-family": "sans-serif"
      }
    ]
  };

  this.text_3.group = this.container.append("g");
  this.text_3.textBox = this.text_3.group.append("rect").styles({ "pointer-events": "none" });
  this.text_3.text = this.text_3.group.append("text").styles({ "pointer-events": "none" });
  this.text_3.tspans = [];
  for (let i in this.text_3.data.tspans) {
    this.text_3.tspans[i] = this.text_3.text.append("tspan");
  }

  this.text_2 = {};
  this.text_2.data = {
    posX: 0,
    posY: -this.r - 2.45 * this.font_size_normal,
    textBox: {
      "fill": this.vector_color,
      "fill-opacity": 0.1,
      width: 8 * this.font_size_normal,
      height: 1.8 * this.font_size_normal
    },
    tspans: [
      { index: 0, value: this.symbol, "dominant-baseline": "middle", "font-size": this.font_size_normal, "fill": this.vector_color, "font-family": "sans-serif" },
      { index: 1, value: "r", "baseline-shift": "sub", "font-size": this.font_size_small, "fill": this.vector_color, "font-family": "sans-serif" },
      { index: 2, value: " = ", "dominant-baseline": "middle", "font-size": this.font_size_normal, "fill": "black", "font-family": "sans-serif" },
      { index: 3, value: Math.round(radius_scale(this.r) * 100) / 100, "dominant-baseline": "middle", "font-size": this.font_size_normal, "fill": "black", "font-family": "sans-serif" },
      { index: 4, value: " | ", "dominant-baseline": "middle", "font-size": this.font_size_normal, "fill": "black", "font-family": "sans-serif" },
      { index: 5, value: this.symbol, "dominant-baseline": "middle", "font-size": this.font_size_normal, "fill": this.vector_color, "font-family": "sans-serif" },
      { index: 6, value: "θ", "baseline-shift": "sub", "font-size": this.font_size_small, "fill": this.vector_color, "font-family": "sans-serif" },
      { index: 7, value: " = ", "dominant-baseline": "middle", "font-size": this.font_size_normal, "fill": "black", "font-family": "sans-serif" },
      { index: 8, value: Math.round(this.angle_deg * 100) / 100 + "\u00B0", "dominant-baseline": "middle", "font-size": this.font_size_normal, "fill": "black", "font-family": "sans-serif" }
    ]
  };

  this.text_2.group = this.container.append("g");
  this.text_2.textBox = this.text_2.group.append("rect");
  this.text_2.text = this.text_2.group.append("text");
  this.text_2.tspans = [];
  for (let i in this.text_2.data.tspans) {
    this.text_2.tspans[i] = this.text_2.text.append("tspan");
    if(this.text_2.data.tspans[i]["baseline-shift"]) {
      this.text_2.tspans[i].attr("baseline-shift", this.text_2.data.tspans[i]["baseline-shift"]);
    }
  }

  this.text_1 = {};
  this.text_1.data = {
    textBox: { "fill": this.vector_color, "fill-opacity": 0.5, width: 1.2 * this.font_size_normal, height: 1.8 * this.font_size_normal },
    posY: -this.r - 5.5 * this.font_size_normal,
    tspans: [
      { index: 0, value: this.symbol, "dominant-baseline": "middle", "font-size": this.font_size_normal, "fill": "black", "font-family": "sans-serif" }
    ]
  };
  this.text_1.data.posX = -0.5 * this.text_2.data.textBox.width - 0.5 * this.text_1.data.textBox.width;

  this.text_1.group = this.container.append("g");
  this.text_1.textBox = this.text_1.group.append("rect");
  this.text_1.text = this.text_1.group.append("text");
  this.text_1.tspans = [];
  for (let i in this.text_1.data.tspans) {
    this.text_1.tspans[i] = this.text_1.text.append("tspan");
  }
};

createVector.prototype.setup_text = function(){
  let box = this.text_4.textBox;
  let box_data = this.text_4.data.textBox;
  box.styles({ "fill": box_data["fill"], "fill-opacity": box_data["fill-opacity"], "pointer-events": "none" });

  for (let i in this.text_4.tspans) {
    let tspan = this.text_4.tspans[i];
    let tspan_data = this.text_4.data.tspans[i];
    tspan.styles({
      "font-size": tspan_data["font-size"],
      "dominant-baseline": tspan_data["dominant-baseline"],
      "fill": tspan_data["fill"],
      "font-family": tspan_data["font-family"],
      "pointer-events": "none"
    });
  }

  box = this.text_3.textBox;
  box_data = this.text_3.data.textBox;
  box.styles({ "fill": box_data["fill"], "fill-opacity": box_data["fill-opacity"], "pointer-events": "none" });

  for (let i in this.text_3.tspans) {
    let tspan = this.text_3.tspans[i];
    let tspan_data = this.text_3.data.tspans[i];
    tspan.styles({
      "font-size": tspan_data["font-size"],
      "dominant-baseline": tspan_data["dominant-baseline"],
      "fill": tspan_data["fill"],
      "font-family": tspan_data["font-family"],
      "pointer-events": "none"
    });
  }

  box = this.text_2.textBox;
  box_data = this.text_2.data.textBox;
  box.styles({ "fill": box_data["fill"], "fill-opacity": box_data["fill-opacity"] });

  for (let i in this.text_2.tspans) {
    let tspan = this.text_2.tspans[i];
    let tspan_data = this.text_2.data.tspans[i];
    tspan.styles({
      "font-size": tspan_data["font-size"],
      "dominant-baseline": tspan_data["dominant-baseline"],
      "fill": tspan_data["fill"],
      "font-family": tspan_data["font-family"]
    });
    if(tspan_data["baseline-shift"]) {
      tspan.attr("baseline-shift", tspan_data["baseline-shift"]);
    }
  }

  box = this.text_1.textBox;
  box_data = this.text_1.data.textBox;
  box.styles({ "fill": box_data["fill"], "fill-opacity": box_data["fill-opacity"] });

  for (let i in this.text_1.tspans) {
    let tspan = this.text_1.tspans[i];
    let tspan_data = this.text_1.data.tspans[i];
    tspan.styles({
      "font-size": tspan_data["font-size"],
      "dominant-baseline": tspan_data["dominant-baseline"],
      "fill": tspan_data["fill"],
      "font-family": tspan_data["font-family"]
    });
  }
};

createVector.prototype.update_text = function(){
  let r_display = this.r;
  if (this.multiplicationResultant && this.object) {
    // For multiplication resultants, calculate the product of the original magnitudes directly
    let vector1 = this.object.vector_1;
    let vector2 = this.object.vector_2;
    // Calculate using physical values (same method as multiplyVectors)
    let physical1 = (typeof radius_scale_inverse === "function" ? radius_scale_inverse(vector1.r) : vector1.r);
    let physical2 = (typeof radius_scale_inverse === "function" ? radius_scale_inverse(vector2.r) : vector2.r);
    let physical_product = physical1 * physical2;
    r_display = (typeof radius_scale === "function" ? radius_scale(physical_product) : physical_product);
    // DO NOT overwrite this.r - it's already correctly calculated in multiplyVectors()
  } else if (this.divisionResultant && this.object) {
    // For division resultants, calculate the quotient of the original magnitudes directly
    let vector1 = this.object.vector_1; // Numerator
    let vector2 = this.object.vector_2; // Denominator
    // Calculate using physical values (same method as divideVectors)
    let physical1 = (typeof radius_scale_inverse === "function" ? radius_scale_inverse(vector1.r) : vector1.r);
    let physical2 = (typeof radius_scale_inverse === "function" ? radius_scale_inverse(vector2.r) : vector2.r);
    if (physical2 === 0) {
      console.warn("Division by zero in text update for vector ID:", this.vectorID);
      r_display = 0; // Fallback to avoid undefined behavior
    } else {
      let physical_quotient = physical1 / physical2;
      r_display = (typeof radius_scale === "function" ? radius_scale(physical_quotient) : physical_quotient);
    }
    // DO NOT overwrite this.r - it's already correctly calculated in divideVectors()
  } else {
    r_display = (typeof radius_scale === "function" ? radius_scale(this.r) : this.r);
  }

  this.text_2.data.tspans[3].value = this.parent.settings && this.parent.settings.show_decimals
    ? (Math.round(r_display * 100) / 100).toFixed(2)
    : Math.round(r_display);
  this.text_2.data.tspans[8].value = (this.parent.settings && this.parent.settings.show_decimals
    ? (Math.round(this.angle_deg * 100) / 100).toFixed(2)
    : Math.round(this.angle_deg)) + "\u00B0";

  let zx = r_display * Math.cos(this.angle_rad);
  let zy = r_display * Math.sin(this.angle_rad);
  if (this.parent.settings && this.parent.settings.show_decimals) {
    zx = (Math.round(zx * 100) / 100).toFixed(2);
    zy = (Math.round(zy * 100) / 100).toFixed(2);
  } else {
    zx = Math.round(zx);
    zy = Math.round(zy);
  }

  this.text_4.data.tspans[1].value = zx;
  this.text_3.data.tspans[1].value = zx;
  if (zy < 0) {
    this.text_4.data.tspans[2].value = " - ";
    this.text_4.data.tspans[3].value = Math.abs(zy) + "i";
    this.text_3.data.tspans[2].value = " - ";
    this.text_3.data.tspans[3].value = Math.abs(zy) + "i";
  } else {
    this.text_4.data.tspans[2].value = zy === 0 ? "" : " + ";
    this.text_4.data.tspans[3].value = zy === 0 ? "" : zy + "i";
    this.text_3.data.tspans[2].value = zy === 0 ? "" : " + ";
    this.text_3.data.tspans[3].value = zy === 0 ? "" : zy + "i";
  }

  let basePosY = -this.r - 2.45 * this.font_size_normal;
  let complexPosY = -this.r - 3.4 * this.font_size_normal;
  let newComplexPosY = -this.r - 4.4 * this.font_size_normal;
  let symbolPosY = -this.r - 5.5 * this.font_size_normal;
  let posXOffset = 0;

  if (this.addition_possible || this.multiplication_possible || this.division_possible) {
    let partner = this.addition_possible ? this.addition_data.patner : 
                  this.multiplication_possible ? this.multiplication_data.partner : 
                  this.division_data.partner;
    if (partner) {
      let dx = this.addition_possible ? 
        (this.xComponent_coordinate - partner.cx) : 
        (this.cx - partner.cx);
      let dy = this.addition_possible ? 
        (this.yComponent_coordinate - partner.cy) : 
        (this.cy - partner.cy);
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.control_circle_radius * 2) {
        let angleToPartner = Math.atan2(dy, dx);
        let shiftDirection = (this.addition_data.position === "first" || 
                             this.multiplication_data.position === "first" || 
                             this.division_data.position === "numerator") ? 1 : -1;
        posXOffset = shiftDirection * 5 * this.font_size_normal * Math.cos(angleToPartner);
        let posYOffset = shiftDirection * 2 * this.font_size_normal * Math.sin(angleToPartner);
        
        basePosY += posYOffset;
        complexPosY += posYOffset;
        newComplexPosY += posYOffset;
        symbolPosY += posYOffset;
        this.text_2.data.posX = posXOffset;
        this.text_3.data.posX = posXOffset;
        this.text_4.data.posX = posXOffset;
        this.text_1.data.posX = posXOffset - 0.5 * this.text_2.data.textBox.width - 0.5 * this.text_1.data.textBox.width;
      }
    }
  }

  if(this.vector_mode == "polar" || this.vector_mode == "cartesian"){
    this.text_1.data.posY = symbolPosY;
    this.text_2.data.posY = basePosY;
    this.text_3.data.posY = complexPosY;
    this.text_4.data.posY = newComplexPosY;
  }

  if(this.addedVectors === true && this.object !== undefined){
    var resultant = this.object.resultant;
    var vector1 = this.object.vector_1;
    var vector2 = this.object.vector_2;
    if(this.position == "first"){
      this.text_1.data.posY = -resultant.r - 5.5 * this.font_size_normal;
      this.text_2.data.posY = -resultant.r - 2.45 * this.font_size_normal;
      this.text_3.data.posY = -resultant.r - 3.4 * this.font_size_normal;
      this.text_4.data.posY = -resultant.r - 4.4 * this.font_size_normal;
      this.text_1.data.posX = -this.text_2.data.textBox.width - 0.5 * this.text_1.data.textBox.width;
      this.text_2.data.posX = -0.5 * this.text_2.data.textBox.width;
      this.text_3.data.posX = -0.5 * this.text_2.data.textBox.width;
      this.text_4.data.posX = -0.5 * this.text_2.data.textBox.width;
    }
    if(this.position == "second"){
      if(this.object.addition_mode == "triangle"){
        this.text_1.data.posY = this.object.vector_1.yComponent_length - resultant.r - 6.7 * this.font_size_normal;
        this.text_2.data.posY = this.object.vector_1.yComponent_length - resultant.r - 4.5 * this.font_size_normal;
        this.text_3.data.posY = this.object.vector_1.yComponent_length - resultant.r - 5.6 * this.font_size_normal;
        this.text_4.data.posY = this.object.vector_1.yComponent_length - resultant.r - 6.6 * this.font_size_normal;
        this.text_1.data.posX = -this.object.vector_1.xComponent_length - this.text_2.data.textBox.width - 0.5 * this.text_1.data.textBox.width;
        this.text_2.data.posX = -this.object.vector_1.xComponent_length - 0.5 * this.text_2.data.textBox.width;
        this.text_3.data.posX = -this.object.vector_1.xComponent_length - 0.5 * this.text_2.data.textBox.width;
        this.text_4.data.posX = -this.object.vector_1.xComponent_length - 0.5 * this.text_2.data.textBox.width;
      }
      if(this.object.addition_mode == "parallelogram"){
        this.text_1.data.posY = -resultant.r - 6.7 * this.font_size_normal;
        this.text_2.data.posY = -resultant.r - 4.5 * this.font_size_normal;
        this.text_3.data.posY = -resultant.r - 5.6 * this.font_size_normal;
        this.text_4.data.posY = -resultant.r - 6.6 * this.font_size_normal;
        this.text_1.data.posX = -this.text_2.data.textBox.width - 0.5 * this.text_1.data.textBox.width;
        this.text_2.data.posX = -0.5 * this.text_2.data.textBox.width;
        this.text_3.data.posX = -0.5 * this.text_2.data.textBox.width;
        this.text_4.data.posX = -0.5 * this.text_2.data.textBox.width;
      }
    }
    if(this.position == "resultant"){
      this.text_1.data.posY = -resultant.r - 5.5 * this.font_size_normal;
      this.text_2.data.posY = -resultant.r - 2.45 * this.font_size_normal;
      this.text_3.data.posY = -resultant.r - 3.4 * this.font_size_normal;
      this.text_4.data.posY = -resultant.r - 4.4 * this.font_size_normal;
      this.text_1.data.posX = this.text_2.data.textBox.width + 0.5 * this.text_1.data.textBox.width;
      this.text_2.data.posX = 0.5 * this.text_2.data.textBox.width;
      this.text_3.data.posX = 0.5 * this.text_2.data.textBox.width;
      this.text_4.data.posX = 0.5 * this.text_2.data.textBox.width;
    }
  }

  if((this.multiplicationResultant || this.divisionResultant) && this.object !== undefined){
    var resultant = this.object.resultant;
    var vector1 = this.object.vector_1;
    var vector2 = this.object.vector_2;
    this.text_1.data.posY = -this.r - 5.5 * this.font_size_normal;
    this.text_2.data.posY = -this.r - 2.45 * this.font_size_normal;
    this.text_3.data.posY = -this.r - 3.4 * this.font_size_normal;
    this.text_4.data.posY = -this.r - 4.4 * this.font_size_normal;
    this.text_1.data.posX = this.text_2.data.textBox.width + 0.5 * this.text_1.data.textBox.width;
    this.text_2.data.posX = 0.5 * this.text_2.data.textBox.width;
    this.text_3.data.posX = 0.5 * this.text_2.data.textBox.width;
    this.text_4.data.posX = 0.5 * this.text_2.data.textBox.width;
  }

  // Overlap detection and resolution for vector1, vector2, and resultant text boxes
  if ((this.addedVectors === true || this.multiplicationResultant || this.divisionResultant) && this.object !== undefined) {
    let vectors = [this.object.vector_1, this.object.vector_2, this.object.resultant].filter(v => v);
    this.resolveTextOverlaps(vectors);
  }

  let box_data = this.text_4.data.textBox;
  let data = this.text_4.data;
  this.text_4.textBox.attrs({ 
    x: data.posX - 0.5 * box_data.width, 
    y: data.posY - 0.5 * box_data.height, 
    width: box_data.width, 
    height: box_data.height 
  });
  this.text_4.text.attrs({ x: this.text_4.data.posX, y: this.text_4.data.posY });
  for (let i in this.text_4.tspans) {
    let tspan = this.text_4.tspans[i];
    let tspan_data = this.text_4.data.tspans[i];
    tspan.text(tspan_data["value"]);
  }

  box_data = this.text_3.data.textBox;
  data = this.text_3.data;
  this.text_3.textBox.attrs({ 
    x: data.posX - 0.5 * box_data.width, 
    y: data.posY - 0.5 * box_data.height, 
    width: box_data.width, 
    height: box_data.height 
  });

  this.text_3.text.attrs({ x: this.text_3.data.posX, y: this.text_3.data.posY });
  for (let i in this.text_3.tspans) {
    let tspan = this.text_3.tspans[i];
    let tspan_data = this.text_3.data.tspans[i];
    tspan.text(tspan_data["value"]);
  }

  box_data = this.text_2.data.textBox;
  data = this.text_2.data;
  this.text_2.textBox.attrs({ 
    x: data.posX - 0.5 * box_data.width, 
    y: data.posY - 0.5 * box_data.height, 
    width: box_data.width, 
    height: box_data.height 
  });
  this.text_2.text.attrs({ x: this.text_2.data.posX, y: this.text_2.data.posY });
  for (let i in this.text_2.tspans) {
    let tspan = this.text_2.tspans[i];
    let tspan_data = this.text_2.data.tspans[i];
    tspan.text(tspan_data["value"]);
  }

  if(this.manipulationPossible == false){
    this.text_1.data.posX = 0;
  }

  box_data = this.text_1.data.textBox;
  data = this.text_1.data;
  this.text_1.textBox.attrs({ 
    x: data.posX - 0.5 * box_data.width, 
    y: data.posY - 0.5 * box_data.height, 
    width: box_data.width, 
    height: box_data.height, 
    rx: 0.3 * box_data.width, 
    ry: 0.3 * box_data.width 
  });
  this.text_1.text.attrs({ x: this.text_1.data.posX, y: this.text_1.data.posY });
  for (let i in this.text_1.tspans) {
    let tspan = this.text_1.tspans[i];
    let tspan_data = this.text_1.data.tspans[i];
    tspan.text(tspan_data["value"]);
  }
};

createVector.prototype.setup_view_text = function(){
  if (this.vector_mode === "polar" && !this.multiplicationResultant && !this.divisionResultant) {
    this.text_3.text.styles({ "display": "none" });
    this.text_3.textBox.styles({ "display": "none" });
  } else {
    this.text_3.text.styles({ "display": null });
    this.text_3.textBox.styles({ "display": null });
  }
  if (this.multiplicationResultant || this.divisionResultant) {
    this.text_3.text.styles({ "display": "none" });
    this.text_3.textBox.styles({ "display": "none" });
    this.text_2.text.styles({ "display": null });
    this.text_2.textBox.styles({ "display": null });
  } else {
    this.text_2.text.styles({ "display": null });
    this.text_2.textBox.styles({ "display": null });
  }
};