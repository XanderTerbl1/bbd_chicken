# Setup (Windows)
1. Create and activate virtual environment
```
python -m venv venv  
venv/Scripts/activate.ps1
```
2. Install pip requirements from requirements.txt
```
pip install -r requirements.txt
```
3. Make and apply the app migrations
```
python manage.py makemigrations  
python manage.py migrate
```
4. Collect Static Files
```
python manage.py collectstatic
```
5. Create a superuser (remember the username and password)
```
python manage.py createsuperuser
```
6. Run the app
```
python manage.py runserver
```