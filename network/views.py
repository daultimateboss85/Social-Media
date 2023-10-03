from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post, Follow, Likes


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def posts(request,batch):
    #get all posts
    posts = Post.objects.all().order_by("-time")

    #make sure batch is in range
    if batch < 0:
        batch = 0
    
    max_batch = len(posts) // 10

    if batch * 10 > max_batch:
        batch = max_batch

    #implementing pagination by selecting batch of posts and displaying those in the batch
    return JsonResponse([post.serialize() for post in posts[batch*10:batch*10+10]], safe=False)

def bposts(request,anyother):
    """takes care of bad post arguments"""
    return HttpResponseRedirect(reverse("posts",args=[0]))

def max_batch(request, postgroup):
    """Returns max batch for a given postgroup #api route"""
    if postgroup == "all":
        return JsonResponse({"count":Post.objects.count() // 10}, safe=False)
    
def userdata(request, id):
    """Returns data about user with id id"""
    
    try:
        user = User.objects.get(pk=id) 
    except:
        return JsonResponse({"error":"invalid user"}, status=400)
    
    #get followers and following
    followers = Follow.objects.filter(followed=user).count()
    followed = Follow.objects.filter(follower=user).count()


    return JsonResponse({"username":user.username,"followers":followers,"followed":followed})

