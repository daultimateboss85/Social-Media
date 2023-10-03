
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
    path("posts/<str:category>/<int:batch>/<int:id>", views.bposts, name="bposts"), #takes care of requesting for wrong post batch
    path("max_batch/<str:postgroup>", views.max_batch, name="maxbatch"), #get max batch of posts
   
    path("userdata/<int:id>", views.userdata, name="userdata") #getting user data ie follows, followers, name
    
    
    ]
