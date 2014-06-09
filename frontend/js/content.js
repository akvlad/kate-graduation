/*
 * Контроллер вывода содержания запрошенной страницы
 *
 */
listModule.controller('contentCtrl', ['$scope', '$routeParams', '$http', '$sce', '$location', 'createDialog',
function ($scope, $routeParams, $http, $sce, $location, createDialog)
{
    // запрос json
    $http.get("/cnt/"+$routeParams.cntId+"/"+$routeParams.pId+".json").success(
        function(data)
        {
            $scope.content = data;
            angular.forEach($scope.content.topPanelButtons, defineButton);
            $scope.bottomPanel = getBottomPanel($scope.content);
            $scope.page = $scope.content.pageId;
            $scope.pageFormatting = function(value) { return value.toString() + ":" + $scope.content.pages }
            $scope.sliderRedirect = function() {
                $scope.$apply(function() { $location.path($scope.content.pagesUrl[$scope.page-1]); });
            };
        }
    );
    // вывод диалогового окна правления закладками
    $scope.onBkmrkClick=function()
    {
        createDialog('/frontend/bookmark_popup.html',
            {
                id: 'bookmark-popup',
                title: 'Закладки',
                backdrop: true,
                controller: 'bookmarkCtrl',
                footerTemplate: '<button class="btn" id="remove-bookmarks" ng-click="removeBookmarks()">Удалить</button>\
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
/*
 * Контроллер диалогового окна закладок
 */
listModule.controller('bookmarkCtrl', ['$scope', '$location', '$localStorage', 'content',
    function($scope, $location, $localStorage, content)
{
    // Достаем закладки из локального хранилища
    $scope.content = content;
    $scope.storage = $localStorage;
    if(!$scope.storage.bookmarks) $scope.storage.bookmarks = [];
    angular.forEach($scope.storage.bookmarks, function($v) {$v.checked = false;});
    /*
     * Функция удаления закладки
     */
    $scope.removeBookmark = function(bookmark)
    {
        angular.forEach($scope.storage.bookmarks, function($v, $i) {
            if(bookmark.id == v.id)
            {
                $scope.storage.bookmarks.splice($i, 1);
            }
        });
    };
    /*
     * Добавление закладки
     */
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
    /*
     * Удаление нескольких закладок
     */
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
/*
 * Инициализация нижней панели инструментов
 * включение/выключение кнопок
 */
function getBottomPanel($content)
{
    return {
        "contents": ($content.contentsLink == null ? "disabled" : ""),
        "prevPage": ($content.prevPageUrl == null ? "disabled" : ""),
        "nextPage": ($content.nextPageUrl == null ? "disabled" : ""),
        "firstPage": ($content.pageId == 1 ? "disabled" : ""),
        "lastPage": ($content.pageId == $content.pages ? "disabled" : ""),
        "undo": (window.history.length == 0 ? "disabled" : "")
    }
}
/*
 * Директива-атрибут dynamic
 * позволяет динамически привязывать html с директивами angularJS
 * к html-тегам с корректной их компиляцией.
 * В частности необходим для директивы <formula>
 */
listModule.directive('dynamic', function ($compile) {
    return {
        restrict: 'A',
        replace: true,
        link: function ($scope, ele, attrs) {
            $scope.$watch(attrs.dynamic, function(html) {
                ele.html(html);
                $compile(ele.contents())($scope);
            });
        }
    };
});
/*
 * Динамическая компиляция формул.
 * Каждая формула (помимо LaTEX-нотации оборацивается в
 * тег <formula>
 */
listModule.directive("formula", function() {
    return {
        restrict: "E",
        replace: false,
        template: '',
        compile: function() {
            return {
                post:
                    function() {
                        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                    }
            }
        }
    }
});
