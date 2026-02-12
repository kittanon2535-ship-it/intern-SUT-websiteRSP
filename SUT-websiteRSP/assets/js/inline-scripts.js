/**
 * @param {Event} event 
 * @param {string} dropdownId 
 */
function toggleDropdown(event, dropdownId) {
    event.preventDefault();

    document.querySelectorAll('.dropdown-content').forEach(function (el) {
        if (el.id !== dropdownId) {
            el.classList.remove('show');
        }
    });

    document.getElementById(dropdownId).classList.toggle('show');
}

window.onclick = function (event) {
    const modal = document.getElementById("imageModal");
    if (event.target == modal) {
        if (modal) {
            modal.style.display = "none";
        }
    }
    if (!event.target.matches('.dropdown a') && !event.target.closest('.dropdown')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}