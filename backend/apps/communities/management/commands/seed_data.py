from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.communities.models import Community, CommunityMembership
from apps.announcements.models import Announcement
from apps.incidents.models import IncidentReport
from apps.events.models import Event
from apps.emergency.models import SOSAlert

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial database data for CommuniKey platform'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database data...")

        # Create primary community
        community, _ = Community.objects.get_or_create(
            id=1,
            defaults={
                'community_name': 'Riverside Estate',
                'suburb': 'Riverside',
                'city': 'Pretoria',
                'province': 'Gauteng',
                'postal_code': '0002',
                'member_count': 248,
            }
        )

        # Create Users
        users_data = [
            {
                'email': 'thabo@example.com',
                'username': 'thabo',
                'first_name': 'Thabo',
                'last_name': 'Mokoena',
                'role': 'Resident',
                'address': '22 Riverside Drive, Section A',
                'phone_number': '+27 82 459 1029',
                'gate_access_code': 'GATE-KEY-8841',
                'household_vehicle': 'Silver Volkswagen Polo (Reg: AB 42 CD GP)',
            },
            {
                'email': 'admin@example.com',
                'username': 'admin',
                'first_name': 'Marcus',
                'last_name': 'Vance',
                'role': 'Estate Administrator',
                'address': '1 Clubhouse Way, Section A',
                'phone_number': '+27 82 111 2020',
                'gate_access_code': 'GATE-ADMIN-001',
                'emergency_role': 'Estate Management Office',
            },
            {
                'email': 'sarah@example.com',
                'username': 'sarah',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'role': 'Safety Volunteer',
                'address': '8 Mill Road, Section B',
                'phone_number': '+27 83 456 7890',
                'gate_access_code': 'GATE-VOL-003',
                'emergency_role': 'Neighborhood Watch / Safety Patrol',
            },
        ]

        for udata in users_data:
            user, created = User.objects.get_or_create(
                email=udata['email'],
                defaults={
                    'username': udata['username'],
                    'first_name': udata['first_name'],
                    'last_name': udata['last_name'],
                    'role': udata['role'],
                    'address': udata['address'],
                    'phone_number': udata['phone_number'],
                    'gate_access_code': udata.get('gate_access_code', 'GATE-KEY-0000'),
                }
            )
            if created:
                user.set_password('Password123!')
                user.save()
            CommunityMembership.objects.get_or_create(user=user, community=community)

        # Seed Announcements
        announcements = [
            {
                'title': 'Neighbourhood Watch general meeting',
                'content': 'The quarterly Neighbourhood Watch meeting takes place on Saturday at 10:00 in the clubhouse. Patrol schedules and the new gate access procedure will be discussed.',
                'created_by': 'Community Administrator',
                'priority': 'normal',
            },
            {
                'title': 'Planned water interruption on Tuesday',
                'content': 'The municipality will interrupt supply between 09:00 and 15:00 on Tuesday for pipe replacement work on Riverside Drive. Please store water in advance.',
                'created_by': 'Community Administrator',
                'priority': 'high',
            },
        ]
        for a in announcements:
            Announcement.objects.get_or_create(title=a['title'], defaults={'community': community, **a})

        # Seed Incidents
        incidents = [
            {
                'incident_type': 'Suspicious activity',
                'description': 'Unfamiliar vehicle parked at the corner of Riverside Drive and Mill Road for over an hour.',
                'status': 'Under review',
                'location': 'Riverside Drive',
            },
            {
                'incident_type': 'Streetlight fault',
                'description': 'Three streetlights out between house 22 and the park entrance.',
                'status': 'Reported',
                'location': 'Mill Road',
            },
        ]
        for inc in incidents:
            IncidentReport.objects.get_or_create(incident_type=inc['incident_type'], description=inc['description'], defaults={'community': community, **inc})

        # Seed Events
        events = [
            {
                'title': 'Neighbourhood Watch Briefing',
                'event_name': 'Neighbourhood Watch Briefing',
                'description': 'Quarterly briefing covering night patrol schedules and security gate access.',
                'event_date': timezone.now() + timedelta(days=3),
                'venue': 'Estate Clubhouse',
                'organiser': 'Safety Committee',
                'time': '18:30 to 19:30',
                'max_attendees': 80,
                'attendees_count': 14,
            },
            {
                'title': 'Spring Park Clean Up',
                'event_name': 'Spring Park Clean Up',
                'description': 'Bring gardening gloves and bags. Refreshments provided at the pavilion.',
                'event_date': timezone.now() + timedelta(days=9),
                'venue': 'North Park Pavilion',
                'organiser': 'Social Committee',
                'time': '08:30 to 11:00',
                'max_attendees': 60,
                'attendees_count': 28,
            },
        ]
        for ev in events:
            Event.objects.get_or_create(title=ev['title'], defaults={'community': community, **ev})

        # Seed Audit Logs
        from apps.analytics.models import AuditLog
        audit_entries = [
            {'user_name': 'Marcus Vance', 'role': 'Estate Administrator', 'action': 'ANNOUNCEMENT_PUBLISHED', 'category': 'Announcements', 'details': 'Published Neighbourhood Watch general meeting notice', 'status': 'Success'},
            {'user_name': 'Thabo Mokoena', 'role': 'Resident', 'action': 'INCIDENT_REPORTED', 'category': 'Incidents', 'details': 'Reported suspicious vehicle on Riverside Drive', 'status': 'Under Review'},
            {'user_name': 'Sarah Jenkins', 'role': 'Safety Volunteer', 'action': 'SOS_TRIGGERED', 'category': 'Emergency', 'details': 'Dispatched night patrol team to Section B', 'status': 'Resolved'},
            {'user_name': 'Kobus van der Merwe', 'role': 'Resident', 'action': 'USER_REGISTRATION', 'category': 'Membership', 'details': 'Submitted ID & Municipal Water Bill verification', 'status': 'Pending Verification'},
            {'user_name': 'Amina Patel', 'role': 'Resident', 'action': 'USER_REGISTRATION', 'category': 'Membership', 'details': 'Submitted Lease Agreement for 5 Riverside Dr', 'status': 'Pending Verification'},
        ]
        for log_data in audit_entries:
            AuditLog.objects.get_or_create(details=log_data['details'], defaults=log_data)

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully."))
