# -*- coding: utf-8 -*-
from RestUtil import RestUtil

#http://legis.senado.leg.br/dadosabertos/docs/ui/index.html#!/PlenarioService/resource_PlenarioService_listaVotacoesSessaoXml_GET_0

class Votacao:

    url = 'http://legis.senado.leg.br/dadosabertos/plenario/lista/votacao'

    @staticmethod
    def get(data_votacao):

        #formata a data para ano mes dia
        str_data_votacao = data_votacao.strftime('%Y%m%d')

        #print Votacao.url+"/"+str_data_votacao+"/"+str_data_votacao

        #busca a votacao deste dia
        json = RestUtil.get_json(Votacao.url+"/"+str_data_votacao+"/"+str_data_votacao)

        return json

