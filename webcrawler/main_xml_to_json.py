# -*- coding: utf-8 -*-
## para instalar: pip install xmltodict

import urllib2
import xmltodict
import json

url='http://legis.senado.leg.br/dadosabertos/blocoParlamentar/lista'

# create the request object and set some headers
req = urllib2.Request(url)
req.add_header('Accept', 'application/xml')

# make the request and print the results
res = urllib2.urlopen(req)
xml = res.read()
print xml

obj = xmltodict.parse(xml)
myjson = json.dumps(obj, indent=2)
print myjson



#TODO gravar no mongodb
