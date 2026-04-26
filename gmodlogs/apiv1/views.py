from django.shortcuts import render, redirect
from core.settings import SAVE_LOG_SECRET
from django.http import HttpResponseNotFound
from core.security_utils import SafeJsonResponse
from core.functions import run_query
from core.decorators import post_args
from gmodlogs.models import Log, LogAction, LogType
from datetime import datetime

@post_args({"query": {"required": False, "type": "str"}, 
            "find_by": {"required": False, "type": "json"},
            "actions": {"required": False, "type": "json"},
            "types": {"required": False, "type": "json"},
            "datetimes": {"required": False, "type": "json"},
            "offset": {"required": False, "type": "int"},
            "limit": {"required": False, "type": "int"}})
def get_logs(request, post_args=None):
    if request.method == "POST":
        query = post_args["query"]
        find_by = post_args["find_by"]
        actions = post_args["actions"]
        types = post_args["types"]
        datetimes = post_args["datetimes"]
        offset = post_args["offset"]
        limit = post_args["limit"]
        
        use_find_by = False
        use_actions = False
        use_types = False
        use_start_datetime = False
        use_end_datetime = False
        
        if (find_by and len(find_by) > 0) and (query and query != ""):
            use_find_by = True
            
        if actions and len(actions) > 0:
            use_actions = True
            
        if types and len(types) > 0:
            use_types = True
            
        if datetimes and datetimes.get("start", None):
            use_start_datetime = True
            
        if datetimes and datetimes.get("end", None):
            use_end_datetime = True
        
        arguments_list = []
        arguments_query_list = []
        
        find_by_arguments_list = []
        find_by_arguments_query_list = []
            
        if use_find_by:
            for find_by_data in find_by:
                if find_by_data == "steam_id":
                    find_by_arguments_list.append("steam_id like %s")
                    find_by_arguments_query_list.append(f'%{query}%')
                elif find_by_data == "steam_id64":
                    find_by_arguments_list.append("steam_id64 like %s")
                    find_by_arguments_query_list.append(f'%{query}%')
                elif find_by_data == "nickname":
                    find_by_arguments_list.append("nickname like %s")
                    find_by_arguments_query_list.append(f'%{query}%')
                elif find_by_data == "data":
                    find_by_arguments_list.append("data like %s")
                    find_by_arguments_query_list.append(f'%{query}%')
            
        if use_actions:
            for action in actions:
                if type(action) != int:
                    return SafeJsonResponse({"status": False, "message": "Неверные значения в 'actions'"})
            
            arguments_list.append(f"action_id in ({("%s, " * len(actions))[:-2]})")
            
            for action in actions:
                arguments_query_list.append(action)
            
        if use_types:
            for _type in types:
                if type(_type) != int:
                    return SafeJsonResponse({"status": False, "message": "Неверные значения в 'type'"})
            
            arguments_list.append(f"type_id in ({("%s, " * len(types))[:-2]})")
            
            for _type in types:
                arguments_query_list.append(_type)
            
        if use_start_datetime and use_end_datetime:
            arguments_list.append("(insertion_datetime >= %s and insertion_datetime <= %s)")
            arguments_query_list.append(datetime.fromtimestamp(datetimes["start"] / 1000).strftime('%Y-%m-%d %H:%M:%S'))
            arguments_query_list.append(datetime.fromtimestamp(datetimes["end"] / 1000).strftime('%Y-%m-%d %H:%M:%S'))
            
        elif use_start_datetime:
            arguments_list.append("insertion_datetime >= %s")
            arguments_query_list.append(datetime.fromtimestamp(datetimes["start"] / 1000).strftime('%Y-%m-%d %H:%M:%S'))
            
        elif use_end_datetime:
            arguments_list.append("insertion_datetime <= %s")
            arguments_query_list.append(datetime.fromtimestamp(datetimes["end"] / 1000).strftime('%Y-%m-%d %H:%M:%S'))
        
        arguments_defined = len(arguments_list) > 0
                
        logs_data = run_query(f"""SELECT
                                      gll.*,
                                      glla.name as action_name,
                                      gllt.name as type_name
                                   FROM gmodlogs_log gll
                                   LEFT JOIN gmodlogs_logaction glla ON gll.action_id = glla.id
                                   LEFT JOIN gmodlogs_logtype gllt ON gll.type_id = gllt.id
                                   {"WHERE " if arguments_defined or use_find_by else ""}{" AND ".join(arguments_list)}
                                   {"AND " if arguments_defined and use_find_by else ""}{"(" if use_find_by else ""}{" OR ".join(find_by_arguments_list)}{")" if use_find_by else ""}                       
                                   ORDER BY id DESC
                                   LIMIT %s OFFSET %s""", args=(*arguments_query_list, *find_by_arguments_query_list, limit, offset, ), connection="default")

        return SafeJsonResponse({"status": True, "message": "", "data": logs_data})

@post_args({})
def get_logs_types(request, post_args=None):
    if request.method == "POST":
        types_data = run_query("""SELECT
                                     gllt.*
                                  FROM gmodlogs_logtype gllt""", args=(), connection="default")

        return SafeJsonResponse({"status": True, "message": "", "data": types_data})

@post_args({})
def get_logs_actions(request, post_args=None):
    if request.method == "POST":
        actions_data = run_query("""SELECT
                                       glla.*
                                    FROM gmodlogs_logaction glla""", args=(), connection="default")

        return SafeJsonResponse({"status": True, "message": "", "data": actions_data})

@post_args({"secret_key": {"required": True, "type": "str"},
            "steam_id": {"required": True, "type": "str"},
            "steam_id64": {"required": True, "type": "str"},
            "nickname": {"required": True, "type": "str"},
            "data": {"required": True, "type": "str"},
            "type_id": {"required": True, "type": "int"},
            "action_id": {"required": True, "type": "int"}})
def save_log(request, post_args=None):
    if request.method == "POST":
        secret_key = post_args["secret_key"]
        steam_id = post_args["steam_id"]
        steam_id64 = post_args["steam_id64"]
        nickname = post_args["nickname"]
        data = post_args["data"]
        type_id = post_args["type_id"]
        action_id = post_args["action_id"]
        
        if secret_key != SAVE_LOG_SECRET:
            return SafeJsonResponse({"status": False, "message": "Неверный secret_key"})
        
        run_query("""INSERT INTO gmodlogs_log
                         (steam_id, steam_id64, nickname, data, type_id, action_id, insertion_datetime)
                     VALUES
                         (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)""", args=(steam_id, steam_id64, nickname, data, type_id, action_id), connection="default")

        return SafeJsonResponse({"status": True, "message": "Лог сохранен"})