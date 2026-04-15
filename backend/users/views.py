import datetime
import json
import jwt
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt


def _issue_token(user):
    payload = {
        'user_id':  user.id,
        'username': user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        username = data.get('username', '').strip()
        password = data.get('password', '')
        if not username or not password:
            return JsonResponse({'error': 'username and password required.'}, status=400)

        user = authenticate(username=username, password=password)
        if not user:
            return JsonResponse({'error': 'Invalid credentials.'}, status=401)
        return JsonResponse({'token': _issue_token(user), 'username': user.username})


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        username = data.get('username', '').strip()
        password = data.get('password', '')

        errors = {}
        if len(username) < 3:
            errors['username'] = 'Username must be at least 3 characters.'
        if len(password) < 6:
            errors['password'] = 'Password must be at least 6 characters.'
        if errors:
            return JsonResponse({'errors': errors}, status=422)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': f'Username "{username}" is already taken.'}, status=409)

        user = User.objects.create_user(username=username, password=password)
        return JsonResponse({'token': _issue_token(user), 'username': user.username}, status=201)
