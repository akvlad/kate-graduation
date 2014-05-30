var listModule = angular.module('MultMathModule',['ngRoute', 'RecursionHelper','uiSlider', 'fundoo.services', 'ngStorage', 'ui.bootstrap']);

listModule.config(function($routeProvider, $locationProvider) {
    $routeProvider.
        when("/content/:cntId/:pId",{templateUrl: "/frontend/content.html",controller: 'contentCtrl'}).
        when("/contents/:cntId",{templateUrl: "/frontend/list.html",controller: listCtrl}).
        when("/tasks/:taskId/:pageId", {templateUrl: "/frontend/tasks.html", controller: 'tasksCtrl'}).
        otherwise({"redirectTo": "/"});
    $locationProvider.html5Mode(true);
});

function listPart(data)
{
    angular.forEach(data, function(item){
        item.className = item.type=='par' ? 'list' : 'bookList';
        listPart(item.contents);
    });
}

function defineButton(v)
{
    v.currentImageUrl = v.pressed ? v.pressedIcon : v.unpressedIcon;
    if(!v.pressed)
    {
        v.onMouseDown = function(){v.currentImageUrl = v.pressedIcon;}
        v.onMouseUp = function(){v.currentImageUrl = v.unpressedIcon;}
    }
    else
    {
        v.onMouseDown = function(){return;}
        v.onMouseUp = function(){return;}
    }
}


function listCtrl($http, $scope, $routeParams)
{
    $http.get('/cnts/'+$routeParams.cntId+'/contents.json').success(
        function(data)
        {
            listPart(data.contents.contents);
            $scope.data = data;
            angular.forEach($scope.data.topPanelButtons, defineButton);
        });


}

listModule.directive("navbutton", function(RecursionHelper) {
    return {
        restrict: "E",
        scope: {item: '='},
        replace: true,
        template:
            '<a href="{{item.href}}" ng-mousedown = "item.onMouseDown()" ng-mouseup = "item.onMouseUp()">\
                <img ng-src = "{{item.currentImageUrl}}" alt = "image"></a>',
        compile: function(element) {
            // Use the compile function from the RecursionHelper,
            // And return the linking function(s) which it returns
            return RecursionHelper.compile(element);
        }
    };
});

listModule.directive("tree", function(RecursionHelper) {
    return {
        restrict: "E",
        scope: {family: '='},
        replace: true,
        template:
                '<ul>' +
                '<li ng-repeat="item in family"><a href="{{item.href}}" class = "{{item.className}}">&nbsp {{item.name}}</a>'+
                    '<tree family="item.contents"></tree>' +
                '</li>' +
                '</ul>',
        compile: function(element) {
            // Use the compile function from the RecursionHelper,
            // And return the linking function(s) which it returns
            return RecursionHelper.compile(element);
        }
    };
});

