from django.urls import path, include

urlpatterns = [
    path('api/prompts/', include('prompts.urls')),
    path('api/auth/',    include('users.urls')),
]
