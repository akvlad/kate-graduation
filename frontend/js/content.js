
listModule.controller('contentCtrl', ['$scope', '$routeParams', '$http', '$sce', function ($scope, $routeParams, $http, $sce)
{
    $http.get("/cnt/"+$routeParams.cntId+"/"+$routeParams.pId+".json").success(
        function(data)
        {
            $scope.content = data;
            $scope.content.content = $sce.trustAsHtml(data.content);
            angular.forEach($scope.content.topPanelButtons, function (v){
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

            });
        }
    );
}]);
