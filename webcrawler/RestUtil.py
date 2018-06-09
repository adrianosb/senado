# -*- coding: utf-8 -*-
import urllib2
import json


class RestUtil:


    @staticmethod
    def get_json(url):

        # create the request object and set some headers
        req = urllib2.Request(url)
        req.add_header('Accept', 'application/json')

        # make the request and print the results
        res = urllib2.urlopen(req)
        result = json.loads(res.read())
        return result
