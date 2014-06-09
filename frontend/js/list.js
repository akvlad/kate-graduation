var listModule = angular.module('MultMathModule',['ngRoute', 'RecursionHelper','uiSlider', 'fundoo.services', 'ngStorage', 'ui.bootstrap']);
// Конфигурация приложения в зависимости от запрошенного url
listModule.config(function($routeProvider, $locationProvider) {
    $routeProvider.
        when("/content/:cntId/:pId",{templateUrl: "/frontend/content.html",controller: 'contentCtrl'}).
        when("/contents/:cntId",{templateUrl: "/frontend/list.html",controller: listCtrl}).
        when("/tasks/:taskId/:pageId", {templateUrl: "/frontend/tasks.html", controller: 'tasksCtrl'}).
        otherwise({"redirectTo": "/"});
    $locationProvider.html5Mode(true);
});
/*
 * Присваивание классов узлам списка
 * проходит рекурсивно по вложенным спискам (том - глава - пункт ...)
 * @param {object} data объект contents, возвращенный из json
 */
function listPart(data)
{
    angular.forEach(data, function(item){
        item.className = item.type=='par' ? 'list' : 'bookList';
        listPart(item.contents);
    });
}
/*
 * Подготовка кнопки верхнего меню
 * обработчики для кнопки, корректные иконки.
 * @param {object} v оъект, восстановленный из json-описания кнопки
 */
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

/*
 * Контроллер обработки оглавления (/contents/...)
 * обрабатывает json оглавления запрошенного тома,
 * готовит оглавление к выводу в браузер
 */
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
/*
 * Директива кнопки на верхней панели (навигации)
 * ПРимер кнопки - 1 том, 2 том, верхняя панель в содержании книги
 */
listModule.directive("navbutton", function(RecursionHelper) {
    return {
        restrict: "E",
        scope: {item: '='},
        replace: true,
        template:
            '<a href="{{item.href}}" ng-mousedown = "item.onMouseDown()" ng-mouseup = "item.onMouseUp()">\
                <img ng-src = "{{item.currentImageUrl}}" alt = "image"></a>',
        compile: function(element) {
            return RecursionHelper.compile(element);
        }
    };
});
/*
 * Директива рекурсивного вывода вложенных списков оглавления тома
 */
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

