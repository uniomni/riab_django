/**
 * Copyright (c) 2008-2010 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 * 
 * AIFDR, 2011
 */

/* Basic RIAB map view for layers
*/

var mapPanel, tree;
Ext.onReady(function() {
	// create a map panel
	
	var ctrl, toolbarItems = [], action, actions = {};
	
	var map = new OpenLayers.Map({allOverlays: false})
	    
	    
	    impact =  new OpenLayers.Layer.WMS("Impact Layers",
					       "http://www.aifdr.org:8080/geoserver/wms", {
						   layers: [
							    //FIXME: This should be done programatically via addLayer or equivalent ... not working
							    //       so hard coded
							    //FIXME (Ole): Commented out as it shows up anyway. Why?
							    //"impact:earthquake_impact_calculated_by_riab",
							    
							    //FIXME (Ole): Added a precomputed national map for demo purposes
							    "impact:Earthquake_Fatalities_National"
							    ],
						   transparent: true,
						   format: "image/gif"
					       }, {
						   isBaseLayer: false,
						   buffer: 0,
						   // exclude this layer from layer container nodes
						   displayInLayerSwitcher: false,
						   visibility: false,
						   opacity: 0.5
					       }
					       )
	    //FIXME: Not used at the moment but might be useful - also dosn't seem to work as a control??
	    // taken from openlayers example - create bounding box control
	    var control = new OpenLayers.Control();
	OpenLayers.Util.extend(control, {
		draw: function () {
		    // this Handler.Box will intercept the shift-mousedown
		    // before Control.MouseDefault gets to see it
		    this.box = new OpenLayers.Handler.Box( control,
							   {"done": this.notice},
							   {keyMask: OpenLayers.Handler.MOD_SHIFT});
		    this.box.activate();
		},
		    
                    notice: function (bounds) {
		    var ll = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom)); 
		    var ur = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top)); 
		    alert(ll.lon.toFixed(4) + ", " + 
			  ll.lat.toFixed(4) + ", " + 
			  ur.lon.toFixed(4) + ", " + 
			  ur.lat.toFixed(4));
		}
	    });
	map.addControl(control);
	
	//The function to call the Riab Calculate function
	action = new GeoExt.Action({
		text: "calculate",
		//FIXME: Getting the bounding box fails with JS error
		/* 
		   var ll = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom));
		   var ur = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top));
		   
		   ll.lon.toFixed(4)
		   ll.lat.toFixed(4)
		   ur.lon.toFixed(4)
		   ur.lat.toFixed(4)
		*/
		
		//FIXME:Need to determine which layers are selected and pass to risk function
		
		handler: function(){
		    Ext.Msg.alert('Calculate Risk Function', 'This will start the Risk calculation for the given area, hazard and exposure layer. Press OK to continue')
		    Ext.Ajax.request({
			    url: '/riab_basic/calculate_impact/Population_2010/Earthquake_Ground_Shaking/1',
			    success: function(response) { 
				result= Ext.decode(response.responseText);
				Ext.Msg.alert('Calculate Risk Function', 'Risk Calculation Complete and added to layer:'+result.geoserver_layer);
				
				// Remove previous layer
				layers = map.getLayersByName("Layer NAME");
				
				if (layers.length > 0) {
				    map.removeLayer(layers[0]);
				}				
				var wmsLayer = new OpenLayers.Layer.WMS("Layer NAME",
									"http://www.aifdr.org:8080/geoserver/wms",
	                                                                {layers: result.geoserver_layer, transparent: true},
                                                                     	{isBaseLayer : false, isVisible: true});
                                map.addLayer(wmsLayer);
 				map.controls[0].redraw();
			    },
			    
			    failure: function() {      
				Ext.Msg.alert('Click', 'Ajax call failed'); //response.responseText);
			    },
			})},
		
		map: map,
		// button options
		tooltip: "calculate riab function",
		// check item options
	    });             
	actions["calculate"] = action;
	toolbarItems.push(action);
	
	// Create the exposure layer
	exposure =  new OpenLayers.Layer.WMS("Exposure Layers",
					     "http://www.aifdr.org:8080/geoserver/wms", {
						 layers: [
							  "exposure:Population_2010",
							  "exposure:AIBEP_schools"
							  ],
						 transparent: true,
						 format: "image/gif"
					     }, {
						 isBaseLayer: false,
						 buffer: 0,
						 // exclude this layer from layer container nodes
						 displayInLayerSwitcher: false,
						 visibility: false,
						 opacity: 0.8
					     }
					     )
	 

	    mapPanel = new GeoExt.MapPanel({
		    border: true,
		    region: "center",
		    // we do not want all overlays, to try the OverlayLayerContainer
		    map: map,
		    tbar: toolbarItems,
		    extent: "105.3000035, -8.3749995,110.29,-5.566",
		    layers: [
			     new OpenLayers.Layer.WMS("Global 2",
						      "http://maps.opengeo.org/geowebcache/service/wms", {
							  layers: "bluemarble"
						      }, {
							  buffer: 0
						      }
						      ),
			     /*new OpenLayers.Layer.Google("Global",
			       {type: google.maps.MapTypeId.TERRAIN}
			       ),
			     */
			  
			     // create a group layer (with several layers in the "layers" param)
			     // to show how the LayerParamLoader works
			     exposure,
			  
			     new OpenLayers.Layer.WMS("Hazard Layers",
						      "http://www.aifdr.org:8080/geoserver/wms", {
							  layers: [
								   "hazard:Lembang_Earthquake_Scenario" ,
								   "hazard:Shakemap_Padang_2009",
								   "hazard:Earthquake_Ground_Shaking",
								   "sources:Earthquake_Faults"
								   ],
							  transparent: true,
							  format: "image/gif"
						      }, {
							  isBaseLayer: false,
							  buffer: 0,
							  // exclude this layer from layer container nodes
							  displayInLayerSwitcher: false,
							  visibility: false,
							  opacity: 0.6
						      }
						      ),
			     impact
			  
			     ]
		});
     
     
	// create our own layer node UI class, using the TreeNodeUIEventMixin
	var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());
     
	// using OpenLayers.Format.JSON to create a nice formatted string of the
	// configuration for editing it in the UI
	var treeConfig = new OpenLayers.Format.JSON().write([{
		    nodeType: "gx_baselayercontainer"
		}, {
		    nodeType: "gx_overlaylayercontainer",
		    expanded: true,
		    // render the nodes inside this container with a radio button,
		    // and assign them the group "foo".
		    loader: {
			baseAttrs: {
			    radioGroup: "foo",
			    uiProvider: "layernodeui"
			}
		    }
		},
	{
	    nodeType: "gx_layer",
	    layer: "Exposure Layers",
	    isLeaf: false,
	    // create subnodes for the layers in the LAYERS param. If we assign
	    // a loader to a LayerNode and do not provide a loader class, a
	    // LayerParamLoader will be assumed.
	    loader: {
		param: "LAYERS"
	    }
	},
	{
	    nodeType: "gx_layer",
	    layer: "Hazard Layers",
	    isLeaf: false,
	    // create subnodes for the layers in the LAYERS param. If we assign
	    // a loader to a LayerNode and do not provide a loader class, a
	    // LayerParamLoader will be assumed.
	    loader: {
		param: "LAYERS"
	    }
	},
	{
	    nodeType: "gx_layer",
	    layer: "Impact Layers",
	    isLeaf: false,
	    // create subnodes for the layers in the LAYERS param. If we assign
	    // a loader to a LayerNode and do not provide a loader class, a
	    // LayerParamLoader will be assumed.
	    loader: {
		param: "LAYERS"
	    }
	},
	     
	     
	     
		], true);
     
	// create the tree with the configuration from above
	tree = new Ext.tree.TreePanel({
		border: true,
		region: "west",
		title: "Layers",
		width: 200,
		split: true,
		collapsible: true,
		collapseMode: "mini",
		autoScroll: true,
		plugins: [
			  new GeoExt.plugins.TreeNodeRadioButton({
				  listeners: {
				      "radiochange": function(node) {
					  alert(node.text + " is now the active layer.");
				      }
				  }
			      })
			  ],
		loader: new Ext.tree.TreeLoader({
			// applyLoader has to be set to false to not interfer with loaders
			// of nodes further down the tree hierarchy
			applyLoader: false,
			uiProviders: {
			    "layernodeui": LayerNodeUI
			}
		    }),
		root: {
		    nodeType: "async",
		    // the children property of an Ext.tree.AsyncTreeNode is used to
		    // provide an initial set of layer nodes. We use the treeConfig
		    // from above, that we created with OpenLayers.Format.JSON.write.
		    children: Ext.decode(treeConfig)
		},
		listeners: {
		    "radiochange": function(node){
			alert(node.layer.name + " is now the the active layer.");
		    }
		},
		rootVisible: false,
		lines: false,
		bbar: [{
			text: "Show/Edit Tree Config",
			handler: function() {
			    treeConfigWin.show();
			    Ext.getCmp("treeconfig").setValue(treeConfig);
			}},
	{
	    text:"Calculate",
	}
		    ]
	    });
     
	// dialog for editing the tree configuration
	var treeConfigWin = new Ext.Window({
		layout: "fit",
		hideBorders: true,
		closeAction: "hide",
		width: 300,
		height: 400,
		title: "Tree Configuration",
		items: [{
			xtype: "form",
			layout: "fit",
			items: [{
				id: "treeconfig",
				xtype: "textarea"
			    }],
			buttons: [{
				text: "Save",
				handler: function() {
				    var value = Ext.getCmp("treeconfig").getValue()
				    try {
					var root = tree.getRootNode();
					root.attributes.children = Ext.decode(value);
					tree.getLoader().load(root);
				    } catch(e) {
					alert("Invalid JSON");
					return;
				    }
				    treeConfig = value;
				    treeConfigWin.hide();
				}
			    }, {
				text: "Cancel",
				handler: function() {
				    treeConfigWin.hide();
				}
			    }]
		    }]
	    });
     
	new Ext.Viewport({
		layout: "fit",
		    hideBorders: true,
		    items: {
		    layout: "border",
			deferredRender: false,
			items: [mapPanel, tree, {
			    contentEl: "desc",
				region: "east",
				bodyStyle: {"padding": "5px"},
				collapsible: true,
				collapseMode: "mini",
				split: true,
				width: 200,
				title: "Description"
				}]
			}
	});
    });
