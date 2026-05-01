from functools import wraps
from datetime import datetime
from django.shortcuts import render, redirect
import json
from core.security_utils import SafeJsonResponse
from core.functions import run_query

def post_args(post_args):
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            request = args[0]
            cookies = request.COOKIES
            data = {}
            
            try:
                # Only try to parse JSON if content type indicates JSON
                content_type = request.content_type or ''
                if 'application/json' in content_type:
                    data_body = json.loads(request.body)
                else:
                    data_body = {}
            except (json.JSONDecodeError, UnicodeDecodeError):
                data_body = {}
                    
            data_post = request.POST.dict()
            data_get = request.GET.dict()
            
            # Parse files from request
            try:
                for key, file_obj in request.FILES.items():
                    if key not in data:
                        data[key] = file_obj
            except Exception as e:
                return SafeJsonResponse({"status": False, "message": "Ошибка при обработке файлов: " + str(e)})
            
            try:
                for key, value in data_post.items():
                    if key not in data:
                        data[key] = value
            except Exception as e:
                return SafeJsonResponse({"status": False, "message": "Ошибка при обработке данных: " + str(e)})
            
            try:
                for key, value in data_get.items():
                    if key not in data:
                        data[key] = value
            except Exception as e:
                return SafeJsonResponse({"status": False, "message": "Ошибка при обработке данных: " + str(e)})
            
            try:
                for key, value in data_body.items():
                    if key not in data:
                        data[key] = value
            except Exception as e:
                return SafeJsonResponse({"status": False, "message": "Ошибка при обработке данных: " + str(e)})
            
            port_args_data = {}
            for post_arg_name, post_arg_args in post_args.items():
                try:
                    port_args_data[post_arg_name] = data[post_arg_name]

                    if port_args_data[post_arg_name] == None or port_args_data[post_arg_name] == "":
                        port_args_data[post_arg_name] = None

                        if post_arg_args.get("required") == None:
                            return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} не может быть пустым"})
                        elif post_arg_args.get("required") == True:
                            return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} не может быть пустым"})
                        elif post_arg_args.get("required") == False:
                            pass
                
                    if post_arg_args.get("required") != None and port_args_data[post_arg_name] != None:
                        if post_arg_args.get("type") == None:
                            pass
                        elif post_arg_args.get("type") == "int":
                            try:
                                port_args_data[post_arg_name] = int(port_args_data[post_arg_name])
                            except:
                                return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть числом"})
                        elif post_arg_args.get("type") == "bool":
                            try:
                                if isinstance(port_args_data[post_arg_name], bool):
                                    port_args_data[post_arg_name] = bool(port_args_data[post_arg_name])
                                else:
                                    if str(port_args_data[post_arg_name]) == "1":
                                        port_args_data[post_arg_name] = True
                                    elif str(port_args_data[post_arg_name]) == "0":
                                        port_args_data[post_arg_name] = False
                                    elif str(port_args_data[post_arg_name]).lower() == "true":
                                        port_args_data[post_arg_name] = True
                                    elif str(port_args_data[post_arg_name]).lower() == "false":
                                        port_args_data[post_arg_name] = False
                                    else:
                                        raise Exception
                            except Exception as e:
                                return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть булевом"})
                        elif post_arg_args.get("type") == "str":
                            try:
                                port_args_data[post_arg_name] = str(port_args_data[post_arg_name])
                            except:
                                return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть строкой"})
                        elif post_arg_args.get("type") == "float":
                            try:
                                port_args_data[post_arg_name] = float(port_args_data[post_arg_name])
                            except:
                                return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть числом с плав. точкой"})
                        elif post_arg_args.get("type") == "json":
                            try:
                                port_args_data[post_arg_name] = json.loads(port_args_data[post_arg_name])
                            except:
                                return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть JSON"})
                        elif post_arg_args.get("type") == "date":
                            try:
                                port_args_data[post_arg_name] = datetime.strptime(port_args_data[post_arg_name], "%Y-%m-%d")
                            except:
                                return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть датой"})
                        elif post_arg_args.get("type") == "datetime":
                            try:
                                try:
                                    port_args_data[post_arg_name] = datetime.fromtimestamp(int(port_args_data[post_arg_name]))
                                except:
                                    try:
                                        port_args_data[post_arg_name] = datetime.strptime(port_args_data[post_arg_name], "%Y-%m-%d %H:%M:%S")
                                    except:
                                        try:
                                            port_args_data[post_arg_name] = datetime.strptime(port_args_data[post_arg_name], "%Y-%m-%d %H:%M")
                                        except:
                                            return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть датой + временем или Unix timestamp"})
                            except:
                                return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть датой + временем или UNIX временем"})
                        elif post_arg_args.get("type") == "time":
                            try:
                                # Parse time in format H:M:S or H:M
                                try:
                                    port_args_data[post_arg_name] = datetime.strptime(port_args_data[post_arg_name], "%H:%M:%S").time()
                                except:
                                    try:
                                        port_args_data[post_arg_name] = datetime.strptime(port_args_data[post_arg_name], "%H:%M").time()
                                    except:
                                        return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть временем в формате H:M:S или H:M"})
                            except:
                                return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} должен быть временем в формате H:M:S или H:M"})
                        elif post_arg_args.get("type") == "file":
                            try:
                                port_args_data[post_arg_name] = data[post_arg_name]
                            except Exception as e:
                                return SafeJsonResponse({"status": False, "message": f"Ошибка при обработке файла {post_arg_name}: {str(e)}"})
                    


                except KeyError:
                    port_args_data[post_arg_name] = None

                    if post_arg_args.get("required") == None:
                        return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} не указан"})
                    elif post_arg_args.get("required") == True:
                        return SafeJsonResponse({"status": False, "message": f"Параметр {post_arg_name} не указан"})
                    elif post_arg_args.get("required") == False:
                        pass

            __ret = function(*args, **kwargs, post_args=port_args_data)
            return __ret

        return wrapper
    return decorator
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            request = args[0]
            cookies = request.COOKIES
            data = {}
            
            try:
                # Only try to parse JSON if content type indicates JSON
                content_type = request.content_type or ''
                if 'application/json' in content_type:
                    data_body = json.loads(request.body)
                else:
                    data_body = {}
            except (json.JSONDecodeError, UnicodeDecodeError):
                data_body = {}
                    
            data_post = request.POST.dict()
            data_get = request.GET.dict()
            
            
            # Parse files from request
            try:
                for key, file_obj in cookies.items():
                    if key not in data:
                        data[key] = file_obj
            except Exception as e:
                return SafeJsonResponse({"status": False, "message": "Ошибка при обработке файлов: " + str(e)})
            
            try:
                for key, file_obj in request.FILES.items():
                    if key not in data:
                        data[key] = file_obj
            except Exception as e:
                return SafeJsonResponse({"status": False, "message": "Ошибка при обработке файлов: " + str(e)})
            
            try:
                for key, value in data_post.items():
                    if key not in data:
                        data[key] = value
            except Exception as e:
                return SafeJsonResponse({"status": False, "message": "Ошибка при обработке данных: " + str(e)})
            
            try:
                for key, value in data_get.items():
                    if key not in data:
                        data[key] = value
            except Exception as e:
                return SafeJsonResponse({"status": False, "message": "Ошибка при обработке данных: " + str(e)})
            
            try:
                for key, value in data_body.items():
                    if key not in data:
                        data[key] = value
            except Exception as e:
                return SafeJsonResponse({"status": False, "message": "Ошибка при обработке данных: " + str(e)})
            
            
            session = None
            try:
                session = data["session"]
            except KeyError:
                __ret = function(*args, **kwargs, session_data={
                    "status": False,
                    "message": "Сессия не найдена",
                    "error": "no_session",
                    "user_data": None,
                })
                return __ret
                
            
            user_data = run_query("""SELECT 
                    au.*,
                    ag.id as group_id,
                    ag.`name` as group_name,
                    ag.redirect_to as group_redirect_to
                FROM auth_sessions ass
                LEFT JOIN auth_users au ON au.id = ass.user_id 
                LEFT JOIN auth_groups ag ON ag.id = au.group_id
                WHERE ass.session = %ss""", args=(session, ))
            
            if len(user_data) == 0:
                __ret = function(*args, **kwargs, session_data={
                    "status": False,
                    "message": "Пользователь не найден",
                    "error": "no_user",
                    "user_data": None,
                })
                return __ret
            
            user_data = user_data[0]
            
            if not user_data["group_id"] in access_groups:
                __ret = function(*args, **kwargs, session_data={
                    "status": False,
                    "message": "Недостаточно прав",
                    "error": "no_rights",
                    "user_data": None,
                })
                return __ret
            
            __ret = function(*args, **kwargs, session_data={
                "status": True,
                "message": None,
                "error": None,
                "user_data": user_data,
            })
            return __ret

        return wrapper
    return decorator