//--------------------------------------------------------------
//                             Modules
// We will be using express for server, cheerio to traverse
// the dom, fs to save the JSON data and request for easy HTTP
// requests 

/**
 * Courses: curl -get 'localhost:1123/scrape/courses'
 * Prerequsites:
 * Majors: curl -get 'localhost:1123/scrape/majors'
 */


var express = require('express');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var jsonFile = require('jsonfile');
var db = require('../dbManager.js');

//Connect to database
db.dbConnect();

//----------------------------------------------------------------
//                              Routing 
var app = express();

var json = {
    departments: []
};

var jsonMajors = {
    departments: []
};

app.get('/scrape/majors', (req, res) => {
    var url = 'http://catalog.lehigh.edu';
    var majorsURL = 'http://catalog.lehigh.edu/programsandmajors/';

    request(majorsURL, (error, response, html) => {
        if (error) {
            console.log('Error while making request: ' + error);
            return;
        }
        var $ = cheerio.load(html);
        getMajors($, url);
    });
    res.writeHead(200);
    res.end('Great Success! Very Nice');
});

app.get('/write/prereqs', (req, res) => {
    //open departments.JSON and traverse the prereqs array
    var file = fs.readFileSync("departments.json");
    var jFile = JSON.parse(file);
    jFile.departments.forEach(function(element){
        element.courses.forEach(function(element2){
            if(element2.prerequsites.length > 0){
                db.addListPrereqs(element2.abbr, 1, element2.prerequsites);
            }
        });
    });
    res.writeHead(200);
    res.end('Great Success! Very Nice');
});

function getMajors($, url) {
    var index;
    var data = $('#textcontainer div ul li a').toArray();
    for (index = 0; index < data.length; index++) {
        jsonMajors.departments.push({
            "link": url + $(data[index]).attr('href'),
            "major": $(data[index]).first().text(),
            "UnderGradCore": [],
        });
        //db.createMajor($(data[index]).first().text(), 1, null, null);
    } 
    getCore(jsonMajors, writeToFile, null); //populateMajors(jsonMajors.departments));
    //writeToFile(jsonMajors, 'majors.json');
}
/*
function populateMajors(departments){
    var len = departments.length;
    var i;
    console.log("Adding " + len + " majors with courses");
    for(i = 0; i < len; i++){
        var courses = new Array(); //[departments[i].UnderGradCore.length];
        var j;
        for(j = 0; j < departments[i].UnderGradCore.length; j++){
            var abbr = departments[i].UnderGradCore[j].class;
            var re = new RegExp(String.fromCharCode(160), "g");
            abbr = abbr.replace(re, "");
            courses.push(abbr);
        }
        console.log("createMajorWithCourses("+departments[i].major+", "+1+", "+null+", "+courses+");");
        //console.log("createMajorWithCourses("+departments[i].major+", "+1+", "+null+", "+JSON.stringify(departments[i].UnderGradCore, 4, null)+");");
        db.createMajorWithCourses(departments[i].major, 1, null, courses);
    }
}
*/

function populateMajor(department){
    console.log("Adding courses to " + department.major + " major.");
    var courses = new Array(); //[departments[i].UnderGradCore.length];
    var j;
    for (j = 0; j < department.UnderGradCore.length; j++) {
        var abbr = department.UnderGradCore[j].class;
        var re = new RegExp(String.fromCharCode(160), "g");
        abbr = abbr.replace(re, "");
        courses.push(abbr);
    }
    console.log("createMajorWithCourses(" + department.major + ", " + 1 + ", " + null + ", " + courses + ");");
    //console.log("createMajorWithCourses("+departments[i].major+", "+1+", "+null+", "+JSON.stringify(departments[i].UnderGradCore, 4, null)+");");
    db.createMajorWithCourses(department.major, 1, null, courses);
}

function getCore(jsonMajors, writeToFile, callback) {
    //first get the UnderGradCore
    jsonMajors.departments.forEach(function (element) {
        var url = element.link + '#undergraduatetext';
        request(url, (error, response, html) => {
            if (error) {
                console.log('Error while makking request: ' + error);
                return;
            }
            var $ = cheerio.load(html);

            //get all the undergrad courses
            var firstTD = $('.sc_courselist').first().find('td a');
            $(firstTD).each(function () {
                element.UnderGradCore.push({
                    'class': $(this).text()
                });
            });
            writeToFile(jsonMajors, 'majors.json');
            populateMajor(element);
        });
        //populateMajors(jsonMajors.departments)
        //callback;
    });
    //callback;
    //populateMajors(jsonMajors.departments);
}

