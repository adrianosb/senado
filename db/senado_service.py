# -*- coding: utf-8 -*-

from pymongo import MongoClient
from bson import json_util
import json
from datetime import datetime
from dateutil.relativedelta import relativedelta
from datetime import timedelta
import pprint
import sys, os
sys.path.insert(0, os.path.abspath('..'))
from lib.treeset import TreeSet
import itertools

class SenadoService:

    db = None

    def getDb(self):
        if self.db is None:
            client = MongoClient('mongodb://localhost:27017/')
            self.db = client.senado
        return self.db


    def add_votacao(self, votacao):
        data_sessao = None

        votos = json.loads(json_util.dumps(votacao))

        db = self.getDb()

        if type(votacao) is list:
            for obj in votos:
                obj["DataSessao"] = datetime.strptime(obj["DataSessao"], '%Y-%m-%d')
                data_sessao =  obj["DataSessao"]

            db.votacoes.insert_many(votos)
        else:
            votos["DataSessao"] = datetime.strptime(votos["DataSessao"], '%Y-%m-%d')
            data_sessao = votos["DataSessao"]

            db.votacoes.insert_one(votos)

        if data_sessao is not None:
            ultima_data = {}
            ultima_data['ultima_data'] = data_sessao
            #json_data = json.dumps(ultima_data)

            db.ultima_data.update_one({}, {
                '$set': ultima_data
            }, upsert=True)


    def get_ultima_data(self):

        db = self.getDb()
        data = db.ultima_data.find_one()

        if data is None or data['ultima_data'] is None:
            return datetime.now() - relativedelta(years=25)

        return data['ultima_data'] + timedelta(days=1)


    def senadores(self, start, end):

        db = self.getDb()
        result = db.votacoes.senadores({'DataSessao': {'$lt': end, '$gte': start}}, {'Votos': 1}).limit(1)

        ts = TreeSet([])

        for doc in result:
            if 'Votos' not in doc or 'VotoParlamentar' not in doc['Votos']:
                #nao tem a chave Votos ou VotoParlamentar
                continue

            for voto in doc['Votos']['VotoParlamentar']:
                if voto['NomeParlamentar'] is not None:
                    ts.add(voto['NomeParlamentar'])

        ts = list(ts)
        return ts


    def votos(self, senadores, start, end):
        nomeFiltro = [u"José Sarney"]
        senadores = nomeFiltro

        db = self.getDb()
        result = db.votacoes.find({
            "Votos.VotoParlamentar.NomeParlamentar": {
                '$in': senadores
            }
        })

        map_senadores = self.map(result, senadores)

        result = self.reduce(map_senadores)

        pprint.pprint(result)


    def map(self, result, senadores):
        map_senadores = {}
        for doc in result:
            if 'Votos' not in doc or 'VotoParlamentar' not in doc['Votos']:
                # nao tem a chave Votos ou VotoParlamentar
                continue

            for voto in doc['Votos']['VotoParlamentar']:
                senador = voto['NomeParlamentar']
                if senador in senadores:

                    if senador not in map_senadores:
                        # inicia o array do senador
                        map_senadores[senador] = []

                    map_senadores[senador].append(voto)
        return map_senadores


    def reduce(self, map_senadores):
        result = {}
        for senador in map_senadores:
            siglas = {}
            data = sorted(map_senadores[senador], key=lambda x: x['Voto'])
            for k, g in itertools.groupby(data, lambda x: x['Voto']):
                siglas[k] = len(list(g))

            result[senador] = siglas
        return result


if __name__ == '__main__':
    SenadoService().votos(1, 1, 1)


