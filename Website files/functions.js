
// Constructor for Node struct
function Node(id, name, datatypes, description, tags) {
    this.id = id;
    this.name = name;
    this.datatypes = datatypes;
    this.description = description;
    this.tags = tags;
}

// List of available Nodes
var functions = [
    new Node(0, "Sequence", "", "Input a biological sequence with this node", "sequence fasta file input DNA protein"),
    new Node(1, "Blast", "protein DNA", "Search a database for similar protein or DNA sequences with BLAST", "search blast database"),
    new Node(2, "Protein digest", "protein", "Digest a protein sequence into peptides using common enzymes", "protein digest peptides"),
    new Node(3, "DNA digest", "DNA", "Digest a DNA sequence using restriction enzymes", "DNA digest restriction enzymes EcoR1 BamH1"),
    new Node(4, "Protein mass", "protein", "Evaluate the expected mass of a protein sequence", "mass kDa molecular weight")

];

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