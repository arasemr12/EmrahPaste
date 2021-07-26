var title = document.title;
window.onblur = function () { document.title = "Başka birimi var?"; };
window.onfocus = function () { document.title = title; };

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip({trigger:"click"});
})

function copy(){
    document.querySelector("#paste").select();
    document.execCommand("copy");
}