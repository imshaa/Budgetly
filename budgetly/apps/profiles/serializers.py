from rest_framework import serializers
from .models import Profile
from datetime import date


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "id",
            "username",
            "phone_number",
            "country",
            "date_of_birth",
            "gender",
            "address",
            "residential_address",
            "currency",
            "profile_image",
            "profile_image_url",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "username"]

    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def validate_date_of_birth(self, value):
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old.")
        return value

    def update(self, instance, validated_data):
        """
        Explicitly handle update to avoid issues with dotted-source fields.
        Username is handled separately in the view since it's a dotted source.
        Only updates Profile model fields, ignoring any nested or related fields.
        """
        # List of Profile model fields that can be updated
        updateable_fields = [
            'phone_number', 'country', 'date_of_birth', 'gender',
            'address', 'residential_address', 'currency',
            'profile_image'
        ]
        
        # Update only the specified Profile fields
        for field in updateable_fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        
        instance.save()
        return instance


