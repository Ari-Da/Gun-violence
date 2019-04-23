from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
import re
from flask import request
from gridfs import GridFS
import base64

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'GunViolence'
COLLECTION_NAME = 'Incidents'
FIELDS = {'source_url': True, 'comments': True, 'participants': True, 'incident_id': True, 'notes': True, 'state': True, 'n_killed': True, 'n_injured': True, 'date': True, 'address': True, 'loc': True, '_id': False}
LIMIT = 3000

@app.route("/")
def index():
    return render_template("leaflet.html")

@app.route("/GunViolence/AllData")
def gunViolence_projects():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]

    projects = collection.find(projection=FIELDS, limit=LIMIT)
    #projects = collection.find(projection=FIELDS)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects

@app.route("/search")
def show():
    return render_template("leaflet.html")

@app.route("/locations", defaults={'term': None, 'year': None}, methods=['GET'])
@app.route("/locations?user_input=<term>&year_input=<year>", methods=['GET'])
def getIncidentData(term, year):
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    term = request.args.get('user_input')
    years = request.args.get('year_input')

    if years != None:
        years = years.replace('%20', '')
        years = years.split(' - ')
        if len(years) > 1 and years[0] == years[1]:
            years = [years[0]]
    else:
        years = ['7', '8']

    range = "-".join(years)
    yearReg = re.compile("\d{3}[" + range + "]")

    if term != None:
        termReg = re.compile(".*" + term + ".*", re.IGNORECASE)
        where = {"notes": {"$regex": termReg}, "date": {"$regex": yearReg}}
    else:
        where = {"date": {"$regex": yearReg}}

    #print(where)
    incidents = collection.find(where, projection=FIELDS, limit=LIMIT)
    points = []
    for inc in incidents:
        points.append({'id': inc['incident_id'], 'addr': inc['address'], 'lat': inc['loc']['coordinates'][1], 'lng': inc['loc']['coordinates'][0],
                       'notes': inc['notes']})

    pipeline = {
        "_id": "$state",
        "injuredCount": {"$sum": "$n_injured"},
        "killedCount": {"$sum": "$n_killed"}
    }
    incidents = collection.aggregate([{"$match": where}, {"$group": pipeline}])
    counts = []
    for inc in incidents:
        counts.append({'state': inc['_id'], 'injuredCount': inc['injuredCount'], 'killedCount': inc['killedCount']})

    connection.close()
    return json.dumps([points, counts])

@app.route("/distance/id=<id>/dist=<d>", methods=['GET'])
def incidentsWithinRange(id, d):
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]

    incident = collection.find_one({"incident_id": int(id)}, {'_id': False, 'loc': True})
    points = []

    if incident != None:
        #print(incident['notes'])
        incidents = collection.find({"loc": {"$near": {"$geometry": incident['loc'], "$maxDistance": int(d) * 1000}}}, projection=FIELDS).limit(LIMIT)
        for inc in incidents:
            points.append({'id': inc['incident_id'], 'addr': inc['address'], 'lat': inc['loc']['coordinates'][1],
                           'lng': inc['loc']['coordinates'][0],
                           'notes': inc['notes']})

    connection.close()
    return json.dumps([points, []])

# @app.route("/img/id=<id>", methods=['GET'])
# def getImg(id):
#     incident_id = int(id)
#     connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
#     collection = connection[DBS_NAME][COLLECTION_NAME]
#     fs = GridFS(connection[DBS_NAME])
#
#     project = collection.find_one({'incident_id': incident_id}, projection=FIELDS)
#
#     img = None
#
#     state = project['state']
#     print(state)
#     state = state.replace(" ", "")
#     state = state + ".jpg"
#     for grid_output in fs.find({'filename': state}):
#         img = base64.b64encode(grid_output.read()).decode('utf-8')
#
#     # now you have the entire document in project & image in img
#     connection.close()
#     return json.dumps(img)

@app.route("/content/id=<id>", methods=['GET'])
def getContent(id):
    incident_id = int(id)
    print(type(incident_id))
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    fs = GridFS(connection[DBS_NAME])

    project = collection.find_one({'incident_id': incident_id}, projection=FIELDS)
    print(type(project))
    img = None

    state = project['state']
    print(state)
    state = state.replace(" ", "")
    state = state + ".jpg"
    for grid_output in fs.find({'filename': state}):
        img = base64.b64encode(grid_output.read()).decode('utf-8')
    print(project)
    print(img)


    # now you have the entire document in project & image in img
    connection.close()
    return json.dumps([project, img])

@app.route("/addComment/id=<id>", methods=['GET', 'POST'])
def addComment(id):
    incident_id = int(id)
    data = request.form
    name = data['user_name']
    print(name)
    comment = data['user_comment']
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    rec_comment = collection.find_one({'incident_id': incident_id, 'comments': {'$exists': True, '$ne': False}})
    if not rec_comment:
        collection.update_one({'incident_id': incident_id}, {'$set': {'comments': [{'name': name, 'comment': comment}]}})
    else:
        collection.update_one({'incident_id': incident_id}, {'$push': {'comments': {'name': name, 'comment': comment}}})
    connection.close()
    return ""

if __name__ == "__main__":
    app.run(debug=True)
