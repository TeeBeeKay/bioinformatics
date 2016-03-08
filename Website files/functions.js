
// Constructor for Node struct
function Node(id, name, datatypes, description, tags, initialInputs, initialOutputs, maxInputs, maxOutputs, textInput) {
    this.id = id;
    this.name = name;
    this.datatypes = datatypes;
    this.description = description;
    this.tags = tags;
    this.initialInputs = initialInputs;
    this.initialOutput = initialOutputs;
    this.maxInputs = maxInputs;
    this.maxOutputs = maxOutputs;
}

// List of available Nodes
var functions = [
    new Node(0, "Sequence", "", "Input a biological sequence with this node", "sequence fasta file input DNA protein", 0, 1, 0, -1, true),
    new Node(1, "Blast", "protein DNA", "Search a database for similar protein or DNA sequences with BLAST", "search blast database", 1, 1, -1, -1, false),
    new Node(2, "Protein digest", "protein", "Digest a protein sequence into peptides using common enzymes", "protein digest peptides", 1, 1, -1, -1, false),
    new Node(3, "DNA digest", "DNA", "Digest a DNA sequence using restriction enzymes", "DNA digest restriction enzymes EcoR1 BamH1", 1, 1, -1, -1, false),
    new Node(4, "Protein mass", "protein", "Evaluate the expected mass of a protein sequence", "mass kDa molecular weight", 1, 1, -1, -1, false),
    new Node(5, "Transcribe/translate", "DNA", "Transcribe and/or translate a DNA or mRNA sequence", 1, 1, -1, -1, false)

];

// Create lookup table for functions from id
var lookup = {}
for (var i = 0, len = functions.length; i < len; i++) {
    lookup[functions[i].id] = functions[i]
}

// Function to return only relevant nodes
function NodeSelect(userinput, functionlist) {
    var returnlist = [];
    for (var i = 0; i < functionlist.length; i++) {
        var hit = false;
        for (var prop in functionlist[i]) {
            if(prop != "id") {
                if(functionlist[i][prop].toLowerCase().indexOf(userinput.toLowerCase()) > -1) {
                    hit = true;
                }
            }
            if(hit) {
                break;
            }
        }
        if(hit) {
            returnlist.push(functionlist[i]);
        } 
    }
    if(returnlist.length == 0) {
        returnlist = functionlist;
    }
    return(returnlist);
} 