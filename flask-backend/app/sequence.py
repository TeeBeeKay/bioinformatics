from subprocess import Popen, PIPE, STDOUT
import json
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord
from Bio import Restriction


def loadfromstring(seqstring):
    """
    Adapted from BioPython SimpleFastaParser
    License: https://github.com/biopython/biopython/blob/master/LICENSE
    """
    sequences = []
    i = 0
    count = 0
    lines = seqstring.split('\n')
    while i < len(lines) - 1:
        if lines[i][0] != ">":
            title = str(count)
            count += 1
        else:
            title = lines[i][1:]
            i += 1
        seqlines = []
        #print i, len(lines) # debug
        while i < len(lines):
            if len(lines[i]) > 0:
                if lines[i][0] == ">":
                    break
            seqlines.append(lines[i])
            i += 1
        seq = Seq("".join(seqlines).replace(" ", "").replace("\r", ""))
        sequences.append(SeqRecord(seq, id=title, description=""))
    return sequences


def blast(program, sequence):
    if program == 'blastp':
        #print sequence
        p = Popen(['blastp', '-db', '/home/www/db/swissprot', '-outfmt', '15'], stdout=PIPE, stdin=PIPE, stderr=PIPE)
        data, err = p.communicate(input=sequence)
        return data


def blasthits(blastdata):
    data = json.loads(blastdata)
    hits = data['BlastOutput2'][0]['report']['results']['search']['hits']
    hitsjson = json.dumps(hits)
    return hitsjson


def blastbestids(blastdata):
    hits = json.loads(blasthits(blastdata))
    hitids = []
    for hit in hits:
        for hithit in hit['description']:
            hitids.append(hithit['id'])
    return json.dumps(hitids)


def dnadigest(recordlist, enzyme, linear):
    digestedseqs = []
    for record in recordlist:
        digest = Restriction.Restriction.__dict__[enzyme].catalyse(record.seq, linear)
        name = record.id + '|' + enzyme + '|digest'
        labelleddigest = [SeqRecord(x, id=name + str(y) + '|', description=record.description) for y, x in enumerate(digest)]
        digestedseqs.append(labelleddigest)
    return digestedseqs