import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from .extrahelp import chooseEditable
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
    
    max_batch = (len(posts)-1) // 10

    if batch > max_batch:
        batch = max_batch

    #implementing pagination by selecting batch of posts and displaying those in the batch
    posts = [post.serialize() for post in posts[batch*10:batch*10+10]]
    
    #choosing posts that are editable
    posts = chooseEditable(request,posts)

    return JsonResponse({"posts":posts,
                         "batch":batch}, safe=False)

def bposts(request,anyother):
    """takes care of bad post arguments"""
    return HttpResponseRedirect(reverse("posts",args=[0]))

def userdata(request, id):
    """Returns data about user with id id"""
    try:
        user = User.objects.get(pk=id) 
    except:
        return JsonResponse({"error":"invalid user"}, status=400)
    
    #get followers and following
    followers = Follow.objects.filter(followed=user).count()
    followed = Follow.objects.filter(follower=user).count()

    return JsonResponse({"username":user.username,"followers":followers,"followed":followed, "id":user.id})

def catposts(request, category, id, batch):
    """Returns batch of specified category of posts"""

    #if posts for a specific user
    if category == "user":
        posts = Post.objects.filter(user__id=int(id)).order_by("-time")
    
    #if posts for a feed 
    elif category == "feed":
        followed = Follow.objects.filter(follower__id=request.user.id)
        posts = Post.objects.filter(user__id__in=[person.followed.id for person in followed]).order_by("-time")

    #make sure batch is in range
    if batch < 0:
        batch = 0
    
    max_batch = (len(posts)-1) // 10

    if batch > max_batch:
        batch = max_batch

    #implementing pagination by selecting batch of posts and displaying those in the batch
    posts = [post.serialize() for post in posts[batch*10:batch*10+10]]

    #choosing posts that are editable
    posts = chooseEditable(request,posts)

    return JsonResponse({"posts":posts,
                         "batch":batch}, safe=False)

@csrf_exempt
def likes(request, post_id, action):
    """Like a post"""
    if request.method == "POST":
    #if user triggers like then create like with post being the post liked and user user that liked
        
        try:
            to_like = Post.objects.get(pk=post_id)
            user = request.user

        except:
            return JsonResponse({"error":"Invalid request"}, safe=False)
        #like a post
        if action == "like":
            try:
                already_liked = Likes.objects.get(user=user, post=to_like)
                already_liked.delete()
                num_likes = Likes.objects.filter(post=to_like).count()
                return JsonResponse({"liked":"false","num_likes":num_likes}, safe=False)
            except:
                like = Likes(user=user, post=to_like)
                like.save()
                num_likes = Likes.objects.filter(post=to_like).count()
                return JsonResponse({"liked":"true","num_likes":num_likes},safe=False)

        #dislike a post
        #    elif action =="dislike":
        #       try:
        #          liked = Likes.objects.get(user=user, post=to_like)
        #         liked.delete()
            #        return JsonResponse({"liked":"false"},safe=False)
            #   except:
            #      return JsonResponse({"error":"no can do"}, safe=False)
        
                
        elif action == "check":
            num_likes = Likes.objects.filter(post=to_like).count()
            try:
                liked = Likes.objects.get(user=user, post=to_like)
                return JsonResponse({"liked":"true","num_likes":num_likes}, safe=False)
            except:
                return JsonResponse({"liked":"false", "num_likes":num_likes},safe=False)

    return JsonResponse({"error":"bad request"},safe=False)

@csrf_exempt
def post(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if request.user.is_authenticated:
            new_post = Post(user=request.user, text=data["text"])
            new_post.save()
            return HttpResponseRedirect(reverse("posts",args=[0]))
        
        else:
             return JsonResponse({"error":"user not signed in"}, safe=False)
    
def verify(request, user_id):
    """Check if request maker is same as user with user_id"""
    #also checks if signed in user follows user with id user_id
    if request.user.id == user_id:
        return JsonResponse({"same":"true"},safe=False)
    

    #check if follows
    try:
        follow = Follow.objects.get(follower=request.user, followed__id=user_id)
        return JsonResponse({"same":"false", "follow":"true"},safe=False)
    except:
        return JsonResponse({"same":"false", "follow":"false"},safe=False)
    
@csrf_exempt
def following(request, user_id):
    """Follow or unfollow a user depeneding on current following status"""
    if request.method=="POST":
        try:
            #unfollow if already follows
            follow = Follow.objects.get(follower=request.user, followed__id=user_id)
            follow.delete()
        except:
            #follow if not
            follow = Follow(follower=request.user, followed=User.objects.get(pk=user_id))
            follow.save()
        return JsonResponse({"success":"user followed"},safe=False)
    
    return JsonResponse({"error":"invalid request method"}, safe=False)

@csrf_exempt
def edit(request,post_id):
    if request.method == "POST":
        print(request.POST["text"])
        try: 
            post = Post.objects.get(pk=post_id)
            post.text = request.POST["text"]
            post.save()
            return JsonResponse({"success":"post update"})
        except:
            return JsonResponse({"error":"post with id doesnt exist"}, safe=False)
    return JsonResponse({"error":"post with id doesnt exist"}, safe=False)