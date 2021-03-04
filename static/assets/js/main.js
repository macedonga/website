const socket = io();

$('h2').each(function () {
    $(this).prepend(`<button id=\"\" onclick=\"'location.href="#${$(this).attr('id')}"'\" class=\"fas fa-link\"></button>`);
});

$('h3').each(function () {
    $(this).prepend(`<button id=\"\" onclick=\"'location.href="#${$(this).attr('id')}"'\" class=\"fas fa-link\"></button>`);
});

socket.on("music", data => {
    $(".spotify-image").attr("src", data.image || "assets/images/placeholdermusic.png");
    $(".spotify-name").text(data.song_name || "Nothing");
    $(".spotify-artist").text(data.artist || "‎Nobody");
    spotify(data.duration_ms || 1, data.progress_ms || 1);
});

socket.on("game", data => {
    $(".game-image").attr("src", data.game.imageLink || "assets/images/placeholdergame.png");
    $(".game-name").text(data.game.name || "Nothing");
    $(".game-artist").text(data.game.desc || "");
});