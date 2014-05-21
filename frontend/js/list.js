var listModule = angular.module('MultMathModule',['ngRoute', 'RecursionHelper']);

listModule.config(function($routeProvider, $locationProvider) {
    $routeProvider.
        when("/content/:cntId",{templateUrl: "/frontend/content.html",controller: contentCtrl}).
        otherwise({templateUrl: "/frontend/list.html",controller:listCtrl});
    $locationProvider.html5Mode(true);
});

function listPart(data)
{
    angular.forEach(data, function(item){
        item.className = item.type=='par' ? 'list' : 'bookList';
        listPart(item.contents);
    });
}


function listCtrl($http, $scope)
{
    $http.get('/contents.json').success(
        function(data)
        {
            listPart(data);
            $scope.contents = data;
        });
    $scope.vol= {"id": 1};
    $scope.volFilter=function(actual, expected)
    {
        return actual==expected;
    }
    $scope.volClick=function(item)
    {
        $scope.vol = {"id":item.id};
        return false;
    }
}

listModule.directive("tree", function(RecursionHelper) {
    return {
        restrict: "E",
        scope: {family: '='},
        replace: true,
        template:
                '<ul>' +
                '<li ng-repeat="item in family"><a href="#" class = "{{item.className}}">&nbsp {{item.name}}</a>'+
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

function contentCtrl($scope, $routeParams, $http, $sce)
    {
        $http.get("/cnt/"+$routeParams.cntId+"/content.json").success(
            function(data)
            {
                $scope.content = $sce.trustAsHtml(data.content);
            }
        );
    };

