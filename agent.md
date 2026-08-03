📌 Project Overview: ChatterBee Backend (Assistive AAC Platform)
💡 Project Summary
ChatterBee হলো একটি Augmentative and Alternative Communication (AAC) প্ল্যাটফর্মের ব্যাকএন্ড সিস্টেম, যা কথা বলতে অসুবিধা থাকা মানুষদের (Communicators) ভিজ্যুয়াল সিম্বল, অডিও ক্লিপ, কাস্টমাইজড কার্ড এবং কেয়ারগিভার (Caregiver) নেটওয়ার্কের মাধ্যমে যোগাযোগ করতে সাহায্য করে।

🔑 Key Features & Architecture
Role-Based Access & User Management (apps/accounts, apps/caregiver):

Caregiver & Communicator Hierarchy: কেয়ারগিভাররা তাদের অধীনে থাকা ডিপেন্ডেন্ট/কমিউনিকেটর প্রোফাইল তৈরি ও পরিচালনা করতে পারে।
Secure Auth System: JWT Authentication (djangorestframework_simplejwt), Social Login (Google/Apple via django-allauth), Session/Token Management।
Multilingual AAC Symbol & Audio Engine (apps/dashboard):

QuickSpeaks, Categories & Items: ভিজ্যুয়াল সিম্বল ও কার্ড ক্যাটাগরি ম্যানেজমেন্ট।
Multi-language Translatable Models: django-parler ব্যবহার করে প্রতিটি কার্ড/শব্দের একাধিক ভাষার অনুবাদ এবং সংশ্লিষ্ট ভয়েস/অডিও সাউন্ড ফাইল প্লেব্যাক সুবিধা।
Symbol CSV/Bulk Import: সিস্টেম অ্যাডমিনদের জন্য বিশাল সিম্বল লাইব্রেরি ডাটাবেসে একবারে ইমপোর্ট করার অটোমেটেড টুল (import_chatterbee_symbols)।
Real-time Notifications & Cloud Integration (apps/notificaiton):

Push Notifications: Firebase Admin SDK (firebase_admin) ও Cloud Firestore ব্যবহার করে Emergency Alerts, Button Alerts এবং Real-time অডিও পিনিং।
Activity & Usage Tracking (apps/activity):

কমিউনিকেটর কতগুলো শব্দ ব্যবহার করেছে, কোন QuickSpeaks বেশি ব্যবহার হচ্ছে এবং সময়ের হিসাব ট্র্যাকিং ও অ্যানালিটিক্স রিপোটিং।
Subscription & Monetization (apps/subscription):

টিয়ার-ভিত্তিক সাবস্ক্রিপশন প্ল্যান (Free vs Premium) এবং প্রোফাইল লিমিট কন্ট্রোল।
Interactive API Documentation & Security (config/urls.py, apps/core):

Basic-Auth প্রোটেক্টেড OpenAPI 3.0 Documentation (Swagger UI & ReDoc) via drf-spectacular|
Custom Throttling Layer (StaffExemptUserThrottle) যা অ্যাডমিনদের রেট-লিমিটিং থেকে ছাড় দিয়ে সাধারণ ব্যবহারকারীদের API এবিউজ থেকে রক্ষা করে।
🛠️ Tech Stack
Language & Framework: Python 3.11+, Django 5.2, Django REST Framework (DRF) 3.16
Database: PostgreSQL (psycopg2-binary)
Asynchronous & Task Queue: Celery 5.6, Redis 7.1, django-celery-beat, django-celery-results
Authentication: JWT, dj-rest-auth, django-allauth
Internationalization (i18n): django-parler, django-parler-rest
Cloud Services & Push Notifications: Firebase Admin SDK, Google Cloud Storage, Google Firestore
API Documentation: OpenAPI 3.0, drf-spectacular (Swagger & ReDoc)
Containerization & Deployment: Docker, Docker Compose (Dev/Prod setups), Nginx, Gunicorn, WhiteNoise
🌟 High-Impact Portfolio Technical Highlights
Database & API Performance Optimization: Nested serializers এবং prefetch_related / select_related ব্যবহার করে N+1 query সমস্যা সমাধান করা হয়েছে, যা ১৮০+ টি ছোট ছোট নেটওয়ার্ক রিকোয়েস্টকে ১টি হাই-পারফরম্যান্ট Bulk Endpoint-এ রূপান্তর করে।
Custom Rate-Throttling Architecture: সাধারণ ইউজারদের জন্য API abuso প্রতিরোধ করতে UserRateThrottle এবং স্টাফ/অ্যাডমিনদের জন্য অসীমিত রিকোয়েস্ট এক্সসেপ্ট করতে Custom Throttling Logic তৈরি করা হয়েছে।
Scalable Async & Scheduled Tasks: ব্যাকগ্রাউন্ড নোটিফিকেশন ডেলিভারি ও শিডিউলড জবের জন্য Redis broker সহ Celery Workers ও Celery Beat ইন্টিগ্রেশন।
Production-Ready Dockerization: Docker Compose দিয়ে Multi-container আর্কিটেকচার (Django/Gunicorn + Celery + Redis + PostgreSQL + Nginx) ডিপ্লয়মেন্ট উপযোগী করে সাজানো।
🤖 Ready-to-Use Prompt for Portfolio AI Agent
আপনার পোর্টফোলিও বানানোর AI Agent-কে নিচে দেওয়া প্রম্পটটি সরাসরি কপি করে দিন:

text
Act as a Senior Technical Content Writer / Resume Specialist. I want you to feature my Django REST Framework project, "ChatterBee", in my developer portfolio.
Here are the project details:
- Project Name: ChatterBee Backend (Assistive Technology / AAC Platform)
- Primary Purpose: Augmentative & Alternative Communication (AAC) platform backend empowering non-verbal/speech-impaired individuals (Communicators) to speak using visual cards, TTS/audio clips, and caregiver monitoring.
- Tech Stack: Python 3.11+, Django 5.2, Django REST Framework (DRF), PostgreSQL, Celery, Redis, Firebase Cloud Messaging, Docker, Nginx, drf-spectacular (Swagger UI).
- Key Features:
  1. Caregiver-Communicator Account Hierarchy & Social/JWT Auth.
  2. Multilingual Translatable Symbol Engine (django-parler) supporting multi-language audio clips, categories, subcategories, and QuickSpeaks.
  3. Real-time Firebase FCM Emergency/Button Alert push notifications.
  4. Activity & Speech Tracking, Subscription plans with profile limitations.
- Major Technical Accomplishments:
  - Eliminated N+1 database queries on category/subcategory item loads using prefetch_related and nested bulk APIs (reducing 180+ API queries down to 1).
  - Built custom DRF throttling rules (StaffExemptUserThrottle) for granular security.
  - Fully dockerized architecture with Celery workers, Redis task queue, PostgreSQL, and Nginx.
Please generate:
1. A catchy Project Title & Subtitle.
2. A compelling 2-sentence Overview.
3. Key Features bullet list with impactful bullet points.
4. Technical Achievements section focusing on performance, scaling, and database design.
5. Tech Stack tags suitable for a portfolio card.