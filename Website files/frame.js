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
var global = new Object();
global.uid = 0;
global.mousex = 0;
global.mousey = 0;
global.cable;
global.pos;
global.selected;
global.drawing = false;

var nodes = new Object();
nodes.nodes = [];
nodes.addnode = function(id, x, y) {
    type = lookup[id].name
    var node = {type: type, id: global.uid, inputlinks: [], outputlinks: []};
    this.nodes.push(node);
    if (x == undefined) {
        x = global.mousex
    }    
    if (y == undefined) {
        y = global.mousey
    }
    createNode(id, x, y);
}

nodes.removenode = function(uid){
    nodes.nodes[uid].type = -1;
    for(var x = 0; x < this.nodes[uid].inputlinks.length; x++){
        localnode = this.nodes[uid];
        var connectednode = this.nodes[localnode.inputlinks[x].node]
        var toremove = []
        for (var y = connectednode.outputlinks.length - 1; y > -1; y--) {
            if (connectednode.outputlinks[y].node == uid) {
                toremove.push(y);
            }
        }
        for (var linktoremove = 0; linktoremove < toremove.length; linktoremove++){
            connectednode.outputlinks.splice([toremove[linktoremove]], 1)
        }
        // Remove links in node objects and then delete paths
    }
    for(var x = 0; x < this.nodes[uid].outputlinks.length; x++){
        localnode = this.nodes[uid];
        var connectednode = this.nodes[localnode.outputlinks[x].node]
        var toremove = []
        for (var y = connectednode.inputlinks.length - 1; y > -1; y--) {
            if (connectednode.inputlinks[y].node == uid) {
                toremove.push(y);
            }
        }
        for (var linktoremove = 0; linktoremove < toremove.length; linktoremove++){
            connectednode.inputlinks.splice([toremove[linktoremove]], 1)
        }
        // Remove links in node objects and then delete paths
    }
    delete nodes.nodes[uid];
    var removednode = document.getElementById('node' + uid);
    removednode.parentNode.removeChild(removednode);
    paths = document.getElementById('svgcanvas').childNodes
    removedpaths = []
    for (var x = 1; x < paths.length; x++) {
        if (paths[x].getAttribute('parent').split(' ')[0] == 'node' + uid || paths[x].getAttribute('child').split(' ')[0] == 'node' + uid) {
            removedpaths.push(paths[x])
        }
    }
    for (var x = 0; x < removedpaths.length; x++) {
        document.getElementById('svgcanvas').removeChild(removedpaths[x])
    }
}

function getElementPosition (element) {
    bodypos = document.body.getBoundingClientRect();
    elepos = element.getBoundingClientRect();
    toppos = elepos.top - bodypos.top + 8;
    leftpos = elepos.left - bodypos.left + 8;
    return [leftpos, toppos];
}

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
    if(!global.drawing){
        global.selected = parent;
        global.pos = getElementPosition(event.target);
        global.pos[0] += 5;
        global.pos[1] += 5;
        line = document.createElementNS("http://www.w3.org/2000/svg","path");
        line.setAttributeNS(null, "class", "cable drawing");
        line.setAttributeNS(null, "d", constructLine(global.pos[0], global.pos[1], global.pos[0], global.pos[1]));
        line.setAttributeNS(null, "parent", parent.split(' ')[0] + ' ' + parent.split(' ')[1]);
        document.getElementById("svgcanvas").appendChild(line);
        global.cable = line;
        document.addEventListener('mousemove', linkCable);
        global.drawing = true;
    }
}

function moveWire(wire, start, end) {
    wire.setAttributeNS(null, "d", constructLine(start.x, start.y, end.x, end.y))
}

// On right click, open menu
$('body').mousedown(function (event) {
    if (event.which === 3) {
        global.mousex = event.pageX;
        global.mousey = event.pageY;
        createMenu(event.pageX, event.pageY);
    }
});

