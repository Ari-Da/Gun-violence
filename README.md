## Introduction

This application is built using the Flask micro-framework. It utilizes gun violence incidents in U.S.A, during the period 2013 - 2018 in an interactive map.
Dataset was taken from Kaggle called [Gun Violence Data](https://www.kaggle.com/jameslko/gun-violence-data)

## Functionality

- View and interact with each individual incidents as points
- Search for particular incidents containing keyword(s)
- Add and read comments regarding an incident
- Search other nearby incidents (using MongoDB's inbuilt capability to search based on geodata)
- Search based on year range

## Requirements

- MongoDB server: https://www.mongodb.com/download-center/community
- pip: https://pip.pypa.io/en/stable/installing/

## Installation

1. Download and unzip the processed dataset in a MongoDB database from this link: https://drive.google.com/open?id=1kGDrFaiCeALV3KsCxF6u1jDCX-r5grsD

2.  In command line/terminal run the following command to restore the database (GunViolence) with the data. It will create three collections: AllData - holds gun violence data and fs.chunks and fs.files - hold data about state pictures. Make sure the database name is GunViolence (as shown below) as MongoDB is case sensitive:
```bash
mongorestore --db GunViolence path/to/gunviolence/folder
```

3. Clone or download the files from this GitHub repository and run the command to install the necessary packages:
```bash
pip install -r requirements.txt path/to/requirements.txt
```

4. In command line/terminal execute the flask command to run the app.py file:
```bash
export FLASK_APP=path/to/app.py
flask run
```
<i>By default it will run the application in http://localhost:5000/</i>

## Contributing
This is a team effort including the team-members: Ariana Daka (ad2104@rit.edu), Rishi Wadekar (rw9669@rit.edu), Vivek Panchal (vp2890@rit.edu) and Rishabh Ramesh (rxr6393@g.rit.edu). This is a school project to gain credits in the Knowledge Representation Technologies course during our Master's degree at RIT.
