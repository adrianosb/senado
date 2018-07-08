# -*- coding: utf-8 -*-
from flask import Flask, render_template, jsonify, request
from datetime import datetime
from service.senado_service import SenadoService
import json

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

@app.route('/')
def index():
   return render_template('index.html')


@app.route('/api/v0.1/senadores/<start>/<end>', methods=['GET'])
def get_senadores(start, end):
    start = datetime.strptime(start, '%Y-%m-%d')
    end = datetime.strptime(end, '%Y-%m-%d')
    #TODO validar datas
    j = SenadoService().senadores(start, end)
    return jsonify(j)


@app.route('/api/v0.1/senadores', methods=['POST'])
def find():
    data = request.get_json()
    start = datetime.strptime(data["start"], '%d/%m/%Y')
    end = datetime.strptime(data["end"], '%d/%m/%Y')
    #TODO validar campos

    j = SenadoService().votos(data["senadores"], start, end);

    return jsonify(j)


if __name__ == '__main__':
   app.run(debug = True)