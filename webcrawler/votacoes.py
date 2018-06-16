# -*- coding: utf-8 -*-
from datetime import timedelta
from datetime import date
from dadosabertos_plenario_lista_votacao import Votacao
from service.senado_service import SenadoService
import time

data_votacao = SenadoService().get_ultima_data()

while data_votacao.date() < (date.today() - timedelta(days=20)):
    votacoes = Votacao.get(data_votacao)

    #soma um dia
    data_votacao = data_votacao + timedelta(days=1)

    #sleep para nao parecer um ataque no servidor, para nao barrar ip
    time.sleep(1)

    if "Votacoes" not in votacoes["ListaVotacoes"]:
        print("nao teve votacao neste dia: "+str(data_votacao))
        continue

    for key, value in votacoes["ListaVotacoes"].iteritems():
        #nao eh uma tag votacao
        if 'Votacoes' != key:
            continue

        SenadoService().add_votacao(value["Votacao"])

        print("ok: " + str(data_votacao))
