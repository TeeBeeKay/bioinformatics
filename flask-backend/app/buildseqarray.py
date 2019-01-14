def buildseqarray(seqstring):
    splitstring = seqstring.split('\n')
    returnarray = []
    count = -1
    for line in splitstring:
        if line[0] == '>':
            returnarray.append(str((count + 1)/2))
            returnarray.append('')
            count += 2
        else:
            returnarray[count] += line

    return returnarray
