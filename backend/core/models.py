from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
import uuid


class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)

    ROLE_CHOICES = (
        ("learner", "Learner"),
        ("sharer", "Sharer"),
        ("both", "Both"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="both")
    points = models.IntegerField(default=0)
    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100)
    popularity_score = models.FloatField(default=0.0)

    def __str__(self):
        return self.name


class Badge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to="badges/", blank=True, null=True)
    criteria = models.TextField()

    def __str__(self):
        return self.name


# ManyToMany relations after both models are defined
CustomUser.add_to_class("skills_known", models.ManyToManyField(Skill, related_name="users_who_know", blank=True))
CustomUser.add_to_class("skills_to_learn", models.ManyToManyField(Skill, related_name="users_who_want", blank=True))
CustomUser.add_to_class("badges", models.ManyToManyField(Badge, related_name="users_with_badge", blank=True))


class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions_created")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="sessions")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    meeting_link = models.URLField()
    is_recorded = models.BooleanField(default=False)
    recording_url = models.URLField(blank=True, null=True)
    recording_file = models.FileField(upload_to="recordings/", blank=True, null=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="sessions_joined", blank=True)

    def __str__(self):
        return f"{self.title} ({self.skill.name})"


class Certificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certificates")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="certificates")
    issue_date = models.DateField(default=timezone.now)
    certificate_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    pdf_url = models.URLField(blank=True, null=True)
    qr_code_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Certificate {self.certificate_id}"


class Feedback(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="feedback")
    given_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="feedback_given")
    rating = models.IntegerField()
    comment = models.TextField(blank=True)

    def __str__(self):
        return f"Feedback {self.rating} for {self.session.title}"


class Recommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recommendations")
    suggested_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="recommendations")
    confidence_score = models.FloatField(default=0.0)

    def __str__(self):
        return f"Rec {self.user} -> {self.suggested_skill} ({self.confidence_score})"


class Wishlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist")
    session = models.ForeignKey('Session', on_delete=models.CASCADE, related_name="wishlisted_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "session")

    def __str__(self):
        return f"{self.user.username} - {self.session.title}"
