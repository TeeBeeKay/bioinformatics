// JS for worksheet

// Enable kinetic drag to scroll
$('body').kinetic({
    filterTarget: function (target, e) {
        return !($(target).hasClass("menu") || $(target).hasClass("node") || $(target).hasClass("notkinetic"));
    }
});

// Import list of nodes
// http://www.objgen.com/json/models/IfA8
$.getJSON('nodes.json', function (data) {
    nodes.types = data.nodetypes;
    
    for (var i = 0, len = data.nodetypes.length; i < len; i++) {
        global.lookup[data.nodetypes[i].id] = nodes.types[i]
    }
    placesidemenu();
    UpdateSideList();
})

function placesidemenu() {
    var sidemenu = document.createElement('div');
    sidemenu.id = 'sidemenu';
    sidemenu.className = 'sidemenu notkinetic';
    
    var sidetext = document.createElement('input');
    sidetext.id = 'sidemenuinput';
    sidetext.className = 'sidemenuinput notkinetic';
    sidetext.setAttribute('oninput', 'UpdateSideList(event)');
    
    var sidemenubuttonsdiv = document.createElement('div');
    sidemenubuttonsdiv.id = 'sidemenubuttonsdiv';
    sidemenubuttonsdiv.className = 'sidemenubuttonsdiv notkinetic';
    
    var settings = document.createElement('div');
    settings.id = 'settings';
    settings.className = 'settings notkinetic';
    
    sidemenu.appendChild(sidetext);
    sidemenu.appendChild(document.createElement('p'));
    sidemenu.appendChild(sidemenubuttonsdiv);
    sidemenu.appendChild(settings);
    document.body.appendChild(sidemenu);
    
}

// Function to return only relevant nodes
function NodeSelect(userinput) {
    var returnlist = [];
    for (var i = 0; i < nodes.types.length; i++) {
        var hit = false; 
        
        if (!hit && nodes.types[i]['description'].toLowerCase().indexOf(userinput.toLowerCase()) > -1) {
            hit = true;
        }
        
        if (!hit && nodes.types[i]['name'].toLowerCase().indexOf(userinput.toLowerCase()) > -1) {
            hit = true;
        }
        
        if (!hit && nodes.types[i]['tags'].toLowerCase().indexOf(userinput.toLowerCase()) > -1) {
            hit = true;
        }
        
        if(hit) {
            returnlist.push(nodes.types[i]);
        }
    }
    if(returnlist.length == 0) {
        returnlist = nodes.types;
    }
    return(returnlist);
} 

// Function to update the list whenever input is detected
UpdateList = function (event) {
    var userinput = '';
    if (event.type === 'input') {
        userinput = event.target.value;
    }
    items = NodeSelect(userinput);
    $('#menubuttonsdiv').empty();
    for (var i = 0; i < items.length; i++) {
        $('#menubuttonsdiv').append("<button class=\"menuitem\" onclick=\"nodes.addnode(" + items[i].id + ")\")>" + items[i].name + "</button><br>");
    }
}

// Function to update the side list whenever input is detected
UpdateSideList = function (event) {
    var userinput = '';
    if (event != undefined && event.type === 'input') {
        userinput = event.target.value;
    }
    items = NodeSelect(userinput);
    $('#sidemenubuttonsdiv').empty();
    for (var i = 0; i < items.length; i++) {
        $('#sidemenubuttonsdiv').append("<button class=\"menuitem\" onclick=\"placenode(" + items[i].id + ")\")>" + items[i].name + "</button><br>");
    }
}

function placenode(id) {
    uid = nodes.addnode(id, event.pageX, event.pageY);
    global.selected = 'node' + uid;
    document.addEventListener('mousemove', placenodemove);
    document.addEventListener('click', placenodeclick, true);
}

function placenodemove(event) {
    setNodePosition(global.selected, event.pageX, event.pageY);
}

function placenodeclick() {
    document.removeEventListener('mousemove', placenodemove);
    document.removeEventListener('click', placenodeclick);
}

function setNodePosition (nodeid, x, y) {
    document.getElementById(nodeid).setAttribute('style', 'left: ' + x + 'px; top:' + y + 'px;');
}

// Set unique node id
var global = new Object();
global.uid = 0;
global.mousex = 0;
global.mousey = 0;
global.cable;
global.pos;
global.selected;
global.tocreate;
global.drawing = false;
global.lookup = {};
global.selectednode;

