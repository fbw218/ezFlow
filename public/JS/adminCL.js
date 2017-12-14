var host = "http://localhost:3000/"; //http://35.162.231.0:3000/

var courseList;

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
    $('#manualCourseAdded').click(function() {
        console.log("creating course og");
        addingCourse();
    });
});

function addCoursePopup() {
    $('#courseidinput').val('');
    $('#courseidinput').attr('disabled', false);
    $('#nameinput').val('');
    $('#coursedescription').val('');
    $('#creditsinput').val('');
    $('#courselinkinput').val('');
}

function editCoursePopup(index) {
    var curCourse = courseList[index];
    $('#courseidinput').val(curCourse.schoolCourseID);
    $('#courseidinput').attr('disabled', true);
    $('#nameinput').val(curCourse.name);
    $('#coursedescription').val(curCourse.description);
    $('#creditsinput').val(curCourse.credits);
    $('#courselinkinput').val(curCourse.courseLink);
}

function addingCourse() {
    //console.log('creating course');
    var schoolID = 1;
    var abbr = $('#courseidinput').val();
    var name = $('#nameinput').val();
    var description = $('#coursedescription').val();
    var credits = $('#creditsinput').val();
    var courseLink = $('#courselinkinput').val();
    var prereqString = $('#prereqinput').val();

    var func = 'createCourse';
    var params = "?schoolID=" + schoolID + "&abbr=" + abbr + "&name=" + name + "&description=" + description + "&credits=" + credits + "&courseLink=" + courseLink + "&prereqs=" + prereqString;

    var url = host + func;
    var xhr = new XMLHttpRequest();
    if (params) {
        url += params;
    }
    console.log("Creating course: " + url);
    xhr.open("GET", url);
    xhr.onload = function() {
        $('#manualentrypopup').modal('toggle');
        BootstrapDialog.show({
            title: 'Success!',
            message: 'Course Listing Successfully Updated.'
        });
        searchCoursesButton($('#searchCoursesText').val());
    };

    xhr.send();
}

function deleteQuery(index) {
    var curCourse = courseList[index];
    BootstrapDialog.show({
        title: 'Really?',
        message: 'Are you sure you want to delete ' + curCourse.schoolCourseID + '?',
        closable: true,
        closeByBackdrop: false,
        closeByKeyboard: false,
        buttons: [{
                label: 'Delete',
                cssClass: 'btn-primary',
                action: function(dialogItself) {
                    deleteCourse(index);
                    dialogItself.close();

                }
            },
            {
                label: 'Cancel',
                action: function(dialogItself) {
                    dialogItself.close();
                }
            }
        ]
    });
}

function deleteCourse(index) {
    var curCourse = courseList[index];
    var func = 'deleteCourse';
    var params = "?idtCourse=" + curCourse.idtCourse;

    var url = host + func;
    var xhr = new XMLHttpRequest();
    if (params) {
        url += params;
    }
    console.log("Creating course: " + url);
    xhr.open("GET", url);
    xhr.onload = function() {
        BootstrapDialog.show({
            title: 'Success!',
            message: 'Course Deleted Successfully.'
        });
        searchCoursesButton($('#searchCoursesText').val());
        clearDescription();
    };

    xhr.send();
}

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
    courseList = [];
    $(listID).selectpicker('refresh');
    clearDescription();
}

function populateList(listID) {
    $(listID).empty();
    for (var i in courseList) {
        $(listID).append('<li value="' + i + '" onclick="dispClassInfo(' + i + ')" class="list-group-item">' + courseList[i].schoolCourseID + ": " + courseList[i].name +
            '<span onclick="editCoursePopup(' + i + ')" class="glyphicon glyphicon-pencil edit" data-toggle="modal" data-target="#manualentrypopup"/>' +
            '<span onclick="deleteQuery(' + i + ')" class="glyphicon glyphicon-remove"/>' + '</li>');
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
        populateList(listID);
    };

    xhr.send();
};

/**
 * Displays the course information on the course information panel
 * @param {Number} masterIndex - Used to index into courselist  
 */
function dispClassInfo(masterIndex) {
    $('#courseName').text(courseList[masterIndex].name);
    $('#courseDescription').text(courseList[masterIndex].description);
    $('#courseLink').text(courseList[masterIndex].courseLink);
    $('#courseCredits').text("Credits: " + courseList[masterIndex].credits);
}