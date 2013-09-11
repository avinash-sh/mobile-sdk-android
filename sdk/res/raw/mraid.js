/*
 *    Copyright 2013 APPNEXUS INC
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
*/

(function() {

	// Set up some variables
	var mraid = window.mraid = {};
	mraid.util = {};
	var listeners = [];
	listeners['ready']=[];
	listeners['error']=[];
	listeners['stateChange']=[];
	listeners['viewableChange']=[];
	var state='loading'; //Can be loading, default, expanded, or hidden
	var placement_type='inline';
	var is_viewable=false;
	var expand_properties={width:-1, height:-1, useCustomClose:false, isModal:true};
	var orientation_properties={allowOrientationChange:true, forceOrientation:"none"};
	var resize_properties={width:-1, height:-1, offsetX: 0, offsetY: 0, customClosePosition: 'top-right', allowOffscreen: true};

	// ----- MRAID AD API FUNCTIONS -----

	// getVersion() returns string '2.0'
	mraid.getVersion=function(){ return '2.0'};

	/** Adds a listener to a specific event. For example, a function onReady might be defined, and then mraid.addEventListener('ready', onReady)
	  * is called. When the ready event is fired, onReady will be called.
	  * Events 'error', 'viewableChange', 'stateChange', have parameters.
         */
	mraid.addEventListener=function(event_name, method){
		if(listeners[event_name].indexOf(method) > -1) return; // Listener is already registered
		listeners[event_name].push(method);
	};

	// Removes a listener from the registry
	mraid.removeEventListener=function(event_name, method){
	    //If no method name is given, remove all listeners from event
	    if(method == null){
	        listeners[event_name].length=0;
	    }

		var method_index = listeners[event_name].indexOf(method);
		if(method_index > -1){ //Don't try to remove unregistered listeners
			listeners[event_name].splice(method_index,1);
		}else{
		    mraid.util.errorEvent("An unregistered listener was requested to be removed.", "mraid.removeEventListener()")
		}
	};

	//returns 'loading', 'default', 'expanded', or 'hidden'
	mraid.getState=function(){
		return state;
	};

	//returns 'inline' or 'interstitial'
	mraid.getPlacementType=function(){
		return placement_type;
	};

	//returns true or false
	mraid.isViewable=function(){
		return is_viewable;
	};

	// ----- MRAID JS TO NATIVE FUNCTIONS -----

	//Closes an expanded ad or hides an ad in default state
	mraid.close=function(){
		switch(mraid.getState()){
		case 'loading':
			mraid.util.errorEvent("mraid.close() called while state is 'loading'.", "mraid.close()");
			break;
		case 'default':
			window.open("mraid://close/");
			mraid.util.stateChangeEvent('hidden');
			break;
		case 'expanded':
			window.open("mraid://close/");
			mraid.util.stateChangeEvent('default');
			break;
		case 'hidden':
			mraid.util.errorEvent("mraid.close() called while ad was already hidden", "mraid.close()");
			break;
		}
	};

	// Expands a default state ad, or unhides a hidden ad. Optionally takes a URL to load in the expanded view
	mraid.expand=function(url){
		switch(mraid.getState()){
		case 'loading':
			mraid.util.errorEvent("mraid.expand() called while state is 'loading'.", "mraid.expand()");
			break;
		case 'default':
			window.open("mraid://expand/"+"?w="+mraid.getExpandProperties().width+"&h="+mraid.getExpandProperties().height+"&useCustomClose="+mraid.getExpandProperties().useCustomClose+(url!=null ? "&url="+url:""));
			mraid.util.stateChangeEvent('expanded');
			if(url!=null){
			    window.open(url);
			}
			break;
		case 'expanded':
			mraid.util.errorEvent("mraid.expand() called while state is 'expanded'.", "mraid.expand()");
			break;
		case 'hidden':
            mraid.util.errorEvent("mraid.expand() called while state is 'hidden'.", "mraid.expand()");
			break;
		}
	};

	// Takes an object... {width:300, height:250, useCustomClose:false, isModal:false};
	mraid.setExpandProperties=function(properties){
		properties.isModal=true; // Read only property.
		expand_properties=properties;
	};


	//returns a json object... {width:300, height:250, useCustomClose:false, isModal:false};
	mraid.getExpandProperties=function(){
		return expand_properties;
	};

    // Takes an object... {allowOrientationChange:true, forceOrientation:"none"};
	mraid.setOrientationProperties=function(properties){
	    // TODO: Update native-side properties
	    orientation_properties=properties;
	}

	//returns a json object... {allowOrientationChange:true, forceOrientation:"none"};
	mraid.getOrientationProperties=function(){
	    return orientation_properties;
	}

	// Takes a boolean
	mraid.useCustomClose=function(well_is_it){
		ep = mraid.getExpandProperties();
		ep.useCustomClose = well_is_it;
		mraid.setExpandProperties(ep);
	};

	// Loads a given URL
	mraid.open=function(url){
		window.open(url);
	};

    // MRAID 2.0 Stuff.
    mraid.resize=function(){
        if(resize_properties.height<0 || resize_properties.width<0){
            mraid.util.errorEvent("mraid.resize() called before mraid.setResizeProperties()", "mraid.resize()");
            return;
        }

        window.open("mraid://resize/?w="+resize_properties.width
                   +"&h="+resize_properties.heigh
                   +"&offset_x="+resize_properties.offsetX
                   +"&offset_y="+resize_properties.offsetY
                   +"&custom_close_position="+resize_properties.customClosePosition
                   +"&allow_offscreen="+resize_properties.allowOffscreen);
    }

    // TODO: get/set resize properties

    mraid.getOrientationProperties=function(){
        return orientation_properties;
    }

    mraid.setOrientationProperties=function(properties){
        orientation_properties=properties;

        window.open("mraid://setOrientationProperties/?allow_orientation_change"+properties.allowOrientationChange
                   +"&force_orientation="+properties.forceOrientation);
    }

    // Creates a calendar event when passed a W3C-formatted json object
    mraid.createCalendarEvent=function(event){
        window.open("mraid://createCalendarEvent/?p="+encodeURIComponent(JSON.stringify(event)));
    }

    // Creates a calendar event when passed a W3C-formatted json object
    mraid.createCalendarEvent=function(uri){
        window.open("mraid://playVideo/?uri="+encodeURIComponent(uri));
    }

    // Stores a picture on the device
    mraid.storePicture=function(uri){
        window.open("mraid://storePicture/?uri="+encodeURIComponent(uri));
    }



	// ----- MRAID UTILITY FUNCTIONS -----
	// These functions are called by the native SDK to drive events and update information

	mraid.util.setPlacementType=function(type){
		placement_type=type;
	};

	mraid.util.readyEvent=function(){
		for(var i=0;i<listeners['ready'].length;i++){
			listeners['ready'][i]();
		}
	};

	mraid.util.errorEvent=function(message, what_doing){
		for(var i=0;i<listeners['error'].length;i++){
			listeners['error'][i](message, what_doing);
		}
	};

	mraid.util.viewableChangeEvent=function(is_viewable_now){
		is_viewable = is_viewable_now;
		for(var i=0;i<listeners['viewableChange'].length;i++){
			listeners['viewableChange'][i](is_viewable_now);
		}
	};

	mraid.util.setIsViewable=function(is_it_viewable){
		if(is_viewable===is_it_viewable) return;
		is_viewable=is_it_viewable;
		mraid.util.viewableChangeEvent(is_viewable);
	};

	mraid.util.stateChangeEvent=function(new_state){
		if(state===new_state) return;
		state=new_state;
		if(new_state==='hidden'){
			mraid.util.setIsViewable(false);
		}
		for(var i=0;i<listeners['stateChange'].length;i++){
			listeners['stateChange'][i](new_state);
		}
	};



}());
