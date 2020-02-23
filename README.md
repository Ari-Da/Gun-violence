# Introduction

Utilizes gun violence incidents in U.S.A, during the period 2013 - 2018 in an interactive map. Dataset was taken from Kaggle called [Gun Violence Data](https://www.kaggle.com/jameslko/gun-violence-data)

## Installation

Download and unzip the processed dataset in a MongoDB database from this link: https://drive.google.com/open?id=1kGDrFaiCeALV3KsCxF6u1jDCX-r5grsD

MongoDB server is required for the following command to run, which restore the database (GunViolence) with the data. It will create three collections: AllData - holds gun violence data and fs.chunks and fs.files - hold data about state pictures
```bash
mongorestore --db GunViolence gunviolence
```

## Contributing
This is a team effort including the team-members: Ariana Daka (ad2104@rit.edu), Rishi Wadekar (rw9669@rit.edu), Vivek Panchal (vp2890@rit.edu) and Rishabh Ramesh (rxr6393@g.rit.edu). This is a school project to gain credits in Knowledge Representation Technologies course during our Master's degree at RIT.
