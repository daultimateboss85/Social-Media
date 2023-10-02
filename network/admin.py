from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, Likes, Follow, Post
# Register your models here.

admin.site.register(User, UserAdmin)
admin.site.register(Likes)
admin.site.register(Follow)
admin.site.register(Post)
