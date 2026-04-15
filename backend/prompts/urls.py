from django.urls import path
from . import views

urlpatterns = [
    path('tags/', views.TagListView.as_view(),   name='tag-list'),
    path('',      views.PromptListView.as_view(), name='prompt-list'),
    path('<int:pk>/', views.PromptDetailView.as_view(), name='prompt-detail'),
]
