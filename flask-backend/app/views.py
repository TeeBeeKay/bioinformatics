from app import app as application
from flask import render_template, request, jsonify
from app import sequence
import json


@application.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@application.route('/sat')
def sat():
    return render_template("sat.html")


@application.route('/compute/', methods=['GET', 'POST'])
def compute():
    if request.method == 'POST':
        content = request.get_json()
        if content['type'] == 'Blast':
            blastprog = content['settings']['Blast program']
            blastdata = sequence.blast(blastprog, content['inputs'][0]['value'])
            blastbestids = sequence.blastbestids(blastdata)
            blastdata = json.loads(blastdata)
            blastbestids = json.loads(blastbestids)
            payload = {'node': content['node'], 'outputs': []}
            payload['outputs'].append({'pin': 0, 'value': blastdata})
            payload['outputs'].append({'pin': 1, 'value': blastbestids})
            return json.dumps(payload)
        elif content['type'] == 'DNA digest':
            dnaseq = sequence.loadfromstring(content['inputs'][0]['value'])
            digestedseqs = sequence.dnadigest(dnaseq, content['settings']['Enzyme'], True)
            payload = {'node': content['node'], 'outputs': []}
            if len(digestedseqs) < 10:
                for inseq in digestedseqs:
                    for x, digest in enumerate(inseq):
                        payload['outputs'].append({'pin': x, 'value': digest.format("fasta")})
            return json.dumps(payload)
    else:
        return request.url


@application.errorhandler(500)
def internal_error(exception):
    application.logger.error(exception)
    return render_template('500.html'), 500