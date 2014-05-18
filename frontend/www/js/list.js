var listModule = angular.module('listModule',['ngRoute', 'RecursionHelper']);

listModule.config(function($routeProvider) {
    $routeProvider.
        otherwise({controller:listCtrl});
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
