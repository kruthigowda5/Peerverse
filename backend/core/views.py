from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from django.db.models import Count
from .models import Skill, Badge, Session, Certificate, Feedback, Recommendation, CustomUser, Wishlist
from .serializers import (
    SkillSerializer,
    BadgeSerializer,
    SessionSerializer,
    CertificateSerializer,
    FeedbackSerializer,
    RecommendationSerializer,
    UserSerializer,
    RegisterSerializer,
    WishlistSerializer,
    CustomTokenObtainPairSerializer,
)


class DefaultPermission(permissions.IsAuthenticatedOrReadOnly):
    pass


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all().order_by("name")
    serializer_class = SkillSerializer
    permission_classes = [DefaultPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description", "category"]


class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all().order_by("name")
    serializer_class = BadgeSerializer
    permission_classes = [DefaultPermission]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated], url_path="mine")
    def mine(self, request):
        user = request.user
        qs = user.badges.all().order_by("name")
        page = self.paginate_queryset(qs)
        if page is not None:
            ser = self.get_serializer(page, many=True)
            return self.get_paginated_response(ser.data)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)


class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.select_related("user", "session", "session__created_by")
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.select_related("session", "session__created_by").filter(user=self.request.user)

    @action(detail=False, methods=["get"], url_path="mine")
    def mine(self, request):
        qs = self.get_queryset()
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)

    @action(detail=False, methods=["post"], url_path="add")
    def add(self, request):
        session_id = request.data.get("session") or request.data.get("session_id")
        if not session_id:
            return Response({"error": "Session ID required"}, status=status.HTTP_400_BAD_REQUEST)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user, session_id=session_id)
        if not created:
            return Response({"message": "Already in wishlist"}, status=status.HTTP_200_OK)
        return Response(self.get_serializer(wishlist).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="remove")
    def remove(self, request):
        session_id = request.data.get("session") or request.data.get("session_id")
        if not session_id:
            return Response({"error": "Session ID required"}, status=status.HTTP_400_BAD_REQUEST)
        Wishlist.objects.filter(user=request.user, session_id=session_id).delete()
        return Response({"message": "Removed from wishlist"}, status=status.HTTP_200_OK)


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.select_related("skill", "created_by").prefetch_related("participants")
    serializer_class = SessionSerializer
    permission_classes = [DefaultPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description", "skill__name"]

    def get_queryset(self):
        qs = super().get_queryset()
        skill_id = self.request.query_params.get("skill")
        if skill_id:
            qs = qs.filter(skill_id=skill_id)
        created_by = self.request.query_params.get("created_by")
        if created_by:
            qs = qs.filter(created_by_id=created_by)
        return qs

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated], url_path="mine")
    def mine(self, request):
        user = request.user
        qs = (
            Session.objects.select_related("skill", "created_by")
            .prefetch_related("participants")
            .filter(created_by=user)
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            ser = self.get_serializer(page, many=True)
            return self.get_paginated_response(ser.data)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)

    @action(detail=True, methods=["post"], url_path="upload_video")
    def upload_video(self, request, pk=None):
        session = self.get_object()
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        if not (user.is_staff or session.created_by_id == user.id):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        file = request.FILES.get("video")
        if not file:
            return Response({"detail": "No file uploaded. Use 'video' field."}, status=status.HTTP_400_BAD_REQUEST)
        session.recording_file = file
        session.is_recorded = True
        session.save()
        # Provide absolute URL if possible
        file_url = getattr(session.recording_file, 'url', None)
        if file_url and request:
            try:
                file_url = request.build_absolute_uri(file_url)
            except Exception:
                pass
        return Response({
            "id": str(session.id),
            "recording_file": file_url,
            "is_recorded": session.is_recorded,
        })


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.select_related("user", "skill")
    serializer_class = CertificateSerializer
    permission_classes = [DefaultPermission]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated], url_path="mine")
    def mine(self, request):
        user = request.user
        # NOTE: Current model lacks an issuer/mentor field; this returns certificates owned by the user.
        qs = Certificate.objects.select_related("user", "skill").filter(user=user)
        page = self.paginate_queryset(qs)
        if page is not None:
            ser = self.get_serializer(page, many=True)
            return self.get_paginated_response(ser.data)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.select_related("session", "given_by")
    serializer_class = FeedbackSerializer
    permission_classes = [DefaultPermission]


class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.select_related("user", "suggested_skill")
    serializer_class = RecommendationSerializer
    permission_classes = [DefaultPermission]


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [DefaultPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get("role")
        if role:
            # Map potential consumer term 'mentor' to our 'sharer' role if needed
            if role.lower() == "mentor":
                role = "sharer"
            qs = qs.filter(role=role)
        return qs


class MenteeViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [DefaultPermission]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated], url_path="mine")
    def mine(self, request):
        mentor = request.user
        mentees = CustomUser.objects.filter(sessions_joined__created_by=mentor).distinct()
        page = self.paginate_queryset(mentees)
        if page is not None:
            ser = self.get_serializer(page, many=True)
            return self.get_paginated_response(ser.data)
        ser = self.get_serializer(mentees, many=True)
        return Response(ser.data)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user: CustomUser = request.user
        points = user.points
        badges = list(user.badges.values("id", "name"))
        sessions_created = user.sessions_created.count()
        sessions_joined = user.sessions_joined.count()
        skills_known = list(user.skills_known.values_list("name", flat=True))
        skills_to_learn = list(user.skills_to_learn.values_list("name", flat=True))
        # Distinct mentees taught by this mentor (participants in sessions created by the user)
        total_mentees = (
            CustomUser.objects.filter(sessions_joined__created_by=user).distinct().count()
        )

        # Simple sample stats for charts
        stats = {
            "weekly_learning_hours": [
                {"day": "Mon", "hours": 1.5},
                {"day": "Tue", "hours": 0.5},
                {"day": "Wed", "hours": 2.0},
                {"day": "Thu", "hours": 1.0},
                {"day": "Fri", "hours": 0.0},
                {"day": "Sat", "hours": 2.5},
                {"day": "Sun", "hours": 1.0},
            ],
            "top_skills": [
                {"skill": s, "value": 1} for s in skills_known[:5]
            ],
        }

        return Response(
            {
                "role": user.role,
                "points": points,
                "badges": badges,
                "sessions_created": sessions_created,
                "sessions_joined": sessions_joined,
                "total_mentees": total_mentees,
                "skills_known": skills_known,
                "skills_to_learn": skills_to_learn,
                "stats": stats,
            }
        )

# Create your views here.


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MentorMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user: CustomUser = request.user
        # Consider mentor if role is mentor/sharer/both
        role = (user.role or "").lower()
        is_mentor = role in {"mentor", "sharer", "both"}
        if not is_mentor:
            return Response({"detail": "Not a mentor"}, status=status.HTTP_403_FORBIDDEN)

        # Sum hours taught based on sessions created durations
        sessions = Session.objects.filter(created_by=user)
        total_seconds = 0
        for s in sessions:
            try:
                if s.start_time and s.end_time:
                    delta = s.end_time - s.start_time
                    total_seconds += max(0, int(delta.total_seconds()))
            except Exception:
                pass
        total_hours = int(round(total_seconds / 3600))

        avatar_url = None
        try:
            if user.profile_picture:
                avatar_url = user.profile_picture.url
                try:
                    avatar_url = request.build_absolute_uri(avatar_url)
                except Exception:
                    pass
        except Exception:
            avatar_url = None

        return Response({
            "username": user.username,
            "role": user.role,
            "avatar_url": avatar_url,
            "total_hours_taught": total_hours,
        })
