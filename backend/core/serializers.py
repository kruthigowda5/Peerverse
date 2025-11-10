from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Skill, Badge, Session, Certificate, Feedback, Recommendation, CustomUser, Wishlist


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    skills_known = SkillSerializer(many=True, read_only=True)
    skills_to_learn = SkillSerializer(many=True, read_only=True)
    badges = BadgeSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "points",
            "bio",
            "profile_picture",
            "skills_known",
            "skills_to_learn",
            "badges",
        ]
        read_only_fields = ["id", "points"]


class SessionSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Session
        fields = "__all__"


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = "__all__"


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = "__all__"


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ["username", "email", "password", "role"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class WishlistSerializer(serializers.ModelSerializer):
    session_title = serializers.CharField(source="session.title", read_only=True)
    mentor_name = serializers.CharField(source="session.created_by.username", read_only=True)

    class Meta:
        model = Wishlist
        fields = ["id", "session", "session_title", "mentor_name", "created_at"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Optional: include role/username in JWT claims for later use
        role = getattr(user, "role", None)
        if role is not None:
            token["role"] = role
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = {
            "username": user.username,
            "role": getattr(user, "role", None),
        }
        return data
