from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Follow(models.Model):
    follower = models.OneToOneField(User,on_delete=models.CASCADE, related_name="follower")
    followed = models.OneToOneField(User, on_delete=models.CASCADE, related_name="followed")

    def __str__(self):
        return f"{self.follower} follows {self.followed}"
    
class Post(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    time = models.DateTimeField(auto_now_add=True)
    text = models.TextField()

    def __str__(self):
        return f"{self.text} by {self.user}"

class Likes(models.Model):
    post = models.ForeignKey(Post,on_delete=models.CASCADE)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user} likes {self.post}"