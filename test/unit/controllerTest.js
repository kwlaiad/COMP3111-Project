'use strict';

describe('sorting the list of users', function() {
  it('sorts in descending order by default', function() {
    var users = ['jack', 'igor', 'jeff'];
    //    var sorted = sortUsers(users);
    //    expect(sorted).toEqual(['jeff', 'jack', 'igor']);
  });
});

describe('TodoCtrl', function() {
  beforeEach(module('todomvc'));
  // variables for injection
  var controller;
  var scope;
  var location;
  var firebaseArray;
  var sce;
  var localStorage;
  var window;

  // Injecting variables
  // http://stackoverflow.com/questions/13664144/how-to-unit-test-angularjs-controller-with-location-service
  beforeEach(inject(function($location,
    $rootScope,
    $controller,
    $firebaseArray,
    $localStorage,
    $sce,
    $window){
      // The injector unwraps the underscores (_) from around the parameter names when matching

      scope = $rootScope.$new();

      location = $location;
      controller = $controller;
      firebaseArray = $firebaseArray;
      sce = $sce;
      localStorage = $localStorage;
      window = $window;
    }));

    describe('TodoCtrl Testing', function() {
      it('setFirstAndRestSentence', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope
        });

        var testInputs = [
          {str:"Hello? This is Sung", exp: "Hello?"},
          {str:"Hello.co? This is Sung", exp: "Hello.co?"},
          {str:"Hello.co This is Sung", exp: "Hello.co This is Sung"},
          {str:"Hello.co \nThis is Sung", exp: "Hello.co \n"},

          {str:"Hello?? This is Sung", exp: "Hello??"},
        ];

        for (var i in testInputs) {
          var results = scope.getFirstAndRestSentence(testInputs[i].str);
          expect(results[0]).toEqual(testInputs[i].exp);
        }
      });

      it('RoomId', function() {
        location.path('/new/path');

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location
        });

        expect(scope.roomId).toBe("new");
      });

      it('toTop Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

        scope.toTop();
        expect(window.scrollX).toBe(0);
        expect(window.scrollY).toBe(0);
      });
	  
		
		it('addTodo testing', function() {
			var ctrl = controller('TodoCtrl', {
			$scope: scope,
         		 $location: location,
          		$firebaseArray: firebaseArray,
          		$sce: sce,
          		$localStorage: localStorage,
          		$window: window
			});

		scope.input = {
			wholeMsg: ''
		};
		scope.addTodo();
		scope.$digest();

		scope.input = {
			wholeMsg: 'something'
		};
		scope.addTodo();
		scope.$digest();
		
		scope.input = {
			wholeMsg: 'sss',
			category: 'Lecture'
		};
		scope.addTodo();
		scope.$digest();
		});

		it('watchCollection test', function() {
			var ctrl = controller('TodoCtrl', {
				$scope: scope,
			    $location: location,
			    $firebaseArray: firebaseArray,
			    $sce: sce,
			    $localStorage: localStorage,
			    $window: window
			});

			/*Testing valid input*/
			var newTodo = "Test? Test.";
			var firstAndLast = scope.getFirstAndRestSentence(newTodo);
			var head = firstAndLast[0];
			var desc = firstAndLast[1];

			scope.todos[0] ={
				wholeMsg: newTodo,
			head: head,
			headLastChar: head.slice(-1),
			desc: desc,
			linkedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
			completed: false,
			timestamp: new Date().getTime(),
			tags: "...",
			echo: 0,
			order: 0
			};

			/*Testing valid input as completed*/
			var newTodo = "Complete? Test Complete.";
			var firstAndLast = scope.getFirstAndRestSentence(newTodo);
			var head = firstAndLast[0];
			var desc = firstAndLast[1];

			scope.todos[1] ={
				wholeMsg: newTodo,
				head: head,
				headLastChar: head.slice(-1),
				desc: desc,
				linkedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
				completed: true,
				timestamp: new Date().getTime(),
				tags: "...",
				echo: 0,
				order: 0
			};

			/*Testing invalid input*/
			var newTodo = "";
			var firstAndLast = scope.getFirstAndRestSentence(newTodo);
			var head = firstAndLast[0];
			var desc = firstAndLast[1];

			scope.todos[2] ={
				wholeMsg: newTodo,
				head: head,
				headLastChar: head.slice(-1),
				desc: desc,
				linkedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
				completed: false,
				timestamp: new Date().getTime(),
				tags: "...",
				echo: 0,
				order: 0
			};

			scope.$watchCollection;
			scope.$digest();
			expect(scope.totalCount).toBe(2);
			expect(scope.remainingCount).toBe(1);



		});

		it('clearCompleted test', function() {
			var ctrl = controller('TodoCtrl', {
				$scope: scope,
			    $location: location,
			    $firebaseArray: firebaseArray,
			    $sce: sce,
			    $localStorage: localStorage,
			    $window: window
			});

			/*Testing valid input*/
			var newTodo = "Test? Test.";
			var firstAndLast = scope.getFirstAndRestSentence(newTodo);
			var head = firstAndLast[0];
			var desc = firstAndLast[1];

			scope.todos[0] ={
				wholeMsg: newTodo,
			head: head,
			headLastChar: head.slice(-1),
			desc: desc,
			linkedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
			completed: false,
			timestamp: new Date().getTime(),
			tags: "...",
			echo: 0,
			order: 0
			};

			/*Testing valid input as completed*/
			var newTodo = "Complete? Test Complete.";
			var firstAndLast = scope.getFirstAndRestSentence(newTodo);
			var head = firstAndLast[0];
			var desc = firstAndLast[1];

			scope.todos[1] ={
				wholeMsg: newTodo,
				head: head,
				headLastChar: head.slice(-1),
				desc: desc,
				linkedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
				completed: true,
				timestamp: new Date().getTime(),
				tags: "...",
				echo: 0,
				order: 0
			};

			/* The removeTodo also doesnt work, problem with firebase? */
			spyOn(scope, 'removeTodo');
			scope.clearCompletedTodos();
			expect(scope.removeTodo).toHaveBeenCalled();



		});

		it('increaseMax Testing', function() {
			var ctrl = controller('TodoCtrl', {
				$scope: scope,
			    $location: location,
			    $firebaseArray: firebaseArray,
			    $sce: sce,
			    $localStorage: localStorage,
			    $window: window
			});


			scope.maxQuestion = 10;
			scope.totalCount = 12;
			scope.increaseMax();
			expect(scope.maxQuestion).toEqual(20);

			scope.increaseMax();
			expect(scope.maxQuestion).toEqual(12);

		});
	
    });
  });
