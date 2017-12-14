var host = "http://localhost:3000/"; //http://35.162.231.0:3000/

var courseList;
var majorCourseList;

$('#searchCoursesText').keydown(function(event) {
    if (event.which === 13) {
        clearList('#adminCourseList');
        var searchString = $('#searchCoursesText').val();
        console.log("Searching for courses: *" + searchString + "*");
        if (searchString != '' && searchString != null) {
            searchCoursesButton(searchString);
        } else {
            clearList('#adminCourseList');
        }
    }
});

$(document).ready(function() {
    $('#searchCoursesButton').click(function() {
        clearList('#adminCourseList');
        var searchString = $('#searchCoursesText').val();
        console.log("Searching for courses: *" + searchString + "*");
        if (searchString != '' && searchString != null) {
            searchCoursesButton(searchString);
        } else {
            clearList('#adminCourseList');
        }
    });
    $('#searchCoursesText').keyup(function() {
        var searchString = $('#searchCoursesText').val();
        console.log("Searching for courses dynamically: *" + searchString + "*");
        if (searchString != '' && searchString != null) {
            searchCoursesButton(searchString);
        } else {
            clearList('#adminCourseList');
        }
    });

    var schoolID = 1; // needs to be retrieved from db user
    getMajorsDropDown('getMajorsFromSchool', "?schoolID=" + schoolID, '#MajorsDropDown');
   
    $('#saveMajorButton').click(function() {
        BootstrapDialog.show({
            title: 'Success!',
            message: 'Major Successfully Updated.'
        });
    });
});

/**
 * Populates the Majors drop down from the database based on what school is selected
 * @param {String} func - Name of server call
 * @param {String} params - Parameters for call
 * @param {*} listID - HTML ID of list to be modified
 */
function getMajorsDropDown(func, params, listID) {
    var url = host + func;
    var xhr = new XMLHttpRequest();
    if (params) {
        url += params;
    }
    xhr.open("GET", url);
    xhr.onload = function() {
        var jsonRes = JSON.parse(xhr.responseText);
        $(listID).empty();
        for (var i in jsonRes) {
            $(listID).append('<option value="' + jsonRes[i].idtMajors + '">' +
                (jsonRes[i].name) + '</option>');
        }
        $(listID).selectpicker('refresh');
    };

    xhr.send();
};

/**
 * Function that gets called when the search button is pressed
 * @param {String} searchString to send to the DB
 */
function searchCoursesButton(searchString) {
    getCourses('searchCoursesFromSchool', "?schoolID=" + 1 + "&searchStr=" + searchString, '#adminCourseList');
}

function clearDescription() {
    $('#courseName').empty();
    $('#courseDescription').empty();
    $('#courseLink').empty();
    $('#courseCredits').empty();
}

function clearList(listID) {
    $(listID).empty();
    $(listID).selectpicker('refresh');
}

/**
 * Event listener for changing course list when a major is selected
 */
function majorSelected() {
    clearList("#majorCourseList");
    var majorID = $('#MajorsDropDown option:selected').val();
    getCoursesList('getCoursesFromMajors', "?majorID=" + majorID);
}

/**
 * Calls database to get list of courses from a major
 * @param {String} func - Name of server call
 * @param {String} params - Parameters for call
 */
function getCoursesList(func, params) {
    var url = host + func;
    var xhr = new XMLHttpRequest();
    if (params) {
        url += params;
    }
    xhr.open("GET", url);
    xhr.onload = function() {
        var jsonRes = JSON.parse(xhr.responseText);
        var courseIDList = [];
        majorCourseList = new Array(jsonRes.length);
        for (i in jsonRes) {
            courseIDList[i] = jsonRes[i].idtCourse;
        }
        majorCourseList = jsonRes;
        populateMajorCourseList("#majorCourseList");
    };

    xhr.send();
};

function populateMajorCourseList(listID) {
    sortCourseList(majorCourseList);
    $(listID).empty();
    for (var i in majorCourseList) {
        console.log(majorCourseList[i]);
        $(listID).append('<li value="' + i + '" class="list-group-item">' + majorCourseList[i].schoolCourseID + ": " + majorCourseList[i].name);
    }
    $(listID).selectpicker('refresh');
}

function populateSearchList(listID) {
    $(listID).empty();
    for (var i in courseList) {
        console.log(courseList[i]);
        $(listID).append('<li value="' + i + '" class="list-group-item">' + courseList[i].schoolCourseID + ": " + courseList[i].name);
    }
    $(listID).selectpicker('refresh');
}

/**
 * Populates the list of existing courses from the database
 * @param {String} func - Name of server call
 * @param {String} params - Parameters for call
 * @param {*} listID - HTML ID of list to be modified
 */
function getCourses(func, params, listID) {
    var url = host + func;
    var xhr = new XMLHttpRequest();
    if (params) {
        url += params;
    }
    xhr.open("GET", url);
    xhr.onload = function() {
        var jsonRes = JSON.parse(xhr.responseText);
        courseList = jsonRes;
        //courseList = sortCourseList(courseList);
        populateSearchList(listID);
    };

    xhr.send();
};

//DragNdrop
$(function() {
    $("#majorCourseList").sortable({
        forcePlaceholderSize: true,
        receive: function(event, ui) {
            majorCourseList = strToInt($(this).sortable('toArray', { attribute: 'value' }));
            courseList = strToInt($('#adminCourseList').sortable('toArray', { attribute: 'value' }));
            var masterIndex = takenCourseList[ui.item.index()];

        }
    });
    $("#adminCourseList").sortable({
        receive: function(event, ui) {
            notTakenCourseList = strToInt($(this).sortable('toArray', { attribute: 'value' }));
            takenCourseList = strToInt($('#majorCourseList').sortable('toArray', { attribute: 'value' }));
            var masterIndex = notTakenCourseList[ui.item.index()];
        }
    });
    $("#majorCourseList, #adminCourseList").sortable({
        //cancel: "li.fixed",
        items: "li:not('.fixed')",
        connectWith: ".list-group",
        change: function(event, ui) {}
    });
});