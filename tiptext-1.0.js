// Tiptext.js v1.0 (c) 2013-2017 Michael Romanovsky.
// Non-commercial usage and commercial usage with revenues of less than 5,000,000 USD a year: MIT license.
// Commercial usage with revenues of 5,000,000 USD or more a year: contact me at: agamemnus at gmail to negotiate an appropriate license and fee.

function Tiptext (settings) {
 var tiptext_obj = {}
 if (typeof settings == "undefined") settings = {}
 var attribute_name  = (typeof settings.attribute_name != "undefined") ? settings.attribute_name : "tiptext"
 var parent          = (typeof settings.parent         != "undefined") ? settings.parent         : document.body
 // className is defaulted to the value of tiptext_obj.attribute_name.
 tiptext_obj.base_className = (typeof settings.base_className != "undefined") ? settings.base_className : attribute_name
 // Activation delay in milliseconds.
 tiptext_obj.show_delay     = (typeof settings.show_delay     != "undefined") ? settings.show_delay     : 400
 tiptext_obj.hide_delay     = (typeof settings.hide_delay     != "undefined") ? settings.hide_delay     : 200
 // If a maximum stick_delay of milliseconds passes from the moment a tip is hidden, and a new tip is set to be shown, the new tip show delay is 0.
 tiptext_obj.stick_delay    = (typeof settings.stick_delay    != "undefined") ? settings.stick_delay    : 500
 tiptext_obj.show_start     = ('show_start'   in settings) ? settings.show_start     : function (tiptext_obj) {tiptext_obj.tipdiv.style.opacity = 1}
 tiptext_obj.show_process   = ('show_process' in settings) ? settings.show_process   : undefined
 tiptext_obj.show_end       = ('show_end'     in settings) ? settings.show_end       : function (tiptext_obj) {tiptext_obj.tipdiv.style.opacity = 1; tiptext_obj.tipdiv.style.display = 'block'}
 tiptext_obj.hide_start     = ('hide_start'   in settings) ? settings.hide_start     : function (tiptext_obj) {tiptext_obj.tipdiv.style.opacity = 0}
 tiptext_obj.hide_process   = ('hide_process' in settings) ? settings.hide_process   : undefined
 tiptext_obj.hide_end       = ('hide_end'     in settings) ? settings.hide_end       : function (tiptext_obj) {tiptext_obj.tipdiv.style.opacity = 0; tiptext_obj.tipdiv.style.display = 'none'}
 tiptext_obj.show_process_timeout_time = (typeof settings.show_process_timeout_time != "undefined") ? settings.show_process_timeout_time : 25
 tiptext_obj.hide_process_timeout_time = (typeof settings.hide_process_timeout_time != "undefined") ? settings.hide_process_timeout_time : 25
 
 var tip_current_target = null                                                                         // Private.
 Object.defineProperty (tiptext_obj, 'current_target', {get: function () {return tip_current_target}}) // Public getter for "tip_current_target" (NB: tiptext_obj.current_target).
 
 var tipdiv = tiptext_obj.tipdiv = document.createElement ('div')
 tipdiv.style.pointerEvents = 'none'
 var settings_initial_styling = (typeof settings.initial_styling != "undefined") ? settings.initial_styling : function (tipdiv) {tipdiv.style.display = 'none'}
 settings_initial_styling (tipdiv)
 var current_process_timeout = undefined // Should be internal only.
 var current_action = null                                                                         // Private.
 Object.defineProperty (tiptext_obj, 'current_action', {get: function () {return current_action}}) // Public getter for "current_action".
 
 // Public getter and setter for "parent".
 Object.defineProperty (tiptext_obj, 'parent', {
  get: function () {return parent},
  set: function (new_parent) {
   observer.disconnect ()
   parent.removeEventListener ('mousemove', update_tip_position)
   if (tipdiv.parentNode == parent) tipdiv.appendChild (new_parent)
   parent = new_parent
   parent.addEventListener ('mousemove', update_tip_position)
   observer_initialize ()
  }
 })
 
 // Public getter and setter for "attribute_name".
 Object.defineProperty (tiptext_obj, 'attribute_name', {
  get: function () {return attribute_name},
  set: function (new_attribute_name) {observer.disconnect (); attribute_name = new_attribute_name; observer_initialize ()}
 })
 
 var current_process_callback = undefined                                                                              // Private.
 Object.defineProperty (tiptext_obj, 'current_process_callback', {get: function () {return current_process_callback}}) // Public getter for "current_process_callback".
 var current_process_ratio  = 0                                                                                  // Private.
 Object.defineProperty (tiptext_obj, 'current_process_ratio', {get: function () {return current_process_ratio}}) // Public getter for "current_process_ratio".
 var settings_test_on_init = ((typeof settings.test_on_init == "undefined") || (settings.test_on_init == true)) ? true : false // Should be internal only.
 var tip_last_hide_time = +new Date - 1000000
 
 function create_tip_event_listener (node) {
  node.addEventListener ('mouseover', show_tip)
  node.addEventListener ('mouseout' , remove_active_tip_on_mouseout)
  if (typeof node.tiptext_settings == "undefined") node.tiptext_settings = {}
  var tiptext_settings = node.tiptext_settings
  tiptext_settings.has_event_listener = true
  if (typeof tiptext_settings.show_delay     == "undefined") tiptext_settings.show_delay     = tiptext_obj.show_delay
  if (typeof tiptext_settings.hide_delay     == "undefined") tiptext_settings.hide_delay     = tiptext_obj.hide_delay
  if (typeof tiptext_settings.stick_delay    == "undefined") tiptext_settings.stick_delay    = tiptext_obj.stick_delay
  if (typeof tiptext_settings.base_className == "undefined") tiptext_settings.base_className = tiptext_obj.base_className
  if (typeof tiptext_settings.className      == "undefined") tiptext_settings.className      = ""
  if (!('show_start'   in tiptext_settings)) {if (typeof tiptext_obj.show_start   != "undefined") tiptext_settings.show_start   = tiptext_obj.show_start}
  if (!('show_process' in tiptext_settings)) {if (typeof tiptext_obj.show_process != "undefined") tiptext_settings.show_process = tiptext_obj.show_process}
  if (!('show_end'     in tiptext_settings)) {if (typeof tiptext_obj.show_end     != "undefined") tiptext_settings.show_end     = tiptext_obj.show_end}
  if (!('hide_start'   in tiptext_settings)) {if (typeof tiptext_obj.hide_start   != "undefined") tiptext_settings.hide_start   = tiptext_obj.hide_start}
  if (!('hide_process' in tiptext_settings)) {if (typeof tiptext_obj.hide_process != "undefined") tiptext_settings.hide_process = tiptext_obj.hide_process}
  if (!('hide_end'     in tiptext_settings)) {if (typeof tiptext_obj.hide_end     != "undefined") tiptext_settings.hide_end     = tiptext_obj.hide_end}
  if (typeof tiptext_settings.show_process_timeout_time == "undefined") {if (typeof tiptext_obj.show_process_timeout_time != "undefined") tiptext_settings.show_process_timeout_time = tiptext_obj.show_process_timeout_time}
  if (typeof tiptext_settings.hide_process_timeout_time == "undefined") {if (typeof tiptext_obj.hide_process_timeout_time != "undefined") tiptext_settings.hide_process_timeout_time = tiptext_obj.hide_process_timeout_time}
 }
 
 function clear_process_timeout (showhide) {
  if (typeof tiptext_obj.current_process_timeout != "undefined") {
   clearTimeout (tiptext_obj.current_process_timeout)
   tiptext_obj.current_process_timeout = undefined
  }
  current_process_callback = undefined
 }
 
 function begin_process_callback (current_node, showhide, end_func) {
  var tiptext_settings = current_node.tiptext_settings
  current_process_callback = tiptext_settings[showhide + '_process']
  if (typeof current_process_callback == "undefined") return
  if (current_process_ratio > 1) current_process_ratio = 1
  if (current_process_ratio < 0) current_process_ratio = 0
  var timeout_time = tiptext_settings[showhide + '_process_timeout_time']
  var showhide_time = tiptext_settings[showhide + '_delay']
  var portion_per_tick = (showhide_time != 0) ? timeout_time / showhide_time : 1
  var round_max = (showhide_time != 0) ? parseInt(showhide_time / timeout_time) : 1
  round_max = Math.floor (round_max * ((showhide == 'show') ? (1 - current_process_ratio) : (current_process_ratio)))
  if (round_max == 0) {do_final_round (); return}
  var round_count = -1
  do_round ()
  function do_round () {
   if (round_count != -1) current_process_ratio += ((showhide == 'show') ? portion_per_tick : -portion_per_tick)
   if (((showhide == 'hide') && (current_process_ratio < 0)) || ((showhide == 'show') && (current_process_ratio > 1))) {
    round_count = round_max
   }
   if (round_count == round_max) {do_final_round (); return}
   current_process_callback (tiptext_obj, current_process_ratio)
   round_count += 1
   tiptext_obj.current_process_timeout = setTimeout (do_round, timeout_time)
  }
  function do_final_round () {
   if (showhide == 'hide') {
    if (current_process_ratio < 0) current_process_ratio = 0
   } else {
    if (current_process_ratio > 1) current_process_ratio = 1
   }
   current_process_callback (tiptext_obj, current_process_ratio)
   end_func ()
  }
 }
 
 var show_tip = tiptext_obj.show_tip = function (evt) {
  if ((evt instanceof Event == false) && (typeof evt.x != "undefined") && (typeof evt.y != "undefined") && (typeof evt.target != "undefined")) { // Manually fired show_tip.
   var current_node = evt.target
  } else {
   var current_node = evt.currentTarget
  }
  if ((tip_current_target == current_node) && (current_action == 'show')) return
  var previous_action = current_action
  current_action = 'show'
  clear_process_timeout ()
  var tiptext_settings = current_node.tiptext_settings
  var tiptext = current_node.getAttribute (attribute_name)
  tipdiv.className = tiptext_settings.base_className + (((typeof tiptext_settings.className != "undefined") || (tiptext_settings.className == "")) ? " " + tiptext_settings.base_className + "-" + tiptext_settings.className : "")
  tipdiv.innerHTML = tiptext
  parent.appendChild (tipdiv)
  update_tip_position (evt)
  tip_current_target = current_node
  if (typeof tiptext_settings.show_start != "undefined") tiptext_settings.show_start (tiptext_obj)
  function show_end () {
   tiptext_obj.current_process_timeout = undefined
   current_process_callback = undefined
   if (typeof tiptext_settings.show_end != "undefined") tiptext_settings.show_end (tiptext_obj)
   current_action = null
  }
  if ((tiptext_settings.show_delay != 0) && ((previous_action == null) || (+new Date - tip_last_hide_time >= tiptext_settings.stick_delay))) {
   if (typeof tiptext_settings.show_process != "undefined") {
    begin_process_callback (current_node, 'show', show_end)
   } else {
    tiptext_obj.current_process_timeout = setTimeout (show_end, tiptext_settings.show_delay)
   }
  } else {
   show_end ()
  }
 }
 
 var remove_active_tip = tiptext_obj.remove_active_tip = function () {
  clear_process_timeout ()
  if (tipdiv.parentNode == null) return
  if (tip_current_target == null) return
  current_action = 'hide'
  var original_node = tip_current_target
  var tiptext_settings = tip_current_target.tiptext_settings
  function hide_end () {
   tiptext_obj.current_process_timeout = undefined
   current_process_callback = undefined
   if (tipdiv.parentNode == null) return
   if (tip_current_target == null) return
   tipdiv.parentNode.removeChild (tipdiv)
   tip_current_target = null
   current_action = null
   tip_last_hide_time = +new Date
   if (typeof tiptext_settings.hide_end != "undefined") tiptext_settings.hide_end (tiptext_obj)
  }
  function hide_start_timeout () {
   if (tipdiv.parentNode == null) return
   if (tip_current_target == null) return
   if (tip_current_target != original_node) return
   if (typeof tiptext_settings.hide_process != "undefined") {
    begin_process_callback (tip_current_target, 'hide', hide_end)
   } else {
    tiptext_obj.current_process_timeout = setTimeout (hide_end, tiptext_settings.hide_delay)
   }
  }
  function hide_inner () {
   if (typeof tiptext_settings.hide_start != "undefined") tiptext_settings.hide_start (tiptext_obj)
   if (tiptext_settings.hide_delay == 0) {
    hide_end ()
   } else {
    hide_start_timeout ()
   }
  }
  if (tiptext_settings.stick_delay == 0) {hide_inner ()} else {tiptext_obj.current_process_timeout = setTimeout (hide_inner, tiptext_settings.stick_delay)}
 }
 
 function remove_active_tip_on_mouseout (evt) {
  if (evt.currentTarget.contains(evt.relatedTarget)) return
  remove_active_tip ()
 }
 
 var set_active_tiptext = tiptext_obj.set_active_tiptext = function (tiptext) {
  tipdiv.innerHTML = tiptext
 }
 
 function update_tip_position (evt) {
  if ((evt instanceof Event == false) && (typeof evt.x != "undefined") && (typeof evt.y != "undefined") && (typeof evt.target != "undefined")) {
   var xy = [evt.x, evt.y]
  } else {
   if (tip_current_target == null) return
   var xy = getXY (evt, parent)
  }
  tipdiv.style.left = xy[0] + 'px'
  tipdiv.style.top  = xy[1] + 'px'
 }
 
 parent.addEventListener ('mousemove', update_tip_position)
 tiptext_obj.destroy = function () {
  observer.disconnect ()
  remove_active_tip ()
  parent.removeEventListener ('mousemove', update_tip_position)
 }
 
 tiptext_obj.set_tip_settings = function (obj, new_settings) {
  if (typeof obj.tiptext_settings == "undefined") obj.tiptext_settings = {}
  var settings = obj.tiptext_settings
  if (typeof new_settings.base_className != "undefined") settings.base_className = new_settings.base_className
  if (typeof new_settings.className      != "undefined") settings.className      = new_settings.className
  if (typeof new_settings.show_delay     != "undefined") settings.show_delay     = new_settings.show_delay
  if (typeof new_settings.hide_delay     != "undefined") settings.hide_delay     = new_settings.hide_delay
  if (typeof new_settings.stick_delay    != "undefined") settings.stick_delay    = new_settings.stick_delay
  if (typeof new_settings.instant        != "undefined") settings.show_delay     = 0
  if ('show_start'   in new_settings) settings.show_start     = new_settings.show_start
  if ('show_process' in new_settings) settings.show_process   = new_settings.show_process
  if ('show_end'     in new_settings) settings.show_end       = new_settings.show_end
  if ('hide_start'   in new_settings) settings.hide_start     = new_settings.hide_start
  if ('hide_process' in new_settings) settings.hide_process   = new_settings.hide_process
  if ('hide_end'     in new_settings) settings.hide_end       = new_settings.hide_end
  if (typeof new_settings.show_process_interval_time != "undefined") settings.show_process_interval_time = new_settings.show_process_interval_time
  if (typeof new_settings.hide_process_interval_time != "undefined") settings.hide_process_interval_time = new_settings.hide_process_interval_time
 }
 
 function mutation_check_added (current_node) {
  var tiptext = current_node.getAttribute (attribute_name)
  if ((tiptext == null) || (tiptext == "")) return
  if ((typeof current_node.tiptext_settings == "undefined") || (typeof current_node.tiptext_settings.has_event_listener == "undefined")) {
		 create_tip_event_listener (current_node)
		}
 }
 
 // Create an observer instance.
 var MutationObserver = window.MutationObserver || window.WebkitMutationObserver
 var observer = tiptext_obj.observer = new MutationObserver (function (mutation_list) {
  for (var m = 0, curlen_m = mutation_list.length; m < curlen_m; m++) {
   var mutation = mutation_list[m]
   switch (mutation.type) {
    case 'childList' :
     // Check if any node with the attribute_name ("tiptext" by default) attribute was added.
     var addedNodes = mutation.addedNodes
     for (var i = 0, curlen = addedNodes.length; i < curlen; i++) {
      var current_node = addedNodes[i]
      if (typeof current_node.tagName == "undefined") continue
      mutation_check_added (current_node)
      var sublist = current_node.querySelectorAll('*[' + attribute_name + ']')
      for (var j = 0, curlen_j = sublist.length; j < curlen_j; j++) {mutation_check_added (sublist[j])}
     }
     if (tip_current_target != null) {
      var current_parent = tip_current_target
      while (true) {
       if (current_parent == document.documentElement) break
       if (current_parent == null) {remove_active_tip (tip_current_target); break}
       current_parent = current_parent.parentNode
      }
     }
    break
    case "attributes":
     var current_node = mutation.target
     if (typeof current_node.tagName == "undefined") return
     var tiptext = current_node.getAttribute (attribute_name)
     if ((tiptext == null) || (tiptext == "")) return
    if ((typeof current_node.tiptext_settings == "undefined") || (typeof current_node.tiptext_settings.has_event_listener == "undefined")) {
     create_tip_event_listener (current_node)
    } else {
     if (tip_current_target == current_node) set_active_tiptext (tiptext)
    }
    break
   }
  }
 })
 
 observer_initialize ()
 
 function observer_initialize () {
  // Pass in the target node, as well as the observer options.
  observer.observe (parent, {attributes: true, childList: true, subtree: true, attributeFilter: [attribute_name]})
  
  // Registers all appropriate properties in the parent DOM object.
  if (settings_test_on_init == true) {
   mutation_check_added (parent)
   var sublist = parent.querySelectorAll('*[' + attribute_name + ']')
   for (var j = 0, curlen_j = sublist.length; j < curlen_j; j++) {mutation_check_added (sublist[j])}
  }
 }
 
 function getXY (evt, target) {
  if (typeof target == "undefined") target = evt.target
  var rect = target.getBoundingClientRect(); return [evt.clientX - rect.left, evt.clientY - rect.top]
 }
 
 return tiptext_obj
}