app.get('/scrape/courses', (req, res) => {
    var url = 'http://catalog.lehigh.edu';
    var majorsURL = 'http://catalog.lehigh.edu/programsandmajors/';
    var coursesURL = 'http://catalog.lehigh.edu/courselisting/';

    request(coursesURL, (error, response, html) => {
        if (error) {
            console.log('Error while making request: ' + error);
            return;
        }
        var $ = cheerio.load(html);
        getDepartments($, url, getCourses, writeToFile);
    });
    res.writeHead(200);
    res.end('Great Success! Very Nice');
});

function writeToFile(jsonData, name) {
    jsonFile.writeFile(name, jsonData, function (err) {
        if (err) {
            console.error(err);
        }
    });
    //console.log("writing File");
}

function getDepartments($, url, getCourses, writeToFile) {
    var index;
    var data = $('#co_departments ul li a').toArray();
    for (index = 0; index < data.length; index++) {
        json.departments.push({
            "link": url + $(data[index]).attr('href'),
            "department": $(data[index]).first().text(),
            "courses": [],
        });
    }
    getCourses(json, writeToFile, mongoIsBetterThanSQL);

}


function getCourses(json, writeToFile, callback) {

    //first we need to get the total number of elements
    var count = 0;
    json.departments.forEach(function (element) {
        var url = element.link;
        request(url, (error, response, html) => {
            if (error) {
                console.log('Error while makking request: ' + error);
                return;
            }
            var $ = cheerio.load(html);
            var course = $(".courseblock").each(function () {
                count++;
            });
        });
    });

    var index = 0;
    json.departments.forEach(function (element) {
        var url = element.link;
        request(url, (error, response, html) => {
            if (error) {
                console.log('Error while makking request: ' + error);
                return;
            }
            var $ = cheerio.load(html);
            //get all the 
            var courseCount = 0;
            var course = $(".courseblock").each(function () {
                var title = $(this).children().first().text();
                var array = title.split(/\s+/);
                var titleArray = title.split("  ");
                var abbr = titleArray[0];
                var re = new RegExp(String.fromCharCode(160), "g");
                abbr = abbr.replace(re, "");
                var name = titleArray[1];
                var credits = array[array.length - 2];
                var body = $(this).children(".courseblockdesc");
                var arrayReq = []; 
                $(body).children('a').each(function(i, el){
                    arrayReq[i] += $(this).text();
                    arrayReq[i] = arrayReq[i].replace("undefined", "");
                    arrayReq[i] = arrayReq[i].replace(re, "");
                    arrayReq[i] = arrayReq[i].replace(/\s/g, "X");
                });
                //console.log("arrayReq is: " + arrayReq);
                element.courses.push({
                    "abbr": abbr,
                    "name": name,
                    "credits": credits,
                    "courseDescription": $(body).text(),
                    "prerequsites": arrayReq,
                });
                //removing &nbsp
                //abbr = abbr.replace('&nbsp', '');
                //var re = new RegExp(String.fromCharCode(160), "g");
                //abbr = abbr.replace(re, "");
                //console.log(abbr);
                index++;
                db.createCourse(abbr, name, $(body).text(), credits, url, 1, $(body).children('a').text());
                /*if (index == count) {
                    callback(element.courses);
                }*/
            });
            writeToFile(json, 'departments.json');
            //addPrereqs(element.courses);
        });
    });
}

function mongoIsBetterThanSQL(courses){
    var i;
    for (i = 0; i < courses.length; i++) {
        //db.addListPrereqs(courseAbbr, schoolID, prereqSchoolIDs, response);
        var course = courses[i];
        var j;
        var re = new RegExp(String.fromCharCode(160), "g");
        var temp;
        var preq = [];
        for (j = 0; j < course.prerequsites.length; j++){ 
            preq[j] = course.prerequsites[j].replace(re, "");
        }
        console.log(course.abbr + " : " + preq);
        //db.addListPrereqs(course.abbr, 1, preq);
    }
    console.log("----------All " + courses.length + " prereqs being inserted to db----------");
}

app.listen(1123, () => {
    console.log('webScraper up on port 1123');
});
