import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "peerverse.settings")
django.setup()

from django.contrib.auth import get_user_model

username = os.getenv("SU_USERNAME", "admin")
email = os.getenv("SU_EMAIL", "admin@example.com")
password = os.getenv("SU_PASSWORD", "Admin123!")

User = get_user_model()
user, created = User.objects.get_or_create(username=username, defaults={"email": email})
user.email = email
user.is_superuser = True
user.is_staff = True
user.set_password(password)
user.save()
print("created" if created else "updated")
