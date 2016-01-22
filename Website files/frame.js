// JS for worksheet

// Enable kinetic drag to scroll
$('body').kinetic({
    filterTarget: function (target, e) {
        return !($(target).hasClass("node")|$(target).hasID("menu"));
    }
});

// Import list of nodes
$.getScript("functions.js")

// Set unique node id
var uid = 0

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
    items = NodeSelect(userinput, functions);
    $('#menubuttonsdiv').empty();
    for (var i = 0; i < items.length; i++) {
        $('#menubuttonsdiv').append("<button class=\"menuitem\" onclick=\"createNode(" + items[i].id + ")\")>" + items[i].name + "</button><br>");
    }
}

// On menu item click, create draggable node. Node id is given as argument
function createNode (id) {
    node = lookup[id];
    $('body').append("<div class=\"node\" id=\"node" + toString(uid) + "\">" + node.name + "</div>");
}

// Menu custom element
var MenuElementProto = Object.create(HTMLDivElement.prototype);
MenuElementProto.attachedCallback = function () {
    $(this).append("<b>Insert</b>");
    $(this).append("<input type=\"text\" oninput=\"UpdateList()\" id=\"menuinput\">");
    $(this).append("<div id=\"menubuttonsdiv\"></div>")
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
