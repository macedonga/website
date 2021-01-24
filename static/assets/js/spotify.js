const spotify = (duration, progress) => {
    duration = Number(duration);
    progress = Number(progress);

    const update = () => {
        $(".bar").css("width", perc(duration, progress) + "%");
        progress += 1000;
        if (duration <= progress)
            clearInterval(interval);
    };

    var interval = setInterval(update, 1000);
};

const perc = (tot, num) => {
    return ((num / tot) * 100).toFixed(0);
};