function createMenu(x, y, input) {
    $('#menu').remove();
    $("body").append("<div is=\"x-menu\" id=\"menu\" class=\"menu\" input=\"" + input + "\" style=\"left: " + x + "px;top: " + y + "px;\"></div>");
}

// Function to update the list whenever input is detected
UpdateList = function () {
    userinput = $('#menuinput').val();
    items = NodeSelect(userinput, functions);
    $('#menubuttonsdiv').empty();
    for (var i = 0; i < items.length; i++) {
        $('#menubuttonsdiv').append("<button class=\"menuitem\" onclick=\"nodes.addnode(" + items[i].id + ")\")>" + items[i].name + "</button><br>");
    }
}

// On menu item click, create draggable node. Node id is given as argument
function createNode (id, x, y) {
    node = lookup[id];
    var link = document.getElementById('menu').getAttribute('input');
    $('#menu').remove();
    $('#inner').append("<div class=\"node notkinetic\" id=\"node" + global.uid + "\" style=\"left:" + x + "px;top:" + y + "px;\"></div>");
    $('#node'+ global.uid).draggable({
        drag: function(event, ui) {
            // Get properties of node
            var node = ui.helper[0];
            var nodeid = node.attributes.id.nodeValue;
            var nodeidnum = +nodeid.match(/\d+$/)[0];
            var inputs = node.childNodes[1].childNodes;
            var outputs = node.childNodes[2].childNodes;
            var inputlinks = nodes.nodes[nodeidnum].inputlinks
            var outputlinks = nodes.nodes[nodeidnum].outputlinks
            for (var x = 0; x < inputlinks.length; x++) {
                var localconnection = 'node' + nodeidnum + ' ' + inputlinks[x].input;
                var remoteconnection = 'node' + inputlinks[x].node + ' ' + inputlinks[x].output;
                paths = document.getElementById('svgcanvas').childNodes;
                for (var i = 1; i < paths.length; i++) {
                    if(paths[i].getAttribute('parent') == remoteconnection && paths[i].getAttribute('child') == localconnection){
                        var localpos = getElementPosition(inputs[inputlinks[x].input * 2]);
                        var remoteelement = document.getElementById('node' + inputlinks[x].node)
                        var remotepos = getElementPosition(remoteelement.querySelector('.outputs').querySelector('[ident = \"' + inputlinks[x].output + '\"]'));
                        paths[i].setAttributeNS(null, 'd', constructLine(remotepos[0] + 5, remotepos[1] + 5, localpos[0] + 5, localpos[1] + 5));
                    }
                }
            }
            for (var x = 0; x < outputlinks.length; x++) {
                var localconnection = 'node' + nodeidnum + ' ' + outputlinks[x].output;
                var remoteconnection = 'node' + outputlinks[x].node + ' ' + outputlinks[x].input;
                paths = document.getElementById('svgcanvas').childNodes;
                for (var i = 1; i < paths.length; i++) {
                    if(paths[i].getAttribute('parent') == localconnection && paths[i].getAttribute('child') == remoteconnection){
                        var localpos = getElementPosition(outputs[outputlinks[x].output * 2 + 1]);
                        var remoteelement = document.getElementById('node' + outputlinks[x].node)
                        var remotepos = getElementPosition(remoteelement.querySelector('.inputs').querySelector('[ident = \"' + outputlinks[x].input + '\"]'));
                        paths[i].setAttributeNS(null, 'd', constructLine(localpos[0] + 5, localpos[1] + 5, remotepos[0] + 5, remotepos[1] + 5));
                    }
                }
            }
        }
    });
    $('#node'+ global.uid).append("<div class=\"nodename notkinetic\">" + node.name + "<button class=\"deletebutton\" onclick=\"nodes.removenode(" + global.uid + ")\">x</button></div>");
    $('#node'+ global.uid).append("<div id=\"inputs" + global.uid + "\" class=\"inputs notkinetic\"></div>");
    $('#node'+ global.uid).append("<div id=\"outputs" + global.uid + "\" class=\"outputs notkinetic\"></div>");
    var parentname = "node" + global.uid;
    for(var i = 0; i < node.initialInputs; i++) {
        $('#inputs'+ global.uid).append("<button class=\"socket input notkinetic\" parent=\"" + global.uid + "\" ident=\"" + i + "\" onclick=\"createWire(event, &quot;" + parentname + ' ' + i + " input&quot;)\"></button> INPUT!!!!");
    }
    $('#outputs'+ global.uid).append("OUTPUT!!!!<button class=\"socket output notkinetic\" parent=\"" + global.uid + "\" ident=\"" + 0 + "\" onclick=\"createWire(event, &quot;" + parentname + ' ' + 0 + " output&quot;)\"></button>");
    global.uid += 1;
    while(document.getElementsByClassName('drawing')[0]){
        document.getElementById('svgcanvas').removeChild(document.getElementsByClassName('drawing')[0]);
    }
    if(link != 'undefined') {
        var linkparent = link.split(' ')[0];
        var output = link.split(' ')[1];
        linkNodes(linkparent, output, "node" + (global.uid - 1), 0);
    }
}

