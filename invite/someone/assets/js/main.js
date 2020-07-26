$(function() {
    setTimeout(
        function() {
            $(".loader").fadeOut(500);
            $(".content").fadeIn(500);
        }, 1000);
});

function redirect(link) {
    $(location).attr('href', link);
}
$('.animated').html(function(i, html) {
    var chars = $.trim(html).split("");
    return '<span>' + chars.join('</span><span>') + '</span>';
});