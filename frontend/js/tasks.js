/*
 * Контроллер задач
 */
listModule.controller('tasksCtrl',['$scope', '$routeParams', '$http', '$location', '$localStorage', 'createDialog',
function($scope, $routeParams, $http, $location,$localStorage, createDialog){
    if(typeof($localStorage.solvedTasks) == 'undefined' ) $localStorage.solvedTasks = [];
    $http.get("/tsks/"+$routeParams.taskId+"/"+$routeParams.pageId+".json").success(
        function(data)
        {
            $scope.data = data;
            angular.forEach($scope.data.topPanelButtons, defineButton);
            $scope.bottomPanel = getBottomPanel($scope.data);
            $scope.page = $scope.data.pageId;
            $scope.pageFormatting = function(value) { return value.toString() + ":" + $scope.data.pages }
            $scope.sliderRedirect = function() {
                $scope.$apply(function() {
                    $location.path($scope.data.pagesUrl[$scope.page-1]);
                });
            };
            var taskNum = 1;
            // Подготовка задачи к выводу
            // Нумерация, обработка решенных задач и т.д.
            angular.forEach($scope.data.content, function(v){
                if(v.type=="task")
                {
                    v.taskN=taskNum;
                    ++taskNum;
                    v.solvedClass = ($localStorage.solvedTasks.indexOf(v.id) == -1) ? '' : '-solved';
                    angular.forEach(v.tabs, processTabs)
                }
                else {
                    taskNum = 1;
                }
            });
        }
    );

    //Аналогично content.js
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
                "content": $scope.data
            }
        )
    };
    /*
     * Обработка функии редиректа по
     * некоторым табам (в частности таб "Теория")
     */
    $scope.redir =function (tab)
    {
        if(tab.type != 'link') return;
        $location.path(tab.content);
    }

    /*
     * Обработка решенной задачи
     * (клик на зеленую галочку)
     */
    $scope.solveTask = function(task)
    {
        if($localStorage.solvedTasks.indexOf(task.id) == -1)
            $localStorage.solvedTasks.push(task.id);
        task.solvedClass="-solved";
    }

}]);
/*
 * Таб "Обучение", перемешивание вариантов ответов.
 */
function shuffleAnswers(answers)
{
    angular.forEach(answers, function(ans){
        ans.randIndex = Math.random();
    });
    answers.sort(function(ans1, ans2) {
        return ans1.randIndex - ans2.randIndex;
    });
    angular.forEach(answers, function(ans,i){
        ans.randIndex = i;
    });
}
/*
 * обработка таба "обучение".
 * обработчик правильного/неправильного ответа
 */
function processTabs(tab)
{
    if(tab.type!="teaching") return;
    tab.currentStep = {"id" :1};
    angular.forEach(tab.steps,function(step,i){
        step.comparator = function(ans)
        {
            return ans.randIndex < 3;
        }
        step.onAnsClick=function(ans)
        {
            if(step.rightAns == ans.id)
            {
                if(tab.steps.length == i+1)
                {
                    tab.showAnswers.shown = tab.showAnswers.right;
                    tab.showSolvations.shown = tab.showSolvations.right;
                }
                else {
                    tab.currentStep.id++;
                }
                alert('Ответ правильный.');
            }
            else {
                alert('Ответ неправильный');
                shuffleAnswers(step.answers);
            }
        }
        step.updateAnswers = function()
        {
            shuffleAnswers(step.answers);
        }
        shuffleAnswers(step.answers);
    });
}
/*
 * Директива заголовка задания
 */
listModule.directive('header', function(){
    return {
        restrict: "E",
        transclude: true,
        template: '<p class="task-heading" ng-transclude></p>'
    }
});
/*
 * Директива текста задания
 */
listModule.directive('task', function(){
    return {
        restrict: "E",
        transclude: true,
        template: '<p class="task-content" ng-transclude></p>'
    }
});

