def chooseEditable(request,posts):
    for post in posts:
        if request.user.id == post["user_id"]:
            post["editable"] = "true"

    return posts