'use strict';

var app = angular.module('stopwatch', []);

app.controller('userCtrl', ['$scope', '$timeout', function($scope, $timeout) {
	var userC = this;
	//define scope functions
	userC.startStop = startStop; //start/stop timer
	userC.lapReset = lapReset; //add lap or reset(clear) timer
	userC.removeLap = removeLap; //when clicking on red button to remove lap
	userC.editDescription = editDescription; //when editing description

	//place to save events to delete, in case not all are closed at once
	userC.eventsStack = [];
	//initial data to use
	var initialOurData = {startTime:0, stopTime:0, running:false, laps: [{title:"", time:"" },{title:"", time:"" },{title:"", time:"" },{title:"", time:"" },{title:"", time:"" } ] };

	//load initial
	activate();
	function activate() {
		//define scope variables
		userC.mins = '00';
		userC.secs = '00';
		userC.milliSecs = '00';
		userC.startStopText = "Start";
		//place to save the interval so we can stop it later
		//this is init
		userC.ourData = initialOurData;

		//set empty initial
		loadLocalStorage();
	}
	//when removing a lap	
	//this function adds an item to index 0, after pushing items to end, and cutting off spare
	function pushPop() {
		//take the second to last item and make it the last item,
		//until we have a space in the first place
		for (var i=userC.ourData.laps.length-1; i>0; i--) {
			userC.ourData.laps[i].title = userC.ourData.laps[i-1].title;
			userC.ourData.laps[i].time = userC.ourData.laps[i-1].time;
		}
		//we make the first space empty for saving a lap there
		userC.ourData.laps[0].title = "...";
		userC.ourData.laps[0].time = "00:00.00";
	}
	//functions to save/load data to local storage
	//could be moved out as a service
	function saveLocalStorage() {
		localStorage.stopWatchData = JSON.stringify(userC.ourData);
	}
	//function to load data from local storage
	function loadLocalStorage() {
    	//load default data, when none saved yet
	    if (typeof localStorage.stopWatchData === 'undefined') {
	    	localStorage.stopWatchData = JSON.stringify(userC.ourData);
	    	userC.lapResetText = "Lap";
	    }
	    else {
	    	//when saved data exists, load
	    	userC.ourData = JSON.parse(localStorage.stopWatchData);
	    	userC.lapResetText = "Clear";
	    	if (userC.ourData.running) {
		    	userC.lapResetText = "Lap";
	    		
	    	}
	    	//then start watch if saved in running state
	    	if (userC.ourData.running === true) {
	    		userC.lapResetText = "Lap";
	    		startTimer();
	    	}
	    	else { //not running, but some saved number
	    		//the user paused the timer, so we show 'continue'
	    		if (userC.ourData.startTime != 0) {
	    			userC.startStopText = "Continue";
	    		}
	    		else { //empty timer
	    			//data may have been saved, but the timer is reset, so we show 'start'
	    			userC.startStopText = "Start";
	    		}
	    		//we have data, the timer is not running, so just update display with saved number
	    		updateTimer();
	    	}
	    }

	}
	
	//this function updates the timer digital display
	function updateTimer() {
		var milliSecs;
		if (userC.ourData.running == true) {
	    	milliSecs = Date.now(); //get millisecond epoch
		}
		else {
			milliSecs = userC.ourData.stopTime;
		}
		//get difference between now and start time
    	var diff = milliSecs - userC.ourData.startTime;
    	//calculate minutes, seconds, and milliseconds
		var mins = Math.floor(((diff / (60000)) % 60));
		var secs = Math.floor((diff / 1000) % 60);
		var millisecs = Math.floor(diff % 1000);
		//pad leading zeros
		userC.mins = (mins >= 10)?mins:('0' + mins);
		userC.secs = (secs >= 10)?secs:('0' + secs);
		//the milliseconds are usually three digits, so cut off third digit
		millisecs = (millisecs >= 100)?millisecs.toString().substring(0,2):millisecs;
		//pad milliseconds if one digit
		userC.milliSecs = (millisecs >= 10)?millisecs:('0' + millisecs);
		$timeout(function() {
		  // to make sure the code is safely be run on the next digest, and that 
		  //no to digest cycles run at the same time
		  $scope.$digest();
		})
	}
	//handle the stop timer $emit
	$scope.$on('stopTimer', function () {
		//stop the interval from looping
		clearInterval(userC.interval);
		//update the buttons` text:
		userC.lapResetText = "Clear";
		userC.startStopText = "Start";
		//set the stoptime to now
		userC.ourData.stopTime = Date.now();
		//update display
		updateTimer();
		//update local storate that we stopped
		saveLocalStorage();
	});
	//function when starting timer
	function startTimer() {
		//update button text
		userC.lapResetText = "Lap";
		userC.startStopText = "Stop";
		//have text update in timer display
		userC.interval=setInterval(function(){
			//update timer display
			updateTimer();
		},55);//space between updates to lower cpu load
		//the save of start to local storage is done in the calling function
	}
	//when clicking on the Lap or Clear button
	function lapReset() {
		//if we are running, and user clicks lap,
		if (userC.ourData.running == true) {
			//make space
			userC.pushPop();
			//add lap
			userC.ourData.laps[0].name='...'; //default lap name
			//saved lap time
			userC.ourData.laps[0].time=userC.mins + ':' + userC.secs + '.' + userC.milliSecs;
		}
		else //if we aren't running, so do a clear 
		{
			userC.secs = '00';
			userC.mins = '00';
			userC.millisecs = '00';
			//make a copy so original is not changed
			userC.ourData = angular.copy(initialOurData); //data to initial
			userC.startStopText = "Start"; //we now can start
			userC.lapResetText = "Lap"; //after starting, the lap option would be enabled
			updateTimer(); //show timer
		}
		saveLocalStorage(); //save to local storage the start time
	}
	//remove button to remove a lap
	function removeLap(index) {
		//get total number of laps
		var numLaps = userC.ourData.laps.length;
		//i is the lap we clicked on
		var i = index;
		//we take all laps after current and move up
		while (i < (numLaps-1)) {
			//copy
			userC.ourData.laps[i].time = userC.ourData.laps[i+1].time;
			userC.ourData.laps[i].title = userC.ourData.laps[i+1].title;
			i++;
		}
		//clear last
		userC.ourData.laps[numLaps-1].time = "";
		userC.ourData.laps[numLaps-1].title = "";
		//now save changes to storage
		saveLocalStorage();
	}
	//when clicking on the Start or Stop button
	function startStop() {
		//when click on stop
		if (userC.ourData.running == true) {
			//if running, so stop
			userC.ourData.running = false;
			$scope.$emit('stopTimer');
			//set text button to 'continue'
			userC.startStopText = "Continue";
			//save to storage
			saveLocalStorage();
		}
		else {
			//we we are not running, set to start running
			userC.ourData.running = true;
			//allow continue by using current time only after reset or first use
			if (userC.ourData.startTime == 0) {
	    		userC.ourData.startTime = Date.now();
			}
			else {//we have a saved start and end time. the end time should become now
				//and the start time - the difference
				//we save the difference between saved start and stopped times
				var diff = userC.ourData.stopTime - userC.ourData.startTime;
				userC.ourData.stopTime = 0;
				//and the starttime becomes the difference
				userC.ourData.startTime = Date.now() - diff;
			}
			saveLocalStorage();
			startTimer();
		}
	}
	function editDescription(index, action) {
		if (action == 'enter') {
			userC.eventsStack.push(index);
			userC.ourData.laps[index].showInput = true;
		}
		else if (action == 'leave') {
			//when leaving focus, we save
			//we make sure to close any editable inputs
			for (var i=0; i<userC.eventsStack.length; i++) {
				userC.ourData.laps[userC.eventsStack[i]].showInput = false;
			}
			userC.eventsStack = []; //clean when finished
		}
		//save to storage
		saveLocalStorage();
	}
}]);