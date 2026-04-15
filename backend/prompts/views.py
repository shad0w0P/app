import json
import logging

from django.conf import settings
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from users.utils import require_auth
from .models import Prompt, Tag

logger = logging.getLogger(__name__)

# ── Redis (optional — graceful fallback for local dev without Redis) ────────────
try:
    import redis as redis_lib
    _redis = redis_lib.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
    _redis.ping()
    _REDIS_OK = True
except Exception:
    _redis = None
    _REDIS_OK = False
    logger.warning("Redis unavailable — view counts disabled.")


def _view_key(pid): return f'prompt:views:{pid}'

def increment_view(pid):
    if not _REDIS_OK:
        return 0
    try:
        return int(_redis.incr(_view_key(pid)))
    except Exception:
        return 0


@method_decorator(csrf_exempt, name='dispatch')
class PromptListView(View):

    def get(self, request):
        tag_name = request.GET.get('tag', '').strip()
        qs = Prompt.objects.prefetch_related('tags').order_by('-created_at')
        if tag_name:
            qs = qs.filter(tags__name__iexact=tag_name)
        return JsonResponse([p.to_dict() for p in qs], safe=False)

    def post(self, request):
        err = require_auth(request)
        if err:
            return err

        try:
            data = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        title      = str(data.get('title',      '')).strip()
        content    = str(data.get('content',    '')).strip()
        complexity = data.get('complexity')
        tag_names  = data.get('tags', [])

        errors = {}
        if len(title) < 3:
            errors['title'] = 'Title must be at least 3 characters.'
        if len(content) < 20:
            errors['content'] = 'Content must be at least 20 characters.'
        if not isinstance(complexity, int) or not (1 <= complexity <= 10):
            errors['complexity'] = 'Complexity must be an integer between 1 and 10.'
        if not isinstance(tag_names, list):
            errors['tags'] = 'Tags must be a list of strings.'
        if errors:
            return JsonResponse({'errors': errors}, status=422)

        prompt = Prompt.objects.create(title=title, content=content, complexity=complexity)
        for raw in tag_names:
            cleaned = str(raw).strip().lower()
            if cleaned:
                tag, _ = Tag.objects.get_or_create(name=cleaned)
                prompt.tags.add(tag)

        return JsonResponse(prompt.to_dict(), status=201)


@method_decorator(csrf_exempt, name='dispatch')
class PromptDetailView(View):

    def get(self, request, pk):
        try:
            prompt = Prompt.objects.prefetch_related('tags').get(pk=pk)
        except Prompt.DoesNotExist:
            return JsonResponse({'error': 'Not found'}, status=404)
        return JsonResponse(prompt.to_dict(view_count=increment_view(pk)))


@method_decorator(csrf_exempt, name='dispatch')
class TagListView(View):

    def get(self, request):
        return JsonResponse(
            [t.to_dict() for t in Tag.objects.all().order_by('name')],
            safe=False,
        )
