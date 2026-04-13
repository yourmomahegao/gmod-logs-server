from django.shortcuts import render
from django.db import connections
from django.core import serializers
from django.http import JsonResponse
from django.db.models import QuerySet
import platform
from core.security_utils import SafeJsonResponse

import requests
import json
from datetime import datetime, timedelta
import re

from core.settings import DATABASES

import threading
import time
import hashlib

def run_query(query, connection="prod", args=None, uppercase=False):
    """Method will run query on selected database

    Args:
            query (str): MSSQL Query
            connection (str): Which connection to use. Defaults to "prod".

    Returns:
            dict: Results of query
    """
    with connections[connection].cursor() as cursor:
        if args == None:
            args = list()
        
        try:
            cursor.execute(query, args)  # Replace with your actual query
        except Exception as e:
            print("Executed queries:" )
            for i, query in enumerate(connections[connection].queries):
                print(f'----------------- {i} -------------------')
                print(query["sql"])
                print(f'-----------------------------------------')
                
            raise e



        try:
            columns = []
            if uppercase:
                columns = [col[0].upper() for col in cursor.description]
            else:
                 columns = [col[0] for col in cursor.description]   
            
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        except:
            results = {}

    return results