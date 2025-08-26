function createScreens(){

  /*************************** Task 3_0 ***************************/

  screens_list[0].vectorID = -1;

  function task_3_0_canvas(event){
    if(event.touches.length == 2){
      touch_1 = event.touches[0];
      touch_2 = event.touches[1];
      if(touch_1.target.nodeName == "svg" && touch_2.target.nodeName == "svg"){
        screens_list[0].vectorID++;
        var temp_vector = new createVector({
          parent: screens_list[0],
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
          vectorID: screens_list[0].vectorID,
          addition_allowed: true,
          addedVectors: false,
          taskScreen: true,
          delete_allowed: true,
          screen_data: screens_list[0],
          addition_resolution_allowed: false,
          addition_change_mode_allowed: true
        })
        appendmarker(screens_list[0].vectorID);
        screens_list[0].vector_list.push(temp_vector);
      }
    }
  }


  /*************************** Parent SVG ***************************/

  parent_svg.on("touchstart", function(){
    if(currentScreen_count == 0){
      task_3_0_canvas(d3.event);
    }
  })

}
