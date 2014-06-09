/*
 * Директива таба "обучение"
 * Использует подгружаемый html,
 * teaching.html
 */
 listModule.directive("teaching",
function()
{
    return {
        restrict: "E",
        scope: {
            data: "="
        },
        replace: true,
        templateUrl: "/frontend/directives/teaching.html"
    }
});
