// With jQuery you select (query) HTML elements and perform "actions" on them.
// jQuery Syntax 
// Basic syntax is: $(selector).action()
// . A $ sign to define/access jQuery
// . A (selector) to "query (or find)" HTML elements {The element Selector, The #id Selector, The .class Selector, } >> ref : https://www.w3schools.com/jquery/jquery_selectors.asp
// . A jQuery action() to be performed on the element(s)
// 
require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tableview',
    '/static/app/Cisco_IronPort_Perfmon/Modal.js',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, utils, SearchManager, TableView, Modal){

    // var defaultTokenModel = mvc.Components.get("default");
    var audio ; 
    var defaultTokenModel = mvc.Components.getInstance('default', {create: true});
    // 	
    var myTable = new TableView({
	id: "table1",
	managerid: "base_search",
	drilldown: "row",
	reload_macros: true,
	enable_lookups: true,
	refresh: "5m",
	refreshType: "delay",
	preview: true,
	app: utils.getCurrentApp(),
	sample_ratio: 1,
   	el: $("#customTableRenderer01")
    }).render();

    var mySearch = new SearchManager({
        id: "base_search",
	earliest_time: "-35m@m",
        latest_time: "-5m@m",
	preview: true,
	cache: false,
	search: "`cisco_ironport_basesearch`"
    });

    var CPU_ICONS = {
		critical: 'gauge-radial',
		warning: 'gauge-radial',
		normal: 'gauge-radial'
    };
    
    var MEM_ICONS = {
		critical: 'gauge-marker',
		warning: 'gauge-marker',
		normal: 'gauge-marker'
    };
    
    var WQUEUE_ICONS = {
		critical: 'user',
		warning: 'user',
		normal: 'user'
    };
    
    var HEALTH_ICONS = {
	    healthy: 'activity',
		moderately: 'activity',
		unhealthy: 'activity'
    };

    var HEALTH; 
    
    var ALARM_ICONS = {
		Enabled: 'lock-unlocked',
		Disabled: 'lock'
    };

    
    // Inherit from the BaseCellRenderer base class
    var CustomTableViewCellRenderer = TableView.BaseCellRenderer.extend({
        initialize: function() {
	},
        canRender: function(cell) {
	    //Required 
	    // Underscore.js is a JavaScript library that provides a whole mess of useful functional programming helpers without extending any built-in objects.
		// Contains is the one off the collection functions of Underscore.js 
		      // contains ==> Returns true if the value is present in the list.
	
	    return _(['cpuLoad', 'memLoad', 'workQ', 'health_status', 'alarm_status', 'Actions']).contains(cell.field);
        },
	setup: function($td, cell) {
	},
	teardown: function($td, cell) {
	},
        render: function($td, cell) {
	    //Required
	    // Splunk Style for icon and other.
	    // http://<splunk_host>:<splunk_port>/en-US/static/docs/style/style-guide.html
            var icon = 'splunk';

	    if (cell.field === 'cpuLoad') {
		var cpuLoad = cell.value;
		var icon;
		if(cpuLoad >= 85 ){
		    cpu = 'critical'; 
		    icon = CPU_ICONS[cpu];
		}else if (cpuLoad >=70){
		    cpu = 'warning'; 
		    icon = CPU_ICONS[cpu];
		}
		else {
		    cpu = 'normal'; 
		    icon = CPU_ICONS[cpu];
		}
		$td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%-cpu%>"></i> <%-cpuLoad%>', {icon: icon, cpu: cpu, cpuLoad: cpuLoad }));
		// console.log($td, 'cpuLoad: ' ,icon, cpuLoad);
	    };

	    if (cell.field === 'memLoad') {
			var memLoad = cell.value;
			var icon;
			var mem;
		if(memLoad >= 85 ){
		    mem = 'critical';
		    icon = MEM_ICONS[mem];
		}else if (memLoad >=70){
		    mem = 'warning';
		    icon = MEM_ICONS[mem];
		}
		else {
		    mem = 'normal';
		    icon = MEM_ICONS[mem];
		}
		$td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%-mem%>"></i> <%-memLoad%>', {icon: icon, mem: mem, memLoad: memLoad}));
		// console.log($td, 'memLoad: ', icon, memLoad);
	    };

	    if (cell.field === 'workQ') {
			var workQueueWithCommas = cell.value;
			var workQueue = parseFloat((cell.value).replace(/,/g, ''));
			var icon;
			var queue;
			if(workQueue >= 15000 ){
			    queue = 'critical';
			    icon = WQUEUE_ICONS[queue];
			}else if (workQueue >=10000){
			    queue = 'warning';
			    icon = WQUEUE_ICONS[queue];
			}
			else {
			    queue = 'normal';
			    icon = WQUEUE_ICONS[queue];
			}
			$td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%-queue%>"></i> <%-workQueue%>', {icon: icon, queue: queue, workQueue: workQueueWithCommas}));
			// console.log($td, 'workQueue: ', icon, workQueue);
		    };

	    if (cell.field === 'health_status' && HEALTH_ICONS.hasOwnProperty(cell.value)) {
			icon = HEALTH_ICONS[cell.value];
			HEALTH = cell.value ; 
			$td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%-health_status%>"></i>', {icon: icon, health_status: cell.value }));
	    };
	     
	    if (cell.field === 'alarm_status' && ALARM_ICONS.hasOwnProperty(cell.value)) {
			icon = ALARM_ICONS[cell.value];
			$td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%-alarm_status%>"> </i><%-alarm_status%>', {icon: icon, alarm_status: cell.value }));
			if(cell.value === "Enabled" && HEALTH === "unhealthy"){
		    	src = "/static/app/Cisco_IronPort_Perfmon/sound/alert.wav";
		    	audio = new Audio(src);
		    	audio.play();
		    	console.log('Health status:', HEALTH);
		    // console.log("alarm_status:");
			}
	    };

	    if (cell.field === 'Actions') {
			var action_combind = cell.value;
			var arr_action = action_combind.split(":");
			var first = arr_action[0];
			var last = arr_action[1];
			$td.addClass('action').html(_.template('<p><span><%-act1%></span>|<a><%-act2%></a></p>', {act1: first, act2: last }));
	    };
	 }
    });
    // Register custom cellrenderer
    // Add cell to table and Re-render 
    var myCellRenderer = new CustomTableViewCellRenderer();
    	myTable.addCellRenderer(myCellRenderer); 
    	myTable.render();
    
    //Click handerer on table
    //
    myTable.on("click",function(e){
        e.preventDefault()
		// console.log("Host: ", e.data["row.host"])
		var inner_host = 	e.data["row.host"];
		var inner_action = e.data["row.Actions"];
		var arr_action = inner_action.split(":");
		var action_status = arr_action[1];
		// | `update_cisco_ironport_lookup(<host>,<status>)`
		var search_macro = '|`' + `update_cisco_ironport_lookup(${inner_host},${action_status})` + '`'
		
		// console.log("MyInnerSearch: ",search_macro)
			

  	// 
		defaultTokenModel.set("clicked_on_host",e.data["row.host"]);
		var tokenValue = defaultTokenModel.get("clicked_on_host");
		// console.log("TokenValue: ",tokenValue)
	        // Create new modals object and assign properties to it.
		var myModal = new Modal("modal1", {
		    title: action_status,
		    backdrop: true,
		    keyboard: true,
		    focus: true,
		    show: true,
		    destroyOnHide: true,
		    type: 'normal'
		});
		// console.log("MyModal: ",myModal)
		//
		//
		myModal.body
		// $(selector).append(content,function(index,html))
		//
		// .append($('<p>Are you sure you want to disable sound alarm on </p><div id="search_details_table"></div>'));
		.addClass('modal_body').html(_.template('<p>Are you sure you want to <%-action%> sound alarm on <%-host%>?</p>', {action: action_status, host: inner_host }));
	
		/* 
		$(myModal.$el).on("show", function() {
			setTimeout(function() {
			    var epoch = (new Date).getTime()
			    var modal_inner_search = new SearchManager({
			        // id: "base_search" + epoch,
			        id: "base_search",
			        earliest_time: "-15m@m",
			        latest_time: "now",
			        preview: true,
			        cache: false,
	                search: "`cisco_ironport_basesearch` | search host=\"$clicked_on_host$\" "
			    }, {tokens: true});

			    var myInnerTable = new TableView({
					// id: "modal_table" + epoch, 
					// managerid: "base_search" + epoch,
					id: "modal_table", 
					managerid: "base_search",
					pageSize: "10",
					el: $("#search_details_table")
			    }).render();
			}, 300);
		});
		

		*/

		myModal.footer.append($('<button>').attr({
		    'type': 'button',
		    'data-dismiss': 'modal'
	            }).addClass('btn').text('Cancel').on('click', function(){
			   // Not taking any action on Cancel..! 
		    }), $('<button>').attr({
		    'type': 'button',
		    'data-dismiss': 'modal'
	            }).addClass('btn btn-primary').text(action_status).on('click', function(){
	            // Search to update lookup
	            // | `update_cisco_ironport_lookup(172.25.8.38,Enable)`  	
			    setTimeout(function() {
			    	var modal_inner_search = new SearchManager({
			    		id: "modal_search",
			    		earliest_time: "-15m@m",
			    		latest_time: "now",
			    		preview: true,
			    		cache: false,
			    		enable_lookups: true,
			    		search: search_macro
			    	}, {tokens: true});
			    }, location.reload(), 0);
		    })
		);

	    $(myModal.$el).on("hide", function() {
			// Not taking any action on hide, but you can if you want to!
		});

	    myModal.show(); // Launch it!
	});
});
