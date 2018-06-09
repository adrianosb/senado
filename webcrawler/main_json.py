# -*- coding: utf-8 -*-
import urllib2

url='http://legis.senado.leg.br/dadosabertos/blocoParlamentar/lista'

# create the request object and set some headers
req = urllib2.Request(url)
req.add_header('Accept', 'application/json')#JSON

# make the request and print the results
res = urllib2.urlopen(req)
json = res.read()
print json

#TODO gravar no mongodb
