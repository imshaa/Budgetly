from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Profile
from .serializers import ProfileSerializer


# ── GET PROFILE ───────────────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        return Response({"error": "Profile not found."}, status=404)

    serializer = ProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)


# ── CREATE PROFILE ────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_profile(request):
    if Profile.objects.filter(user=request.user).exists():
        return Response({"error": "Profile already exists. Use the update endpoint."}, status=400)

    serializer = ProfileSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        # Update username in User model if provided
        username = request.data.get('username')
        if username:
            request.user.username = username
            request.user.save()
        serializer.save(user=request.user)
        response_serializer = ProfileSerializer(serializer.instance, context={'request': request})
        return Response({"message": "Profile created successfully.", "data": response_serializer.data}, status=201)

    return Response({"error": serializer.errors}, status=400)


# ── UPDATE PROFILE ────────────────────────────────────────────────────────────
@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile(request):
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        return Response({"error": "Profile not found. Create one first."}, status=404)

    serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})

    if serializer.is_valid():
        # Update username in User model if provided
        username = request.data.get('username')
        if username:
            request.user.username = username
            request.user.save()
        serializer.save()
        response_serializer = ProfileSerializer(serializer.instance, context={'request': request})
        return Response({"message": "Profile updated successfully.", "data": response_serializer.data})

    return Response({"error": serializer.errors}, status=400)





# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from .models import Profile
# from .serializers import ProfileSerializer
# from apps.accounts.models import User


# # CREATE PROFILE
# @api_view(["POST"])
# def create_profile(request):
#     # user = request.user  # later will come from auth
#     user = User.objects.first()

#     if Profile.objects.filter(user=user).exists():
#         return Response({"error": "Profile already exists"})

#     serializer = ProfileSerializer(data=request.data)

#     if serializer.is_valid():
#         serializer.save(user=user)
#         return Response({"message": "Profile created", "data": serializer.data})

#     return Response(serializer.errors)


# # GET PROFILE
# @api_view(["GET"])
# def get_profile(request):
#     user = request.user

#     try:
#         profile = Profile.objects.get(user=user)
#     except Profile.DoesNotExist:
#         return Response({"error": "Profile not found"})

#     serializer = ProfileSerializer(profile)
#     return Response(serializer.data)


# # UPDATE PROFILE
# @api_view(["PUT"])
# def update_profile(request):
#     user = request.user

#     try:
#         profile = Profile.objects.get(user=user)
#     except Profile.DoesNotExist:
#         return Response({"error": "Profile not found"})

#     serializer = ProfileSerializer(profile, data=request.data, partial=True)

#     if serializer.is_valid():
#         serializer.save()
#         return Response({"message": "Profile updated", "data": serializer.data})

#     return Response(serializer.errors)