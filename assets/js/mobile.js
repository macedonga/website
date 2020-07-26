$(function() {
    setTimeout(
        function() {
            $(".loader").fadeOut(500);
            $(".content").fadeIn(500);
        }, 1000);
});

$('.animated').html(function(i, html) {
    var chars = $.trim(html).split("");
    return '<span>' + chars.join('</span><span>') + '</span>';
});