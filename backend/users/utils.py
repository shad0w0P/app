import jwt
from django.conf import settings
from django.http import JsonResponse


def require_auth(request):
    header = request.META.get('HTTP_AUTHORIZATION', '')
    if not header.startswith('Bearer '):
        return JsonResponse({'error': 'Authentication required.'}, status=401)
    token = header[7:]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token expired.'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token.'}, status=401)
    request.user_payload = payload
    return None
