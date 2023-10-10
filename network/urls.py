
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),


    #API routes
    #api should be able to get all posts
    path("posts/<int:batch>", views.posts, name="posts"),
    path("posts/<str:anyother>", views.bposts, name="bposts"), #takes care of requesting for wrong post batch
    
    path("postpost", views.post, name="post"), #post a post

    path("posts/<str:category>/<str:id>/<int:batch>", views.catposts, name="catposts"), #takes care of requesting for posts of specific user or posts on feed

    path("userdata/<int:id>", views.userdata, name="userdata"), #getting user data ie follows, followers, name
    path("<int:post_id>/<str:action>", views.likes, name="likes"), #liking, disliking and checking for likes on posts
    
    path("verify/<int:user_id>", views.verify, name="verify"), # verify if a user is thhe same as the one to be displayed
    path("following/<int:user_id>", views.following, name="following"), #follow/ unfollow a user
    
    path("edit/<int:post_id>", views.edit, name="edit") #edit a post made by user
    ]
