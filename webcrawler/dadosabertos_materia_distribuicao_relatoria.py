# -*- coding: utf-8 -*-
from RestUtil import RestUtil

url = 'http://legis.senado.leg.br/dadosabertos/materia/distribuicao/relatoria'
json = RestUtil.get_json(url)
print json

#TODO gravar no mongodb
