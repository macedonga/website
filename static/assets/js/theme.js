function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}

function toggleTheme() {
    if (localStorage.getItem('theme') === 'amoled') {
        setTheme('light');
    } else {
        setTheme('amoled');
    }
}

(function() {
    if (localStorage.getItem('theme') === 'light') {
        setTheme('light');
    } else {
        setTheme('amoled');
    }
})();