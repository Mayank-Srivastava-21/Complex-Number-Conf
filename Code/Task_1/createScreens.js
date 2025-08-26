function createScreens(){

  /*************************** Task 1_0 ***************************/

  var temp_vector = new createVector({
    parent: screens_list[0],
    cx: 0.2*body_width,
    cy: 0.5*body_height,
    r: 0.2*body_height,
    angle_rad: (1/3)*Math.PI,
    manipulationPossible: false,
    manipulables: { r: false, angle: false, xComponent: false, yComponent: false },
    resolution_allowed: false,
    movementAllowed: false,
    vector_mode: "polar",               // "cartesian", "polar"
    cartesian_mode_controls: "polar",   // "cartesian", "polar"
    vectorID: 0,
    addition_allowed: false,
    addedVectors: false,
    taskScreen: true,
    delete_allowed: false
  })
  screens_list[0].vector_list.push(temp_vector);

  var temp_vector = new createVector({
    parent: screens_list[0],
    cx: 0.65*body_width,
    cy: 0.7*body_height,
    r: 0.2*body_height,
    angle_rad: (4/3)*Math.PI,
    manipulationPossible: true,
    manipulables: { r: false, angle: true, xComponent: false, yComponent: false },
    resolution_allowed: false,
    movementAllowed: true,
    vector_mode: "polar",               // "cartesian", "polar"
    cartesian_mode_controls: "polar",   // "cartesian", "polar"
    vectorID: 1,
    addition_allowed: false,
    addedVectors: false,
    taskScreen: true,
    delete_allowed: false
  })
  screens_list[0].vector_list.push(temp_vector);

  /*************************** Task 1_1 ***************************/

  var temp_vector = new createVector({
    parent: screens_list[1],
    cx: 0.2*body_width,
    cy: 0.5*body_height,
    r: 0.2*body_height,
    angle_rad: (1/3)*Math.PI,
    manipulationPossible: false,
    manipulables: { r: false, angle: false, xComponent: false, yComponent: false },
    resolution_allowed: false,
    movementAllowed: false,
    vector_mode: "polar",               // "cartesian", "polar"
    cartesian_mode_controls: "polar",   // "cartesian", "polar"
    vectorID: 0,
    addition_allowed: false,
    addedVectors: false,
    taskScreen: true,
    delete_allowed: false
  })
  screens_list[1].vector_list.push(temp_vector);

  var temp_vector = new createVector({
    parent: screens_list[1],
    cx: 0.65*body_width,
    cy: 0.7*body_height,
    r: 0.25*body_height,
    angle_rad: (1/3)*Math.PI,
    manipulationPossible: true,
    manipulables: { r: true, angle: false, xComponent: false, yComponent: false },
    resolution_allowed: false,
    movementAllowed: true,
    vector_mode: "polar",               // "cartesian", "polar"
    cartesian_mode_controls: "polar",   // "cartesian", "polar"
    vectorID: 1,
    addition_allowed: false,
    addedVectors: false,
    taskScreen: true,
    delete_allowed: false
  })
  screens_list[1].vector_list.push(temp_vector);

/*************************** Task 1_2 ***************************/

screens_list[2].vectorID = 0;

function task_1_2_canvas(event){
  if(event.touches.length == 2){
    touch_1 = event.touches[0];
    touch_2 = event.touches[1];
    if(touch_1.target.nodeName == "svg" && touch_2.target.nodeName == "svg"){
      var temp_vector = new createVector({
        parent: screens_list[2],
        cx: touch_1.pageX,
        cy: touch_1.pageY,
        r: distpoints(touch_1.pageX, touch_1.pageY, touch_2.pageX, touch_2.pageY),
        manipulationPossible: true,
        angle_rad: Math.atan2(-(touch_2.pageY-touch_1.pageY), (touch_2.pageX-touch_1.pageX)),
        manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
        resolution_allowed: false,
        movementAllowed: true,
        vector_mode: "polar",               // "cartesian", "polar"
        cartesian_mode_controls: "polar",   // "cartesian", "polar"
        vectorID: screens_list[2].vectorID,
        addition_allowed: false,
        addedVectors: false,
        taskScreen: true,
        delete_allowed: false
      })
      appendmarker(screens_list[2].vectorID);
      screens_list[2].vector_list.push(temp_vector);
      screens_list[2].vectorID++;
    }
  }
}

/*************************** Task 1_3 ***************************/

var temp_vector = new createVector({
  parent: screens_list[3],
  cx: 0.5*body_width,
  cy: 0.6*body_height,
  r: 0.2*body_height,
  angle_rad: (-1/3)*Math.PI,
  manipulationPossible: true,
  manipulables: { r: true, angle: true, xComponent: false, yComponent: false },
  resolution_allowed: false,
  movementAllowed: true,
  vector_mode: "polar",               // "cartesian", "polar"
  cartesian_mode_controls: "polar",   // "cartesian", "polar"
  vectorID: 0,
  addition_allowed: false,
  addedVectors: false,
  taskScreen: true,
  delete_allowed: true
})
screens_list[3].vector_list.push(temp_vector);

/*************************** Task 1_4 ***************************/

var temp_vector = new createVector({
  parent: screens_list[4],
  cx: 0.2*body_width,
  cy: 0.5*body_height,
  r: 0.2*body_height,
  angle_rad: (2/3)*Math.PI,
  manipulationPossible: false,
  manipulables: { r: true, angle: true, xComponent: false, yComponent: false },
  resolution_allowed: false,
  movementAllowed: true,
  vector_mode: "polar",               // "cartesian", "polar"
  cartesian_mode_controls: "polar",   // "cartesian", "polar"
  vectorID: 0,
  addition_allowed: false,
  addedVectors: false,
  taskScreen: true,
  delete_allowed: true
})
screens_list[4].vector_list.push(temp_vector);

screens_list[4].vectorID = 1;
function task_1_4_canvas(event){
  if(event.touches.length == 2){
    touch_1 = event.touches[0];
    touch_2 = event.touches[1];
    if(touch_1.target.nodeName == "svg" && touch_2.target.nodeName == "svg"){
      var temp_vector = new createVector({
        parent: screens_list[4],
        cx: touch_1.pageX,
        cy: touch_1.pageY,
        r: distpoints(touch_1.pageX, touch_1.pageY, touch_2.pageX, touch_2.pageY),
        manipulationPossible: true,
        angle_rad: Math.atan2(-(touch_2.pageY-touch_1.pageY), (touch_2.pageX-touch_1.pageX)),
        manipulables: { r: true, angle: true, xComponent: true, yComponent: true },
        resolution_allowed: false,
        movementAllowed: true,
        vector_mode: "polar",               // "cartesian", "polar"
        cartesian_mode_controls: "polar",   // "cartesian", "polar"
        vectorID: screens_list[4].vectorID,
        addition_allowed: false,
        addedVectors: false,
        taskScreen: true,
        delete_allowed: true
      })
      appendmarker(screens_list[4].vectorID);
      screens_list[4].vector_list.push(temp_vector);
      screens_list[4].vectorID++;
    }
  }
}

/*************************** Parent SVG ***************************/

  parent_svg.on("touchstart", function(){
    if(currentScreen_count == 2){
      task_1_2_canvas(d3.event);
    }
    if(currentScreen_count == 4){
      task_1_4_canvas(d3.event);
    }
  })

}