var nodes = new Object();
nodes.nodes = [];
nodes.types;
nodes.addnode = function(id, x, y) {
    var type = global.lookup[id].name;
    var settings = global.lookup[id].settings;
    var node = {type: type, id: global.uid, inputlinks: [], outputlinks: [], settings: []};
    node.settings.values = {};
    node.settings.settings = settings;
    this.nodes.push(node);
    if (x == undefined) {
        x = global.mousex
    }    
    if (y == undefined) {
        y = global.mousey
    }
    createNode(id, x, y);
    global.selectednode = node.id;
    
    //
    // Fill settings test code
    //
    settingsdiv = document.getElementById('settings');
    // Clear settings pane
    while(settingsdiv.firstChild) {
        settingsdiv.removeChild(settingsdiv.firstChild)
    }
    
    if(settings) {
        for (var i = 0; i < settings.length; i++) {
            switch(settings[i].type) {
                case 'textbox':
                    settingsdiv.innerHTML += settings[i].label + ':';
                    settingsdiv.appendChild(document.createElement('br'));
                    node.settings.values[settings[i].label] = '';
                    break;
                case 'dropdown':
                    settingsdiv.innerHTML += settings[i].label + ':';
                    settingsdiv.appendChild(document.createElement('br'));
                    var dropdown = document.createElement('select');
                    dropdown.className = 'notkinetic';
                    dropdown.setAttribute('onchange', 'updatesettingsvalue(event, '+ node.id +', \''+ settings[i].label +'\')')
                    for (var j = 0; j < settings[i].options.length; j++) {
                        var option = document.createElement('option');
                        option.innerHTML = settings[i].options[j];
                        option.value = settings[i].options[j];
                        dropdown.appendChild(option)
                        
                    }
                    //node.settings.push(dropdown.value);
                    node.settings.values[settings[i].label] = dropdown.value;
                    settingsdiv.appendChild(dropdown);
                    break;
                case 'radio':
                    settingsdiv.innerHTML += settings[i].label + ':';
                    settingsdiv.appendChild(document.createElement('br'));
                    //node.settings.push(settings[i].options[0]);
                    node.settings.values[settings[i].label] = settings[i].options[0];
                    for (var j = 0; j < settings[i].options.length; j++) {
                        var radio = document.createElement('input');
                        radio.className = 'notkinetic';
                        radio.value = settings[i].options[j];
                        // Check selected option
                        if (radio.value === node.settings.values[settings[i].label]) {
                            radio.setAttribute('checked', 'true');
                        }
                        radio.setAttribute('type', 'radio');
                        radio.setAttribute('name', settings[i].label);
                        radio.setAttribute('onchange', 'updatesettingsvalue(event, '+ node.id +', \''+ settings[i].label +'\')');
                        settingsdiv.appendChild(radio);
                        settingsdiv.innerHTML += settings[i].options[j];
                        settingsdiv.appendChild(document.createElement('br'))
                    }
                    break;
            }
        }
    }
    
    return node.id;
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
    if (uid === global.selectednode) { // Empty settings pane
        settingsdiv = document.getElementById('settings');
        while (settingsdiv.firstChild) {
            settingsdiv.removeChild(settingsdiv.firstChild);
        }
    }
}

// Called when settings are changed
function updatesettingsvalue(event, nodeid, property) {
    nodes.nodes[nodeid].settings.values[property] = event.target.value;
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

// On menu item click, create draggable node. Node id is given as argument
function createNode (id, x, y) {
    node = global.lookup[id];
    var link = 'undefined';
    if (document.getElementById('menu')) {
        link = document.getElementById('menu').getAttribute('input');
    }
    $('#menu').remove();
    $('#inner').append("<div class=\"node notkinetic\" id=\"node" + global.uid + "\" style=\"left:" + x + "px;top:" + y + "px;\"></div>");
    $('#node'+ global.uid).draggable({
        drag: function(event, ui) {
            // Get properties of node
            var node = ui.helper[0];
            var nodeid = node.attributes.id.nodeValue;
            var nodeidnum = +nodeid.match(/\d+$/)[0];
            var inputs = document.getElementById('inputs'+nodeidnum).childNodes;
            var outputs = document.getElementById('outputs'+nodeidnum).childNodes;
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
                        var localpos = getElementPosition(outputs[outputlinks[x].output * 3 + 1]);
                        var remoteelement = document.getElementById('node' + outputlinks[x].node)
                        var remotepos = getElementPosition(remoteelement.querySelector('.inputs').querySelector('[ident = \"' + outputlinks[x].input + '\"]'));
                        paths[i].setAttributeNS(null, 'd', constructLine(localpos[0] + 5, localpos[1] + 5, remotepos[0] + 5, remotepos[1] + 5));
                    }
                }
            }
        }
    });
    $('#node'+ global.uid).append("<div class=\"nodename notkinetic\">" + node.name + "<button class=\"deletebutton\" onclick=\"nodes.removenode(" + global.uid + ")\">x</button></div>");
    $('#node'+ global.uid).append("<div class=\"notkinetic\" style=\"height:5px;\"></div>");
    $('#node'+ global.uid).append("<div id=\"inputs" + global.uid + "\" class=\"inputs notkinetic\"></div>");
    $('#node'+ global.uid).append("<div id=\"outputs" + global.uid + "\" class=\"outputs notkinetic\"></div>");
    var parentname = "node" + global.uid;
    var count = 0;
    for(var i = 0; i < node.inputs.length; i++) {
        for(var j = 0; j < node.inputs[i].initial; j++){
            $('#inputs'+ global.uid).append("<button class=\"socket input notkinetic\" parent=\"" + global.uid + "\" ident=\"" + count + "\" onclick=\"createWire(event, &quot;" + parentname + ' ' + count + " input&quot;)\"></button> " + node.inputs[i].label);
        }
        count++;
    }
    count = 0;
    for(var i = 0; i < node.outputs.length; i++){
        for(var j = 0; j < node.outputs[i].initial; j++){
            $('#outputs'+ global.uid).append(node.outputs[i].label + "<button class=\"socket output notkinetic\" parent=\"" + global.uid + "\" ident=\"" + count + "\" onclick=\"createWire(event, &quot;" + parentname + ' ' + count + " output&quot;)\"></button><p></p>");
        }
        count++;
    }
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
    $(this).append("<input type=\"text\" oninput=\"UpdateList(event)\" id=\"menuinput\">");
    $(this).append("<div id=\"menubuttonsdiv\"></div>")
    this.style.overflow="hidden";
    UpdateList(event);
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
            linkNodes(localparent, localident, targetparent, targetident);
        }
    }
    else {
        global.mousex = event.pageX;
        global.mousey = event.pageY;
        createMenu(event.pageX, event.pageY, global.selected);
    }
    global.drawing = false;
}