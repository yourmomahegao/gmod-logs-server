"""
Security utilities for API__Database
"""
import re
import html
import json
from datetime import datetime, date, time
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from functools import wraps

def validate_rfid(rfid):
    """Validate RFID format to prevent injection"""
    if not rfid or not isinstance(rfid, str):
        return False
    # RFID should only contain alphanumeric characters and hyphens
    return bool(re.match(r'^[A-Za-z0-9\-]+$', rfid) and len(rfid) <= 20)

def validate_barcode(barcode):
    """Validate barcode format"""
    if not barcode or not isinstance(barcode, str):
        return False
    # Allow alphanumeric, hyphens, and underscores, max 50 chars
    return bool(re.match(r'^[A-Za-z0-9\-_]+$', barcode) and len(barcode) <= 50)

def validate_integer_id(value):
    """Validate integer ID parameters"""
    if value is None:
        return True  # Allow None for optional parameters
    try:
        int_val = int(value)
        return 0 <= int_val <= 2147483647  # Valid 32-bit integer range
    except (ValueError, TypeError):
        return False

def secure_api_endpoint(validate_params=None):
    """
    Decorator to add security validation to API endpoints
    
    Args:
        validate_params: dict of parameter names and their validation functions
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Basic security checks
            if request.method not in ['GET', 'POST']:
                return SafeJsonResponse({"status": False, "message": "Method not allowed"})
            
            # Validate specified parameters
            if validate_params:
                data = request.POST if request.method == 'POST' else request.GET
                for param_name, validator in validate_params.items():
                    param_value = data.get(param_name)
                    if param_value and not validator(param_value):
                        return SafeJsonResponse({
                            "status": False, 
                            "message": f"Invalid parameter format: {param_name}"
                        })
            
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

def sanitize_description(description):
    """Sanitize description field to prevent injection"""
    if not description:
        return None
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\';\\]', '', str(description))
    return sanitized[:500]  # Limit length

def sanitize_additional_info(additional_info):
    """Sanitize additional_info field"""
    if not additional_info:
        return None
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\';\\]', '', str(additional_info))
    return sanitized[:1000]  # Limit length

def escape_value(value):
    """
    Recursively escape all string values in data structures using html.escape()
    Handles dict, list, tuple, and string types.
    """
    if isinstance(value, str):
        return html.escape(value)
    elif isinstance(value, dict):
        return {key: escape_value(val) for key, val in value.items()}
    elif isinstance(value, (list, tuple)):
        escaped_list = [escape_value(item) for item in value]
        return escaped_list if isinstance(value, list) else tuple(escaped_list)
    else:
        # Return other types (int, bool, None, float, etc.) unchanged
        return value


class SafeJsonEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles datetime objects"""
    def default(self, obj):
        if isinstance(obj, (datetime, date, time)):
            return obj.isoformat()
        return super().default(obj)


class SafeJsonResponse(JsonResponse):
    """
    Extended JsonResponse that automatically escapes all string values
    to prevent XSS attacks. All values sent to the client are escaped
    using html.escape().
    
    Example:
        return SafeJsonResponse({"message": "<script>alert('xss')</script>"})
        *Returns: {"message": "&lt;script&gt;alert('xss')&lt;/script&gt;"}*
    """
    
    def __init__(self, data=None, encoder=None, safe=False, json_dumps_params=None, **kwargs):
        # Escape all string values in the data
        if data is not None:
            data = escape_value(data)
        
        if encoder is None:
            encoder = SafeJsonEncoder
        
        super().__init__(
            data=data,
            encoder=encoder,
            safe=safe,
            json_dumps_params=json_dumps_params,
            **kwargs
        )