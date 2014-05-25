listModule.controller('contentCtrl', ['$scope', '$routeParams', '$http', '$sce', '$location', 'createDialog',
function ($scope, $routeParams, $http, $sce, $location, createDialog)
{
    $http.get("/cnt/"+$routeParams.cntId+"/"+$routeParams.pId+".json").success(
        function(data)
        {
            $scope.content = data;
            $scope.content.content = $sce.trustAsHtml(data.content);
            angular.forEach($scope.content.topPanelButtons, defineButton);
            $scope.bottomPanel = getBottomPanel($scope);
            $scope.page = $scope.content.pageId;
            $scope.pageFormatting = function(value) { return value.toString() + ":" + $scope.content.pages }
            $scope.sliderRedirect = function() {
                $scope.$apply(function() { $location.path($scope.content.pagesUrl[$scope.page-1]); });
            };
        }
    );

    $scope.onBkmrkClick=function()
    {
        createDialog('/frontend/bookmark_popup.html',
            {
                id: 'bookmark-popup',
                title: 'Закладки',
                backdrop: true,
                controller: 'bookmarkCtrl',
                footerTemplate: '    <button class="btn" id="remove-bookmarks" ng-click="removeBookmarks()">Удалить</button>\
                    <button class="btn" id="add-bookmark" ng-click="addBookmark()">Добавить</button>\
                    <button class="btn btn-primary ng-binding" ng-click="$modalSuccess()">Ok</button>',
                success: {label: 'Ok'}

            },
            {
                "content": $scope.content
            }
        )
    };

}]);

listModule.controller('bookmarkCtrl', ['$scope', '$location', '$localStorage', 'content', function($scope, $location, $localStorage, content)
{
    $scope.content = content;
    $scope.storage = $localStorage;
    if(!$scope.storage.bookmarks) $scope.storage.bookmarks = [];
    angular.forEach($scope.storage.bookmarks, function($v) {$v.checked = false;});
    $scope.removeBookmark = function(bookmark)
    {
        angular.forEach($scope.storage.bookmarks, function($v, $i) {
            if(bookmark.id == v.id)
            {
                $scope.storage.bookmarks.splice($i, 1);
            }
        });
    };
    $scope.addBookmark = function()
    {
        var maxId = $scope.storage.bookmarks.length > 0 ? $scope.storage.bookmarks[$scope.storage.bookmarks.length-1].id : 0;

        $scope.storage.bookmarks.push(
            {
                "path":$location.path(),
                "id":maxId+1,
                "name": $scope.content.title + ", "+$scope.content.pageId+"/"+$scope.content.pages,
                "checked":false
            });
    }
    $scope.removeBookmarks = function()
    {
        var length = $scope.storage.bookmarks.length;
        for(var i = length-1; i>=0; --i)
        {
            if($scope.storage.bookmarks[i].checked)
                $scope.storage.bookmarks.splice(i,1);
        }
    }
}
]);

function getBottomPanel($scope)
{
    return {
        "contents": ($scope.content.contentsLink == null ? "disabled" : ""),
        "prevPage": ($scope.content.prevPageUrl == null ? "disabled" : ""),
        "nextPage": ($scope.content.nextPageUrl == null ? "disabled" : ""),
        "firstPage": ($scope.content.pageId == 1 ? "disabled" : ""),
        "lastPage": ($scope.content.pageId == $scope.content.pages ? "disabled" : ""),
        "undo": (window.history.length == 0 ? "disabled" : "")
    }
}
