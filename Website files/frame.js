// JS for worksheet

// Enable kinetic drag to scroll
$('body').kinetic({
    filterTarget: function (target, e) {
        return !($(target).hasClass("node"));
    }
});

// Import list of nodes
$.getScript("functions.js")

// On right click, open menu
$('body').mousedown(function (event) {
    if (event.which === 3) {
        $('#menu').remove();
        var mousex = event.pageX;
        var mousey = event.pageY;
        $("body").append("<div is=\"x-menu\" id=\"menu\" style=\"left:" + mousex + "px;top:" + mousey + "px;\"></div>");
    }
});

// Function to update the list whenever input is detected
UpdateList = function () {
    userinput = $('#menuinput').val();
    $('#menu').append(userinput);
}

// Menu custom element
var MenuElementProto = Object.create(HTMLDivElement.prototype);
MenuElementProto.attachedCallback = function () {
    $(this).append("<b>Insert</b>");
    $(this).append("<input type=\"text\" oninput=\"UpdateList()\" id=\"menuinput\">");
    this.style.overflow="hidden";
    UpdateList();
};
var MenuElement = document.registerElement('x-menu', {
    prototype: MenuElementProto,
    extends: 'div'
});

// Menu item custom element
var MenuItemProto = Object.create(HTMLButtonElement.prototype);
Object.defineProperty(MenuItemProto, 'key', { writeable : true });
var MenuItem = document.registerElement('menu-item', { 
    prototype: MenuItemProto,
    extends: 'button'
});
