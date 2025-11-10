from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Skill, Badge, Session, Certificate, Feedback, Recommendation


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("username", "email", "role", "points", "is_staff")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    fieldsets = (
        (None, {"fields": ("username", "password")} ),
        ("Personal info", {"fields": ("first_name", "last_name", "email", "bio", "profile_picture")} ),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")} ),
        ("Important dates", {"fields": ("last_login", "date_joined")} ),
        ("Peerverse", {"fields": ("role", "points", "skills_known", "skills_to_learn", "badges")} ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2", "role", "is_staff", "is_superuser"),
            },
        ),
    )
    search_fields = ("username", "email")
    ordering = ("username",)


admin.site.register(Skill)
admin.site.register(Badge)
admin.site.register(Session)
admin.site.register(Certificate)
admin.site.register(Feedback)
admin.site.register(Recommendation)

# Register your models here.