function linkNodes (parent, output, child, input) {
    // Get number ids from names
    var parentid = +parent.match(/\d+$/)[0];
    var childid = +child.match(/\d+$/)[0];
    
    // Set links in nodes object
    nodes.nodes[parentid].outputlinks.push({node: childid, input: +input, output: +output});
    nodes.nodes[childid].inputlinks.length = 0;
    nodes.nodes[childid].inputlinks.push({node: parentid, input: +input, output: +output});
    
    parentnode = document.getElementById(parent);
    childnode = document.getElementById(child);
    parentout = parentnode.querySelector('.outputs').querySelector('[ident=\"' + output + '\"]');
    parentoutpos = getElementPosition(parentout);
    childout = childnode.querySelector('.inputs').querySelector('[ident=\"' + input + '\"]');
    childoutpos = getElementPosition(childout);
    
    line = document.createElementNS("http://www.w3.org/2000/svg","path");
    line.setAttributeNS(null, "class", "cable");
    line.setAttributeNS(null, "d", constructLine(parentoutpos[0] + 5, parentoutpos[1] + 5, childoutpos[0] + 5, childoutpos[1] + 5));
    line.setAttributeNS(null, "stroke", "blue");
    line.setAttributeNS(null, "stroke-width", "2");
    line.setAttributeNS(null, "fill", "none");
    line.setAttributeNS(null, "parent", parent + ' ' + output);
    line.setAttributeNS(null, "child", child + ' ' + input);
    document.getElementById("svgcanvas").appendChild(line);
    
    // remove any left over cables
    while(document.getElementsByClassName('drawing')[0]){
        document.getElementById('svgcanvas').removeChild(document.getElementsByClassName('drawing')[0]);
    }
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

// Draw cable until click
function linkCable(event) {
    global.cable.setAttributeNS(null, "d", constructLine(global.pos[0], global.pos[1], event.pageX, event.pageY));
    document.addEventListener('click', connectCable);
}

function connectCable(event) {
    document.removeEventListener('mousemove', linkCable);
    document.removeEventListener('click', connectCable);
    if(event.target.className.valueOf().toString().indexOf('socket') > -1) {
        targetparent = 'node' + event.target.getAttribute('parent')
        targetident = event.target.getAttribute('ident')
        localparent = global.selected.split(' ')[0]
        localident = global.selected.split(' ')[1]
        if (global.selected.split(' ')[2] == 'input') {
            linkNodes(targetparent, targetident, localparent, localident)
        }
        else {
            linkNodes(localparent, localident, targetparent, targetident)
        }
    }
    else {
        global.mousex = event.pageX;
        global.mousey = event.pageY;
        createMenu(event.pageX, event.pageY, global.selected);
    }
    global.drawing = false;
}