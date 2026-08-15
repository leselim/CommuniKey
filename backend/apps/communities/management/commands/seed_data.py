import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from apps.communities.models import Community, CommunityMembership, FeedPost, Comment
from apps.announcements.models import Announcement
from apps.incidents.models import Incident
from apps.events.models import Event, EventRSVP
from apps.emergency.models import SOSAlert
from apps.services.models import LostAndFoundItem, ServiceProvider

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic South African mock data (Pinelands, Cape Town, Western Cape)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting South African community data seed...'))

        # 1. Create Users
        users_data = [
            {
                'email': 'pinelands.admin@communitycloud.co.za',
                'username': 'pinelands_admin',
                'first_name': 'Sibusiso',
                'last_name': 'Dlamini',
                'phone_number': '+27 82 451 9021',
                'address': '14 Howard Drive, Pinelands, Cape Town',
                'role': 'COMMUNITY_ADMIN'
            },
            {
                'email': 'thabo.mokoena@communitycloud.co.za',
                'username': 'thabo_mokoena',
                'first_name': 'Thabo',
                'last_name': 'Mokoena',
                'phone_number': '+27 71 892 3341',
                'address': '28 Forest Drive, Pinelands, Cape Town',
                'role': 'SAFETY_VOLUNTEER'
            },
            {
                'email': 'fatima.patel@communitycloud.co.za',
                'username': 'fatima_patel',
                'first_name': 'Fatima',
                'last_name': 'Patel',
                'phone_number': '+27 83 219 7780',
                'address': '5 Central Avenue, Pinelands, Cape Town',
                'role': 'RESIDENT'
            },
            {
                'email': 'johan.vandermerwe@communitycloud.co.za',
                'username': 'johan_vdm',
                'first_name': 'Johan',
                'last_name': 'van der Merwe',
                'phone_number': '+27 84 551 2290',
                'address': '42 Main Road, Rondebosch, Cape Town',
                'role': 'COMMUNITY_ADMIN'
            },
            {
                'email': 'nomvula.khumalo@communitycloud.co.za',
                'username': 'nomvula_k',
                'first_name': 'Nomvula',
                'last_name': 'Khumalo',
                'phone_number': '+27 76 340 8812',
                'address': '12 Victoria Road, Woodstock, Cape Town',
                'role': 'RESIDENT'
            },
            {
                'email': 'willem.coetzee@communitycloud.co.za',
                'username': 'willem_coetzee',
                'first_name': 'Willem',
                'last_name': 'Coetzee',
                'phone_number': '+27 82 990 1145',
                'address': '8 Beach Road, Sea Point, Cape Town',
                'role': 'SAFETY_VOLUNTEER'
            },
            {
                'email': 'anika.abrahams@communitycloud.co.za',
                'username': 'anika_abrahams',
                'first_name': 'Anika',
                'last_name': 'Abrahams',
                'phone_number': '+27 79 412 6630',
                'address': '19 Bougainvilla Way, Century City, Cape Town',
                'role': 'RESIDENT'
            }
        ]

        created_users = []
        for udata in users_data:
            user, created = User.objects.get_or_create(
                email=udata['email'],
                defaults={
                    'username': udata['username'],
                    'first_name': udata['first_name'],
                    'last_name': udata['last_name'],
                    'phone_number': udata['phone_number'],
                    'address': udata['address'],
                    'role': udata['role']
                }
            )
            if created:
                user.set_password('Password123!')
                user.save()
                self.stdout.write(f"  Created user: {user.email}")
            created_users.append(user)

        admin_user = created_users[0]
        thabo_user = created_users[1]
        fatima_user = created_users[2]
        johan_user = created_users[3]

        # 2. Create Western Cape Communities
        communities_data = [
            {
                'name': 'Pinelands Neighborhood Watch & Community Alliance',
                'description': 'Official community platform for Pinelands residents. Stay updated on safety alerts, local civic news, municipal water & power updates, and community events.',
                'province': 'Western Cape',
                'city': 'Cape Town',
                'suburb': 'Pinelands',
                'postal_code': '7405',
                'community_type': 'RESIDENTIAL',
                'created_by': admin_user
            },
            {
                'name': 'Rondebosch Safety Initiative',
                'description': 'Active resident network for safety, crime prevention, and community welfare in Rondebosch & surrounds.',
                'province': 'Western Cape',
                'city': 'Cape Town',
                'suburb': 'Rondebosch',
                'postal_code': '7700',
                'community_type': 'RESIDENTIAL',
                'created_by': johan_user
            },
            {
                'name': 'Woodstock & Observatory Ratepayers Alliance',
                'description': 'Community watch, local business directory, and civic development forum for Woodstock and Observatory.',
                'province': 'Western Cape',
                'city': 'Cape Town',
                'suburb': 'Woodstock',
                'postal_code': '7925',
                'community_type': 'RESIDENTIAL',
                'created_by': created_users[4]
            },
            {
                'name': 'Sea Point Promenade & Coastal Alliance',
                'description': 'Resident safety group, environmental ocean cleanups, and local notices for Sea Point and Green Point.',
                'province': 'Western Cape',
                'city': 'Cape Town',
                'suburb': 'Sea Point',
                'postal_code': '8005',
                'community_type': 'APARTMENT',
                'created_by': created_users[5]
            },
            {
                'name': 'Century City Resident Security Alliance',
                'description': 'Connected ecosystem for Century City apartment complexes and business park safety monitoring.',
                'province': 'Western Cape',
                'city': 'Cape Town',
                'suburb': 'Century City',
                'postal_code': '7441',
                'community_type': 'BUSINESS',
                'created_by': created_users[6]
            }
        ]

        created_communities = []
        for cdata in communities_data:
            comm, created = Community.objects.get_or_create(
                name=cdata['name'],
                defaults=cdata
            )
            if created:
                self.stdout.write(f"  Created community: {comm.name}")
            created_communities.append(comm)

        pinelands_comm = created_communities[0]
        rondebosch_comm = created_communities[1]

        # 3. Create Community Memberships
        for comm in created_communities:
            for u in created_users:
                role = 'COMMUNITY_ADMIN' if u == comm.created_by else ('SAFETY_VOLUNTEER' if u.role == 'SAFETY_VOLUNTEER' else 'RESIDENT')
                CommunityMembership.objects.get_or_create(
                    community=comm,
                    user=u,
                    defaults={'status': 'APPROVED', 'role': role}
                )

        # 4. Create Announcements
        announcements_data = [
            {
                'community': pinelands_comm,
                'created_by': admin_user,
                'title': 'City of Cape Town Scheduled Water Maintenance Notice - Pinelands Suburb',
                'content': 'Please be advised that City Water & Sanitation will perform pipe upgrades along Howard Drive and Forest Drive on Thursday between 09:00 and 16:00. Water supply may experience reduced pressure. Please store clean water in advance.',
                'is_pinned': True
            },
            {
                'community': pinelands_comm,
                'created_by': thabo_user,
                'title': 'Pinelands Neighborhood Watch Night Patrol Rota - August 2026',
                'content': 'Thank you to all volunteer patrollers! The August night patrol schedule has been posted. We are still looking for 2 extra volunteers for Friday midnight shifts. Please contact Thabo Mokoena if available.',
                'is_pinned': False
            },
            {
                'community': rondebosch_comm,
                'created_by': johan_user,
                'title': 'Rondebosch Main Road Traffic & Streetlight Maintenance',
                'content': 'Contractors will be servicing traffic lights near Belmont Road intersection tonight. Expect minor delays and drive safely.',
                'is_pinned': True
            }
        ]

        for adata in announcements_data:
            ann, created = Announcement.objects.get_or_create(
                community=adata['community'],
                title=adata['title'],
                defaults=adata
            )
            if created:
                self.stdout.write(f"  Created announcement: {ann.title}")

        # 5. Create Incidents
        incidents_data = [
            {
                'community': pinelands_comm,
                'reporter': fatima_user,
                'incident_type': 'INFRASTRUCTURE',
                'title': 'Broken Streetlight & Dark Alley near Pinelands High School',
                'description': 'The corner streetlight near Central Avenue and Ringwood is flickering out completely at night. Reported to City of Cape Town (CCT Ref: 91048202).',
                'latitude': -33.935100,
                'longitude': 18.508200,
                'status': 'IN_PROGRESS'
            },
            {
                'community': pinelands_comm,
                'reporter': thabo_user,
                'incident_type': 'SUSPICIOUS',
                'title': 'Suspicious Vehicle Spotted along Forest Drive',
                'description': 'Silver Toyota Hilux driving slowly with hazards on inspecting residential driveways. License plate recorded and passed to Pinelands SAPS and Armed Response.',
                'latitude': -33.937200,
                'longitude': 18.504100,
                'status': 'REPORTED'
            },
            {
                'community': pinelands_comm,
                'reporter': admin_user,
                'incident_type': 'WATER',
                'title': 'Burst Water Main Pipe at Howard Centre Entrance',
                'description': 'Water leaking heavily onto the road surface opposite the shopping center. Municipal maintenance team dispatched.',
                'latitude': -33.933800,
                'longitude': 18.511500,
                'status': 'RESOLVED'
            }
        ]

        for idata in incidents_data:
            inc, created = Incident.objects.get_or_create(
                community=idata['community'],
                title=idata['title'],
                defaults=idata
            )
            if created:
                self.stdout.write(f"  Created incident: {inc.title}")

        # 6. Create Events
        now = timezone.now()
        events_data = [
            {
                'community': pinelands_comm,
                'created_by': admin_user,
                'event_name': 'Pinelands Community Park Clean-up & Indigenous Tree Planting',
                'description': 'Join your neighbors for a morning greening initiative at Elsieskraal River canal and park area. Garden tools, gloves, and refreshments provided.',
                'event_date': now + timedelta(days=5, hours=10),
                'event_location': 'Elsieskraal Canal Park, Howard Drive, Pinelands',
                'max_attendees': 75
            },
            {
                'community': pinelands_comm,
                'created_by': thabo_user,
                'event_name': 'Home Safety & Fire Preparedness Workshop',
                'description': 'Practical safety demo hosted by City of Cape Town Disaster Risk Management and Pinelands Volunteer Safety Team.',
                'event_date': now + timedelta(days=12, hours=18),
                'event_location': 'Pinelands Library Hall, Central Square',
                'max_attendees': 100
            }
        ]

        for edata in events_data:
            evt, created = Event.objects.get_or_create(
                community=edata['community'],
                event_name=edata['event_name'],
                defaults=edata
            )
            if created:
                self.stdout.write(f"  Created event: {evt.event_name}")
                for u in created_users[:4]:
                    EventRSVP.objects.get_or_create(event=evt, user=u, defaults={'status': 'ATTENDING'})

        # 7. Create SOS Alerts
        SOSAlert.objects.get_or_create(
            community=pinelands_comm,
            user=fatima_user,
            defaults={
                'alert_type': 'MEDICAL',
                'status': 'RESOLVED',
                'latitude': -33.935500,
                'longitude': 18.508000,
                'note': 'Elderly neighbor required ambulance assistance. Paramedics dispatched and resolved.',
                'resolved_by': thabo_user,
                'time_resolved': now
            }
        )

        # 8. Create Lost & Found Items
        LostAndFoundItem.objects.get_or_create(
            community=pinelands_comm,
            title='Found: Golden Retriever with Red Collar near Howard Drive',
            defaults={
                'reporter': fatima_user,
                'item_type': 'FOUND',
                'category': 'PETS',
                'description': 'Friendly female Golden Retriever found wandering near Howard Centre entrance. Currently safe at 5 Central Avenue.',
                'location_description': 'Howard Centre Shopping Precinct, Pinelands',
                'contact_info': 'Fatima: +27 83 219 7780',
                'status': 'ACTIVE'
            }
        )

        LostAndFoundItem.objects.get_or_create(
            community=pinelands_comm,
            title='Lost: Hyundai Car Key Ring with House Key',
            defaults={
                'reporter': admin_user,
                'item_type': 'LOST',
                'category': 'KEYS',
                'description': 'Lost black Hyundai remote key fob on leather key strap near Pinelands Oval park.',
                'location_description': 'Pinelands Oval field walkway',
                'contact_info': 'Sibusiso: +27 82 451 9021',
                'status': 'ACTIVE'
            }
        )

        # 9. Create Service Providers
        services_data = [
            {
                'community': pinelands_comm,
                'created_by': admin_user,
                'service_type': 'PLUMBING',
                'business_name': 'Pinelands & Suburban Plumbing',
                'contact_person': 'Johan van der Merwe',
                'phone_number': '+27 21 531 4099',
                'email': 'info@pinelandsplumbing.co.za',
                'description': 'Geyser replacement, leak detection, drain unblocking, and 24/7 emergency water repairs in Pinelands & surrounds.',
                'verified': True
            },
            {
                'community': pinelands_comm,
                'created_by': thabo_user,
                'service_type': 'SECURITY',
                'business_name': 'Cape Peninsula Security Patrols',
                'contact_person': 'Thabo Mokoena',
                'phone_number': '+27 21 531 8000',
                'email': 'patrols@peninsulasecurity.co.za',
                'description': 'Dedicated neighborhood armed response, alarm monitoring, and residential security escort services.',
                'verified': True
            },
            {
                'community': pinelands_comm,
                'created_by': fatima_user,
                'service_type': 'GARDENING',
                'business_name': 'Table Mountain Green Gardening & Landscaping',
                'contact_person': 'Willem Coetzee',
                'phone_number': '+27 82 990 1145',
                'email': 'willem@greengardens.co.za',
                'description': 'Indigenous garden design, lawn care, tree pruning, and borehole irrigation maintenance.',
                'verified': True
            }
        ]

        for sdata in services_data:
            sp, created = ServiceProvider.objects.get_or_create(
                community=sdata['community'],
                business_name=sdata['business_name'],
                defaults=sdata
            )
            if created:
                self.stdout.write(f"  Created service provider: {sp.business_name}")

        # 10. Create Feed Posts & Comments
        post1, created = FeedPost.objects.get_or_create(
            community=pinelands_comm,
            author=fatima_user,
            content='Good morning Pinelands community! Has anyone noticed the new recycling bins placed near Central Square? Fantastic initiative by the local ratepayer association!'
        )
        if created:
            Comment.objects.create(
                post=post1,
                author=admin_user,
                comment='Yes Fatima! We worked with Cape Town Solid Waste to get those installed.'
            )
            Comment.objects.create(
                post=post1,
                author=thabo_user,
                comment='Great to see! Let us all make sure plastic and glass are separated properly.'
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded South African mock data for Pinelands, Cape Town!'))
