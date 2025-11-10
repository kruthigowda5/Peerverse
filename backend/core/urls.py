from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import CustomTokenObtainPairView, MentorMeView
from .views import (
    SkillViewSet,
    BadgeViewSet,
    SessionViewSet,
    CertificateViewSet,
    FeedbackViewSet,
    RecommendationViewSet,
    UserViewSet,
    MenteeViewSet,
    WishlistViewSet,
    RegisterView,
    DashboardView,
)

router = DefaultRouter()
router.register(r"skills", SkillViewSet)
router.register(r"badges", BadgeViewSet)
router.register(r"sessions", SessionViewSet)
router.register(r"certificates", CertificateViewSet)
router.register(r"feedback", FeedbackViewSet)
router.register(r"recommendations", RecommendationViewSet)
router.register(r"users", UserViewSet)
router.register(r"mentees", MenteeViewSet, basename="mentee")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")

urlpatterns = [
    # Required endpoints
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("mentors/me/", MentorMeView.as_view(), name="mentor_me"),

    # Also expose standard JWT paths
    path("auth/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
]
