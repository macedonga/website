const shortify = document.getElementById('short');
const reload = document.getElementById('reload');
const copy = document.getElementById('copy');

function sendData(data) {
    const XHR = new XMLHttpRequest();
    const JsonData = JSON.stringify(data);
    XHR.onload = function() {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(XHR.responseText);
            document.getElementById("error").style.visibility = "hidden";
            const short = "https://s.mcdn.ga/" + json.slug;
            document.getElementById("short-url").value = short;
            document.getElementById("shortify").style.display = "none";
            document.getElementById("success").style.display = "block";
        } else if (this.status == 429) {
            setError("Too many requests! Try again later");
        } else if (this.status == 500) {
            var json = JSON.parse(XHR.responseText);
            if (json.num == "001") {
                setError("Slug already in use");
            } else if (json.num == "002") {
                setError("No need to shortify an already shortified link");
            } else {
                setError("Invalid link!");
            }
        } else {
            setError("Unknown error");
        }
    };
    XHR.open('POST', 'https://s.mcdn.ga/url');
    XHR.setRequestHeader('Content-Type', 'application/json');
    XHR.send(JsonData);
}

shortify.addEventListener('click', function() {
    var data;
    if (document.getElementById("slug").value != "" && document.getElementById("url").value != "") {
        data = { url: document.getElementById("url").value, slug: document.getElementById("slug").value };
        sendData(data);
    } else if (document.getElementById("url").value != "") {
        data = { url: document.getElementById("url").value };
        sendData(data);
    } else if (document.getElementById("url").value == "") {
        setError("Missing URL!");
    }
});

reload.addEventListener('click', function() { location.reload(); });

copy.addEventListener('click', function() {
    var copyText = document.getElementById("short-url");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
});

function setError(error) {
    document.getElementById("error").style.visibility = "visible";
    document.getElementById("error-text").innerHTML = error;
    document.body.classList.add("shake");
    setTimeout(() => {
        document.body.classList.remove("shake");
    }, 820);
}