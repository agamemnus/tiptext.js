Tiptext.js
===========

This plugin provides easy floating tooltip functionality with mutation observers.
Does not support IE under IE11. See http://caniuse.com/mutationobserver for details on browser compatibility. (Polyfills might work.)


Donations
----------
Please help feed Tiny Tim!

Gratipay / Gittip: https://gratipay.com/agamemnus/

Paypal: agamemnus at flyingsoftgames dot com


Table of Contents
------------------
[Example](#example) <br/>
[Why?](#why) <br/>
[License](#license) <br/>
[Basic Usage](#basic-usage) <br/>
[Full Usage](#full-usage) <br/>


Example
--------
See [this example](http://agamemnus.github.io/tiptext.js/).


Why?
-----

Because I'm paid by Microsoft to promote IE... But seriously, it allows you, the website designer, a clean interface with which to add tip text.

* No more forgetting to refresh your tip text object, or having to decide where to refresh it! It is refreshed when the "tiptext" attribute is refreshed.
* The tip text div is bound to a containing element, such as (by default) document body. Versus appending to the target element's div:
<br/>a) No unintended side-effects of target elements' CSS selectors affecting the tip div's styling.
<br/>b) Overflow: hidden is not a problem, since we are bound to a larger containing element.
<br/>c) Overlap with elements with a larger z-index is not a problem, since the tip text has its own z-index.
* You can load inline text via AJAX (or just by including it in your HTML), and set a tiptext attribute. Event listeners will be automatically registered, thanks to mutation observers.


License
--------
Tiptext.js (c) 2013-2017 Michael Romanovsky.
<br/>Non-commercial usage and commercial usage with income of less than 5,000 USD a year: MIT license, with modifications as per this proviso.
<br/>Commercial usage with income of 5,000 USD or more a year: contact me at: agamemnus at gmail dot kom to negotiate an appropriate license and fee.


Basic Usage
------------

1) ````new Tiptext ()````
<br/>2a) ````dom_element.setProperty ('tiptext', 'Blah.')````
<br/>2b) ````<div tiptext="Moo." class="test"> Hello. I am an inline div! </div>````


Full Usage
-----------
Complete usage, with defaults and explanations:
````Javascript
var tiptext = new Tiptext ({
 attribute_name  : 'tiptext',
 // The DOM attribute that should be referenced by the function.
 
 parent          : document.body,
 // The parent of the tip and the base element upon which mutation observers are set.
 
 base_className  : 'tiptext',
 // The base CSS class to add to the tip div. Set to attribute_name if not specified.
 
 show_delay      : 400,
 // After mouseover, the millisecond delay before setting the tip div to display: block.
 
 hide_delay      : 200,
 // After mouseout , the millisecond delay before setting the tip div to display: none.
 
 stick_delay     : 500,
 // If a maximum tip_stick_delay of milliseconds passes from the moment a tip is hidden, and a new tip is set to be shown, the new tip show delay is 0.
 
 show_start      : function (tiptext_obj) {tiptext_obj.tipdiv.style.opacity = 1},
 // The function to run on show start. Parameter(s): Tiptext instance.
 
 show_process    : undefined,
 // The function to run between show start and show end. Parameter(s): Tiptext instance, current_process_ratio.
 
 show_end        : function (tiptext_obj) {tiptext_obj.tipdiv.style.opacity = 1; tiptext_obj.tipdiv.style.display = 'block'},
 // The function to run on show end. Parameter(s): Tiptext instance.
 
 hide_start      : function (tiptext_obj) {tiptext_obj.tipdiv.style.opacity = 0},
 // The function to run on hide start. Parameter(s): Tiptext instance.
 
 hide_process    : undefined,
 // The function to run between hide start and hide end. Parameter(s): Tiptext instance, current_process_ratio.
 
 hide_end        : function (tiptext_obj) {tiptext_obj.tipdiv.style.opacity = 0; tiptext_obj.tipdiv.style.display = 'none'},
 // The function to run on hide end. Parameter(s): Tiptext instance.
 
 show_process_timeout_time : 25,
 // The time between show_process calls, in milliseconds.
 
 hide_process_timeout_time : 25,
 // The time between hide_process calls, in milliseconds.
 
 test_on_init    : true,
 // Whether to test the parent and its descendants for appropriate tip attributes immediately. Defaults to to true.
 
 initial_styling : function (tipdiv) {tipdiv.style.display = 'none'}
 // Sets the initial styling of the tip div. Parameters(s): tipdiv.
})
````

Properties:
````Javascript
.attribute_name
// Same as the Tiptext setting.
// Re-setting this will re-initialize the event observer.

.parent
// Same as the Tiptext setting.
// Re-setting this will re-initialize the event observer and re-initialize the mousemove event listener on the new parent.

.base_className, .show_delay, .hide_delay, .stick_delay, .show_start, .show_process, .show_end,
.hide_start, .hide_process, .hide_end, .show_process_timeout_time, hide_process_timeout_time
// The section above has default vcalues and explanations for these properties.

.current_target
// The current target of the tiptext. READ-ONLY. Use set_tip (see below) to set the tip target manually.

.show_tip ({x: x, y: y, target: {tiptext_settings: tiptext_settings, ... other DOM element properties (target must be a DOM element)}})
.show_tip (event)
// Fires the tip show event manually.

.current_action
// The current action. READ-ONLY. Possible values: null (currently not doing anything), 'hide' (currently hiding the tip), or 'show' (currently showing the tip).

.tipdiv
// The tip div of the tiptext. I.e.: the visual tip DOM object itself.

.current_process_callback
// The current active hide_process or start_process callback, or undefined. READ-ONLY.

.current_process_ratio
// The current "process" ratio. READ-ONLY.
// From 0 (start_process started or hide_process ended) to 1 (start_process ended or hide_process started).

.remove_active_tip (options)
// Fires the tip hide event manually. Options can have a value of {instant: true}, which hides the tip immediately, ignoring stick delay and hide delay values.

.destroy ()
// Disconnects (stops) the mutation observer, removes the currently active tip from the parent, and removes the parent's mousemove event listener..
````
<br/>

To add a tip to an element, either set its tiptext attribute in-line (in HTML), or via setProperty:
`some_dom_element.setProperty (tiptext.tip_attribute_name, some_text_here)`.

You can also modify Tiptext settings of individual DOM elements in Javascript via `tiptext.set_tip_settings (some_dom_element, settings)`. Two additional properties that are supported with this method:

1) `className`
<br/>Sets a specific extra CSS class name in the form of `[tip_attribute_name]-[className]` on the tip when it's activated via the element.
<br/>For example, if the className is `ultra`, and the tip_attribute_name is `tiptext`, the full CSS class string will be: `tiptext tiptext-ultra`.

2) `instant`
<br/>Setting this property (to any value) will override the tip's individual show_delay property (`tip_show_delay`) to 0.
