/***********************************************************************************/
// Create Equation

createVector.prototype.create_equation = function(){
  var symbol = this.symbol;
  this.div = d3.select('body').append('div').styles({ 'font-size': this.font_size_normal });
  this.xEquation = this.div.append('div').styles({ 'padding-top': 10 }).append('text').html('\\( ' +this.symbol+ '_x = ' +Math.round(radius_scale(this.r))+ 'cos( ' +Math.round(this.angle_deg)+'\u00B0'+ ' ) \\)' + '<br>');
  this.yEquation = this.div.append('div').styles({ 'padding-top': 10 }).append('text').html('\\( ' +this.symbol+ '_y = ' +Math.round(radius_scale(this.r))+ 'sin( ' +Math.round(this.angle_deg)+'\u00B0'+ ' ) \\)');
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

/***********************************************************************************/
// Setup Equation

createVector.prototype.setup_equation = function(){
  this.div.styles({ 'position': 'absolute' })
}

/***********************************************************************************/
// Update Equation

createVector.prototype.update_equation = function(){
  //Temporarily disabling this as we already show the components of the vector
  /*
  this.xEquation.html('\\( ' +this.symbol+ '_x = ' +Math.round(radius_scale(this.r))+ 'cos( ' +Math.round(this.angle_deg)+'\u00B0'+ ' ) \\)' + '<br>');
  this.yEquation.html('\\( ' +this.symbol+ '_y = ' +Math.round(radius_scale(this.r))+ 'sin( ' +Math.round(this.angle_deg)+'\u00B0'+ ' ) \\)');
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

  this.div.styles({ 'top': this.cy + this.r + 10, 'left': this.cx - 0.5*parseInt(this.div.style('width')) });
  if(this.vector_mode == 'polar'){ this.div.styles({ 'display': 'none' }); }
  if(this.vector_mode == 'cartesian'){ this.div.styles({ 'display': 'none' }); }
  */
}

/***********************************************************************************/
// Setup view Equation

createVector.prototype.setup_view_equation = function(){
}
