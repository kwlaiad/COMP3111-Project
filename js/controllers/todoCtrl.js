/*global todomvc, angular, Firebase */
'use strict';

/**
* The main controller for the app. The controller:
* - retrieves and persists the model via the $firebaseArray service
* - exposes the model to the template and provides event handlers
*/
todomvc.controller('TodoCtrl',
['$scope', '$location', '$firebaseArray', '$sce', '$localStorage', '$window',
function ($scope, $location, $firebaseArray, $sce, $localStorage, $window) {
	// set local storage
	$scope.$storage = $localStorage;

	var scrollCountDelta = 10;
	$scope.maxQuestion = scrollCountDelta;

	/*
	$(window).scroll(function(){
	if($(window).scrollTop() > 0) {
	$("#btn_top").show();
} else {
$("#btn_top").hide();
}
});
*/
var splits = $location.path().trim().split("/");
var roomId = angular.lowercase(splits[1]);
if (!roomId || roomId.length === 0) {
	roomId = "all";
}

// TODO: Please change this URL for your app
var firebaseURL = "https://incandescent-inferno-7023.firebaseio.com/";


$scope.roomId = roomId;
var url = firebaseURL + roomId + "/questions/";
var echoRef = new Firebase(url);

var query = echoRef.orderByChild("order");
// Should we limit?
//.limitToFirst(1000);
$scope.todos = $firebaseArray(query);

//$scope.input.wholeMsg = '';
$scope.editedTodo = null;

// pre-precessing for collection
$scope.$watchCollection('todos', function () {
	var total = 0;
	var remaining = 0;
	$scope.todos.forEach(function (todo) {
		// Skip invalid entries so they don't break the entire app.
		if (!todo || !todo.head ) {
			return;
		}

		total++;
		if (todo.completed === false) {
			remaining++;
		}

		if ($scope.$storage[todo.$id] == undefined){
            $scope.$storage[todo.$id] = {
                echoed: false,
                reported: false
            }
        }  
				
		// set time
		todo.dateString = new Date(todo.timestamp).toString();
		todo.tags = todo.wholeMsg.match(/#\w+/g);
		
		if (todo.comments == null) {
			todo.comments = [];
		}

		todo.trustedDesc = $sce.trustAsHtml(todo.linkedDesc);
	});

	$scope.totalCount = total;
	$scope.remainingCount = remaining;
	$scope.completedCount = total - remaining;
	$scope.allChecked = remaining === 0;
	$scope.absurl = $location.absUrl();
}, true);

// Get the first sentence and rest
$scope.getFirstAndRestSentence = function($string) {
	var head = $string;
	var desc = "";

	var separators = [". ", "? ", "! ", '\n'];

	var firstIndex = -1;
	for (var i in separators) {
		var index = $string.indexOf(separators[i]);
		if (index == -1) continue;
		if (firstIndex == -1) {firstIndex = index; continue;}
		if (firstIndex > index) {firstIndex = index;}
	}

	if (firstIndex !=-1) {
		head = $string.slice(0, firstIndex+1);
		desc = $string.slice(firstIndex+1);
	}
	return [head, desc];
};

$scope.inputphoto = function()
{
	if($scope.photo.url.length != 0)
	{
		$scope.input.wholeMsg = $scope.input.wholeMsg + '<img src"'+ $scope.photo.url+'"></img>';
	}
	

}

$scope.addTodo = function () {
	var newTodo = $scope.input.wholeMsg.trim();
	var newCate = $scope.input.category;
	
	// No input, so just do nothing
	if (!newTodo.length) {
		return;
	}
	
	if (!newCate) {
		window.alert("Please select category.");
		return;
	}

	var firstAndLast = $scope.getFirstAndRestSentence(newTodo);
	var head = firstAndLast[0];
	var desc = firstAndLast[1];

	$scope.todos.$add({
		wholeMsg: newTodo,
		head: head,
		headLastChar: head.slice(-1),
		desc: desc,
		linkedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
		completed: false,
		timestamp: new Date().getTime(),
		tags: "...",
		echo: 0,
		report: 0,
		order: 0,
		comments: [],
		new_com: '',
		category: newCate
	}).then(function(ref){
                var id = ref.key();
                $scope.$storage[id] = {
                       echoed: false,
                       reported: false
                      };
		});
	// remove the posted question in the input
	$scope.input.wholeMsg = '';
};

$scope.editTodo = function (todo) {
	$scope.editedTodo = todo;
	$scope.originalTodo = angular.extend({}, $scope.editedTodo);
};

$scope.addEcho = function (todo) {
	$scope.editedTodo = todo;
	todo.echo = todo.echo + 1;
	// Hack to order using this order.
	todo.order = todo.order -1;
	$scope.$storage[todo.$id].echoed = true;
	$scope.todos.$save(todo);
};

$scope.doneEditing = function (todo) {
	$scope.editedTodo = null;
	var wholeMsg = todo.wholeMsg.trim();
	if (wholeMsg) {
		$scope.todos.$save(todo);
	} else {
		$scope.removeTodo(todo);
	}
};

$scope.revertEditing = function (todo) {
	todo.wholeMsg = $scope.originalTodo.wholeMsg;
	$scope.doneEditing(todo);
};

$scope.removeTodo = function (todo) {
	$scope.editedTodo = todo;
	todo.report = todo.report +1;
	if(todo.report > 5)
	{
		$scope.todos.$remove(todo);
	}else
	{
		$scope.$storage[todo.$id].reported = true;
		$scope.todos.$save(todo);
	}
	
};

$scope.addComment = function (todo) {
	var newcom = todo.new_com;
	
	$scope.editedTodo = todo;
	
	if(!newcom.length) {
		return;
	}
	
	todo.comments.push ({
		msg: newcom,
		timestamp: new Date().getTime()
	});
	todo.new_com = '';
	$scope.todos.$save(todo);
};

$scope.getPostDate = function (time) {
	var postDate = new Date(time).toString();
	return postDate;
}

$scope.clearCompletedTodos = function () {
	$scope.todos.forEach(function (todo) {
		if (todo.completed) {
			$scope.removeTodo(todo);
		}
	});
};

$scope.toggleCompleted = function (todo) {
	todo.completed = !todo.completed;
	$scope.todos.$save(todo);
};

$scope.markAll = function (allCompleted) {
	$scope.todos.forEach(function (todo) {
		todo.completed = allCompleted;
		$scope.todos.$save(todo);
	});
};

$scope.FBLogin = function () {
	var ref = new Firebase(firebaseURL);
	ref.authWithOAuthPopup("facebook", function(error, authData) {
		if (error) {
			console.log("Login Failed!", error);
		} else {
			$scope.$apply(function() {
				$scope.$authData = authData;
				$scope.isAdmin = true;
			});
			console.log("Authenticated successfully with payload:", authData);
		}
	});
};

$scope.FBLogout = function () {
	var ref = new Firebase(firebaseURL);
	ref.unauth();
	delete $scope.$authData;
	$scope.isAdmin = false;
};

$scope.increaseMax = function () {
	if ($scope.maxQuestion < $scope.totalCount) {
		$scope.maxQuestion+=scrollCountDelta;
	}
};

$scope.toTop =function toTop() {
	$window.scrollTo(0,0);
};

// Not sure what is this code. Todel
if ($location.path() === '') {
	$location.path('/');
}
$scope.location = $location;

// autoscroll
angular.element($window).bind("scroll", function() {
	if ($window.innerHeight + $window.scrollY >= $window.document.body.offsetHeight) {
		console.log('Hit the bottom2. innerHeight' +
		$window.innerHeight + "scrollY" +
		$window.scrollY + "offsetHeight" + $window.document.body.offsetHeight);

		// update the max value
		$scope.increaseMax();

		// force to update the view (html)
		$scope.$apply();
	}
});

}]);
