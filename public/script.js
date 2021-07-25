var title = document.title;
window.onblur = function () { document.title = "Başka birimi var?"; };
window.onfocus = function () { document.title = title; };
