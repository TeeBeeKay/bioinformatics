// JS for worksheet

// Enable kinetic drag to scroll
$('body').kinetic({
    filterTarget: function (target, e) {
        return !($(target).hasClass("menu") || $(target).hasClass("node") || $(target).hasClass("notkinetic"));
    }
});

// Import list of nodes
$.getScript("functions.js");

// Set unique node id
var uid = 0;
var mousex, mousey = 0;

// Line constructor
function constructLine(startx, starty, endx, endy) {
    var midx = (startx + endx) / 2;
    var midy = (starty + endy) / 2;
    var controlpoint1x = (midx - startx) * 0.8 + startx;
    var controlpoint1y = (midy - starty) * 0.2 + starty;
    var controlpoint2x = (endx - midx) * 0.2 + midx;
    var controlpoint2y = (endy - midy) * 0.8 + midy;
    var startpoint = "M " + startx + " " + starty + "\n";
    var midpoint = "Q " + controlpoint1x + " " + controlpoint1y + " " + midx + " " + midy + "\n";
    var endpoint = "Q " + controlpoint2x + " " + controlpoint2y + " " + endx + " " + endy + "\n";
    var d = startpoint + midpoint + endpoint;
    return d;
}

// Socket constructor
function constructSocket(io, id) {

}

function createWire(event, parent) {
    line = document.createElementNS("http://www.w3.org/2000/svg","path");
    line.setAttributeNS(null, "class", "cable");
    line.setAttributeNS(null, "d", constructLine(event.pageX, event.pageY, 600, 600));
    line.setAttributeNS(null, "stroke", "blue");
    line.setAttributeNS(null, "stroke-width", "2");
    line.setAttributeNS(null, "fill", "none");
    document.getElementById("svgcanvas").appendChild(line);
}

// On right click, open menu
$('body').mousedown(function (event) {
    if (event.which === 3) {
        $('#menu').remove();
        mousex = event.pageX;
        mousey = event.pageY;
        $("body").append("<div is=\"x-menu\" id=\"menu\" class=\"menu\" style=\"left:" + mousex + "px;top:" + mousey + "px;\"></div>");
        document.getElementById("curve").setAttribute("d", constructLine(0,0,mousex,mousey));
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
    $('#menu').remove();
    $('body').append("<div class=\"node\" id=\"node" + uid + "\" style=\"left:" + mousex + "px;top:" + mousey + "px;\">" + node.name + "<br></div>");
    $('#node'+ uid).draggable();
    $('#node'+ uid).append("<button class=\"socket notkinetic\" parent=\"" + uid + "\" onclick=\"createWire(event, parent)\"></button>");
    uid += 1;
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
