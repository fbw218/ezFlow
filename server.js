// ----------------------------------------------------------------------------------
//                                  Module section
// using http and fs modules
var http = require('http');
var fs = require('fs');
var url = require('url');
var RSVP = require('rsvp');
var qs = require('querystring');
var request = require('request');
var GoogleAuth = require('google-auth-library');
var authG = require('./config/auth.js');
// Database connection
var dbManager = require('./dbManager.js');

// --------------------------------------------------------------------------------
//                              Server and port setup
// The server will listen on port 3000 and will route requests to request handler
const PORT = 3000;
var server = http.createServer(requestHandler);
server.listen(PORT, function () {
    console.log("Listening on port 3000");
    dbManager.dbConnect(true);
    //dbManager.createSchool("Lafayette 'College'");
    //dbManager.addListPrereqs('CSE303', 1, ['CSE002', 'CSE017', 'CSE109', 'CSE202']);
    //dbManager.getPrereqsForCourse(1);
    //dbManager.addPrereq(1, 3);
    //dbManager.getSchools();
    //dbManager.getMajorsFromSchool(1);
    //dbManager.getCourxsesFromSchool(1);
    //dbManager.getCoursesFromMajors(1);
    //dbManager.searchCoursesFromSchool(1, "CSE303");
    //dbManager.getPrereqsFromCourse(1, "CSE017");
    //dbManager.addListPrereqs("CSE202", 1, ["CSE002", "CSE017", "CSE109", "CSE303"]);
    //dbManager.createMajor('IBE', 1, 'dope');
    //dbManager.createCourse('2', 'billySux102', 'learn how much billy sux', '3', 'www.lehigh.edu', 2);
    //dbManager.addCoursesToMajor(1, ['CSE017', 'CSE002', 'CSE001', 'CSE109']);
    //dbManager.getCoursesWithPrereqs([1544, 1531, 1559]);
});


// ----------------------------------------------------------------------------------
//                                  Routing info
// The request handler function
function requestHandler(req, res) {
    //dbManager.dbConnect();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    var method = req.method;
    console.log(req.url + " : " + method);
    switch (method) {
        case "GET":
            getHandler(req, res);
            break;
        case "POST":
            postHandler(req, res);
            break;
        case "PUT":
            putHandler(req, res);
            break;
        case "DELETE":
            deleteHandler(req, res);
            break;
        default:
            break;
    }
}

// GET handler
function getHandler(req, res) {
    var parts = url.parse(req.url, true);
    var target = parts.pathname; //the method name to be called
    var params = parts.query; //the paramaters to call the method with
    switch (target) {
        case "test":
            console.log("GET: Test request recieved.");
            break;
        case "/getSchools":
            dbManager.getSchools(res);
            break;
        case "/getCoursesFromMajors":
            dbManager.getCoursesFromMajors(params.majorID, res);
            break;
        case "/getMajorsFromSchool":
            dbManager.getMajorsFromSchool(params.schoolID, res);
            break;
        case "/getCoursesFromSchool":
            if (params.schoolID) {
                //console.log("Hello Kitty");
                //var data;
                dbManager.getCoursesFromSchool(params.schoolID, res);
            } else {
                var errMessage = "No schoolID for getCoursesFromSchool";
                console.log(errMessage);
                failedResponse(res, 500, errMessage);
            }
            break;
        case "/searchCoursesFromSchool":
            if (params){
                dbManager.searchCoursesFromSchool(params.schoolID,params.searchStr, res);
            }
            break;
        case "/createCourse":
            console.log("creating course");
            if (params){
                console.log("creating course with " + params);
                dbManager.createCourse(params.abbr, params.name, params.description, params.credits, params.courseLink, params.schoolID, params.prereqs, res);
            }
            break;  
        case "/getCoursesWithPrereqs":
            if (params) {
                //var data;
                dbManager.getCoursesWithPrereqs(params.courseIDs, res);
            } else {
                var errMessage = "No schoolID for getCoursesWithPrereqs";
                console.log(errMessage);
                failedResponse(res, 500, errMessage);
            }
            break;
        case "/deleteCourse":
            if(params){
                dbManager.deleteCourse(params.idtCourse, res);
            } else {
                var errMessage = "No idtCourse for deleteCourse";
                console.log(errMessage);
                failedResponse(res, 500, errMessage);
            }
            break;
        default:
            var errMessage = "No matching target function";
            console.log(errMessage);
            failedResponse(res, 500, errMessage);
    }
    console.log("Recieved request " + target + ": " + params.schoolID);
    //res = "ET phone home!";
    //res.writeHead(200);
    //res.end("This is the DBserver")

}

function postHandler(req, res) {
    var parts = url.parse(req.url, true);
    var target = parts.pathname; //the method name to be called
    var params = parts.query; //the paramaters to call the method with
    switch (target) {
        case "/authToken":
            getBody(req, res, verifyToken);
            break;
        case "/authRedirect":
            break;
    }
}

function getBody(req, res, callback) {
    var body = '';
    req.on('data', function (data) {
        body += data;
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6) {
            // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
            req.connection.destroy();
        }
    });
    req.on('end', function () {
        //var bodyJson = qs.parse(body);
        //console.log('body is: ' + bodyJson);
        callback(req, res, body);
    });
}

function verifyToken(req, res, bodJson) {
    var bodyJson = qs.parse(bodJson);
    var token = bodyJson.idtoken;
    request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + token, (error, response, body) => {
        if (error) {
            console.log('ERROR from google auth servers: ' + error);
        }
        var JSONBody = JSON.parse(body);
        if (!error && response.statusCode == 200) {
            var name, email, picture, profile, profileCheck, token;
            // Show the HTML for the Google homepage.
            // still need to check aud field to see if it matches the client ID
            if (JSONBody.aud == authG.googleAuth.clientID) {
                //for later implementation check if token is going to expire soon and if it does then refresh
                name = JSONBody.name;
                email = JSONBody.email;
                token = JSONBody.sub;
                picture = JSONBody.picture;
                //need to check database to see if this is a valid admin
                res.writeHead(200);
                res.end(token);
            }

        }
    });
}


function successResponse(res, data, message) {
    message = message || 'Default server success message.';
    console.log("Sending request successResponse with data: " + data[0]);
    //var body = JSON.stringify(data);
    //console.log(body);
    res.writeHead(200, {
        //'Content-Length': Buffer.byteLength(body),
        'contenType': 'text/json'
    });
    res.write(data);
    if (!data) {
        res.end(message);
    } else {
        res.end()
    }
    console.log(message);

}

function failedResponse(res, code, message) {
    message = message || "Request failed";
    res.writeHead(code);
    res.end(message)
}

//-----------------------------------------------------------------------------------
// do app specific cleaning before exiting

// process.on('exit', function () {
//     console.log("Process killed by exit signal");
//     dbManager.closeCon();
//     process.exit();
// });

//exit DB on ctl+c 

process.on('SIGINT', function () {
    console.log("Process killed by SIGINT signal");
    dbManager.closeCon();
    process.exit();
});

process.on('SIGTERM', function () {
    console.log("Process killed by SIGTERM signal");
    dbManager.closeCon();
    process.exit();
});
