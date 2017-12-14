var exports = module.exports = {};
var RSVP = require('rsvp');

var connection;

var dbPollTime = 3600000; // 1 hour
function reconnect(){
	console.log("Reconnecting");
	if(connection){
		connection.end();
		connection = null;
	}
	exports.dbConnect(true);
}



exports.dbConnect = function(persist) {
	persist = persist || false;
    var mysql = require('mysql');
	// if(connection != null){
	// 	console.log("Database already open.")
	// 	return;
	// }

    connection = mysql.createConnection({
    	//Desktop: '192.168.1.100', // public:'64.121.107.175', //private: '192.168.1.100',
		host	: 'ezflowdb.cblpqgmpzlek.us-west-2.rds.amazonaws.com',
    	user	: 'ezFlowServer',
    	password: 'JeK_yed384m=DR?T3VAmeJU=',
    	database: 'ezFlowDB'
    });

    connection.connect();
    connection.query('SELECT * from tSchool', function(err, rows, fields) {
	if (!err)
	    console.log('Connected.');
	else
	    console.log('Could not connect.');
	});
	
	if(persist){
		setTimeout(reconnect, dbPollTime);
	}
}

/**
 * Gets all schools in the database
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the schools, nothing if given a response object
 */
//---------------GET SCHOOLS------------------------------------------------------------
exports.getSchools = function(response) {
	response = response || null;
	var query = 'SELECT * from tSchool';
	var result;
	//dbConnect();
	connection.query(query, function(err, rows, fields) {
		if (!err) {
			raw = rows
			var data = JSON.stringify(rows);
			result = rows;
			if(response){
				successResponse(response, data, "Great success!");
			}else{
				console.log(rows);
			}
			return data;
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, "Failed getSchools.")
			}
			return -1
		}
	});	
	return result;
}

/**
 * Gets all majors in the specified school
 * @param {Object} schoolID - id of the school to be searched 
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the schools, nothing if given a response object
 */
//---------------GET MAJORS FROM A SPECIFIED SHCOOLS------------------------------------------------------------
exports.getMajorsFromSchool = function(schoolID, response){
	response = response || null;
	var query = 'SELECT * from tMajors where schoolID = ' + schoolID + ' order by name;';
	var result;
	//console.log("Query: " + query);
	connection.query(query, function(err, rows, fields) {
		if (!err) {
			raw = rows
			var data = JSON.stringify(rows);
			result = rows;
			if(response){
				successResponse(response, data, "Minor success!");
			}else{
				console.log(rows);
			}
			return data;
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, "Failed getMajorsFromSchool.")
			}
			return -1;
		}
	});	
	return result;
}

/**
 * Gets all prereqs in the specified list of courses
 * @param {Object} courseIDs - list of ids of the courses to be searched 
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the schools, nothing if given a response object
 */
exports.getCoursesWithPrereqs = function(list, response) {
	response = response || null;
	list += '';
	var courseIDs = list.split(',');
	var query = 'SELECT * FROM tPrerequisites WHERE ';
	for(i in courseIDs){
		query += 'parentID =' + courseIDs[i];
		if(i == courseIDs.length-1){
			query += ';';
		} else {
			query += ' OR ';
		}
	}
	var result;
	connection.query(query, function(err, rows, fields) {
		if (!err) {
			raw = rows
			var data = JSON.stringify(rows);
			result = rows;
			if(response){
				successResponse(response, data, "getCoursesWithPrereqs success!");
			}else{
				console.log(rows);
			}
			return data;
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, "Failed getCoursesWithPrereqs.")
			}
			return -1;
		}
	});	
	return result;

}

/**
 * @param {String} email- this is the email that the google sign in returns
 * @param {Number} token - this is the unique token that corresponds the the email
 * @return {Boolean} if the user is registered as an admin then it will return true
 */

exports.verifyAdmin = function(email, token){
	//make some SQl call
	return true;
}

/**
 * Gets all prereqs in the specified course
 * @param {Object} courseID - id of the course to be searched 
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the schools, nothing if given a response object
 */
//---------------GET ALL PREREQS FOR A COURSE------------------------------------------------------------
exports.getPrereqsForCourse = function(courseID, response){
	response = response || null;
	var query = 'SELECT * FROM tPrerequisites WHERE parentID = ' + courseID;
	var result;
	//console.log("Query: " + query);
	connection.query(query, function(err, rows, fields) {
		if (!err) {
			raw = rows
			var data = JSON.stringify(rows);
			result = rows;
			if(response){
				successResponse(response, data, "getPrereqsForCourse success!");
			}else{
				console.log(rows);
			}
			return data;
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, "Failed getPrereqsForSchool.")
			}
			return -1;
		}
	});	
	return result;
}

//---------------GET ALL COURSES FROM A SPECIFIED SCHOOL-----------------------------------
/**
 * Gets all courses offered by a given school
 * @param {Number} schoolID - The numerical database ID for a school 
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the schools courses, nothing if given a response object
 */
exports.getCoursesFromSchool = function(schoolID, response){
	response = response || null;
	console.log("Searching for courses in " + schoolID);
	var query = 'SELECT * from tCourse where schoolID = ' + schoolID;
	var result; //query result -1 if failure
	var raw; //for debug purposes doesnt seem to work
	console.log("Searching...")
	result = connection.query(query, function (err, rows, fields) {
		if (!err) {
			raw = rows
			var data = JSON.stringify(rows);
			result = rows;
			if(response){
				successResponse(response, data, "Great success!");
			}else{
				console.log(rows);
			}
			return data;
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, "Search courses by schoolIF failed.")
			}
			return -1
		}
	});

	//-----------------------ASYNC warning after this line----------------------

	//console.log("Results are in");
	if(response != null){ //checks if results was already sent through http response
		return; 
	}
	//otherwise return result incase of internal call
	console.log("No response, results: " + raw);
	return result;
}

//---------------GET ALL COURSES FROM A SPECIFIED MAJOR-----------------------------------
/**
 * Gets all courses offered by a given school
 * @param {Number} schoolID - The numerical database ID for a major 
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the schools courses, nothing if given a response object
 */
exports.getCoursesFromMajors = function(majorID, response) {
	response = response || null;
	console.log("Searching for courses in " + majorID);
	var query = 'select * from tMajorCourses join tCourse on idtCourse = courseID  where majorID = ' + majorID;
	var result; //query result -1 if failure
	var raw; //for debug purposes doesnt seem to work
	console.log("Searching...")
	result = connection.query(query, function (err, rows, fields) {
		if (!err) {
			raw = rows
			var data = JSON.stringify(rows);
			result = rows;
			if(response){
				successResponse(response, data, "Good success!");
			}else{
				console.log(rows);
			}
			return data;
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, "Search courses by majorID failed.")
			}
			return -1
		}
	});

	//-----------------------ASYNC warning after this line----------------------

	//console.log("Results are in");
	if(response != null){ //checks if results was already sent through http response
		return; 
	}
	//otherwise return result incase of internal call
	console.log("No response, results: " + raw);
	return result;
}

/**
 * Gets all courses offered by a given school
 * @param {Number} schoolID - The numerical database ID for a school
 * @param {String} courseAbbr - The abbreviation of the course i.e. CSE002
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the schools courses, nothing if given a response object
 */
exports.getPrereqsFromCourse = function(schoolID, courseAbbr, response){
	response = response || null;
	console.log("Searching for prereqs for " + courseAbbr);
	getCourseDBID(courseAbbr, schoolID, function(id){
		//console.log("Hello Kitty");
		var query = 'SELECT * from tPrerequisites where parentID = ' + id;
		var result; //query result -1 if failure
		var raw; //for debug purposes doesnt seem to work
		console.log("Searching...")
		result = connection.query(query, function (err, rows, fields) {
			if (!err) {
				raw = rows
				var data = JSON.stringify(rows);
				result = rows;
				if (response) {
					successResponse(response, data, "Great success!");
				} else {
					console.log(rows);
				}
				return data;
			}
			else {
				console.log(err.message);
				if (response) {
					failedResponse(response, 500, "Search courses by schoolIF failed.")
				}
				return -1
			}
		});
	});
}

//---------------SEARCH COURSES FROM A SPECIFIED SCHOOL-----------------------------------
/**
 * Searches names and abbreviations of courses offered by a given school if they contain the search string 
 * @param {Number} schoolID - The numerical database ID for a school 
 * @param {String} searchStr - The [partial] name or abbreviation to be searched on
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the matching courses, nothing if given a response object
 */
exports.searchCoursesFromSchool = function(schoolID, searchStr, response){
	response = response || null;
	console.log("Searching for courses in " + schoolID);
	var query = 'SELECT * from tCourse '; 
	query += 'where schoolID = ' + schoolID + ' AND name LIKE "%' + searchStr + '%" OR schoolCourseID LIKE "%' + searchStr + '%";';
	var result; //query result -1 if failure
	var raw; //for debug purposes doesnt seem to work
	console.log("Searching...")
	result = connection.query(query, function (err, rows, fields) {
		if (!err) {
			raw = rows
			var data = JSON.stringify(rows);
			result = rows;
			if(response){
				successResponse(response, data, "Great success!");
			}else{
				console.log(rows);
			}
			return data;
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, "Search courses by schoolIF failed.")
			}
			return -1
		}
	});

	//-----------------------ASYNC warning after this line----------------------

	//console.log("Results are in");
	if(response != null){ //checks if results was already sent through http response
		return; 
	}
	//otherwise return result incase of internal call
	console.log("No response, results: " + raw);
	return result;
}


//------------------ADD A NEW SCHOOL------------------------------------------------------------------
exports.createSchool = function (name, response) {
	response = response || null;
	var query = 'INSERT INTO tSchool values (NULL, ';
	query += '"' + name + '")';
	console.log(query);
	var result;
	connection.query(query, function (err) {
		if (!err) {
			result = getLastInsertID(response);
			console.log('School ' + name + ' added.');
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, err.message);
			}
		}
	});
	return result;
}


//---------------PUT A MAJOR INTO A SCHOOL------------------------------------------------------------
/**
 * Searches names and abbreviations of courses offered by a given school if they contain the search string 
 * @param {String} name - The name of the major
 * @param {Number} schoolID - The numerical id of the school the major is in
 * @param {String} description - The description of the major
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the matching courses, nothing if given a response object
 */
exports.createMajor = function (name, schoolID, description, response) {
	response = response || null;
	var query = 'INSERT INTO tMajors values (NULL, ';
	query += '"' + name + '", ' + schoolID + ', "' + description + '")';
	var result;
	connection.query(query, function (err) {
		if (!err) {
			result = getLastInsertID(response);
			console.log('Major ' + name + ' added.');
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, err.message);
			}
		}
	});
	return result;
}

//---------------PUT A MAJOR INTO A SCHOOL WITH A LIST OF COURSES-------------------------------------------------
/**
 * Searches names and abbreviations of courses offered by a given school if they contain the search string 
 * @param {String} name - The name of the major
 * @param {Number} schoolID - The numerical id of the school the major is in
 * @param {String} description - The description of the major
 * @param {Array} courses - List of courses required by this major.
 * @param {Object} response - The http response object, if null no response sent.
 * @return {Object} JSON object of the matching courses, nothing if given a response object
 */
exports.createMajorWithCourses = function (name, schoolID, description, courses, response) {
	response = response || null;
	var query = 'INSERT INTO tMajors values (NULL, ';
	query += '"' + name + '", ' + schoolID + ', "' + description + '")';
	var result;
	connection.query(query, function (err) {
		if (!err) {
			result = getLastInsertID(response);
			var id;
			query = 'SELECT idtMajors FROM tMajors WHERE name LIKE "'+ name +'" AND schoolID=' + schoolID + ';';
			connection.query(query, function (err, rows, fields) {
				if (!err) {
					if(rows != null && rows.length > 0){
						console.log(rows);
						id = (rows[0].idtMajors);
						console.log(id);
						addCoursesToMajor(id, courses, response);
					}else{
						console.log("No major "+ name);
					}
				}
				else {
					console.log(err.message);
					if (response) {
						failedResponse(response, 500, err.message);
					}
					return -1;
				}
			});
			console.log('Major ' + name + ' added.');

		}
		else {
			console.log(err.message);
			if (response) {
				failedResponse(response, 500, err.message);
			}
		}
	});
	return result;
}


//---------------PUT A MAJOR INTO A SCHOOL------------------------------------------------------------
exports.createMajor = function (name, schoolID, description) {
	var query = 'INSERT INTO tMajors values (NULL, ';
	query += '"' + name + '", ' + schoolID + ', "' + description + '")';
	var result;
	connection.query(query, function (err) {
		if (!err) {
			result = getLastInsertID();
			console.log('Major ' + name + ' added.');
		}
		else {
			console.log(err.message);
		}
	});
	return result;
}

//---------------DELETE A COURSE FROM THE DATABASE------------------------------------------------------------
exports.deleteCourse = function(idtCourse, response){
	response = response || null;
	var query = 'DELETE FROM tCourse WHERE idtCourse = ' + idtCourse;
	var result;
	console.log(query);
	connection.query(query, function(err) {
		if (!err) {
			if(response){
				successResponse(response, null);
			}
			//result = getLastInsertID();
			//console.log('Course ' + name + ' added.');
		}
		else {
			console.log(err.message);
		}
	});	
	return result;
}



//---------------PUTS A NEW COURSE INTO A SCHOOL------------------------------------------------------------
/**
 * @param {String} schoolCourseID - id that the school gives the course
 * @param {String} name - name of the course
 * @param {String} description - description of course
 * @param {Number} credits - credits for the course
 * @param {String} courseLink - link to the course site
 * @param {Number} schoolID - database id for the school
 * @param {String} prereqs - list of the prereqs for the course
 * @param {Object} response - The http response object null if none
 */
exports.createCourse = function(courseSchoolID, name, description, credits, courseLink, schoolID, prereqs, response){
	response = response || null;
	var query = 'INSERT INTO tCourse (schoolCourseID, name, description, credits, courseLink, schoolID) values ("';
	query += courseSchoolID + '","' + name + '", "' + description + '", ' + credits + ', "' + courseLink + '", ' + schoolID + ')';
	
	//updates course if it is a duplicate
	query += ' ON DUPLICATE KEY UPDATE ' 
	query += 'name= "' + name + '", description= "' + description + '", credits= ' + credits + ', courseLink= "' + courseLink + '";'
	var result;
	console.log(query);
	connection.query(query, function(err) {
		if (!err) {
			if(response){
				successResponse(response, null);
			}
			result = getLastInsertID();
			//console.log('Course ' + name + ' added.');
		}
		else {
			console.log(err.message);
		}
	});	
	return result;
}



//---------------ADDS A LIST OF PREREQS INTO A COURSE (ALL COURSES MUST ALREAD EXIST)-----------------------------
/**
 * @param {String} courseAbbr - The abbreviation of the course i.e. CSE002
 * @param {Number} schoolID - The database ID of the school
 * @param {Array} prereqSchoolIDs - A list of course abbreviations that are a prereq for the original course
 * @param {Object} response - The http response object null if none
 */
exports.addListPrereqs = function(courseAbbr, schoolID, prereqSchoolIDs, response){
	response = response || null;

	if(!courseAbbr || !schoolID || !prereqSchoolIDs || prereqSchoolIDs.length==0){
		console.log("Insufficient arguments for adding list of prereqs");
		return;
	}

	getCourseDBID(courseAbbr, schoolID, function(courseID){
		var length = prereqSchoolIDs.length;
		var prereqIDs = [];
		var i = 0;

		var recurse = function (id) {
			//catches bad prereq id
			if(id <= 0){
				i++;
				getCourseDBID(prereqSchoolIDs[i], schoolID, recurse);
				return;
			}

			prereqIDs[i] = id;
			i++;
			if (i < length) {
				getCourseDBID(prereqSchoolIDs[i], schoolID, recurse);
			} else { //base condition
				var query = 'INSERT INTO tPrerequisites ';
				var k;

				//no initial comma
				if (prereqIDs[0] && prereqIDs[0] > 1) { //course exists
					query += ' values (' + courseID + ', ' + prereqIDs[0] + ')';
				}

				//comma separated values following
				for (k = 1; k < length; k++) {
					if (prereqIDs[k] > 0) { //course exists
						query += ', (' + courseID + ', ' + prereqIDs[k] + ')';
					}
				}
				query += ';';
				connection.query(query, function (err) {
					if (!err) {
						if(response){
							getLastInsertID(response);
						}
						
						console.log('Prereqs ' + prereqIDs + ' added to course' + courseID);
					}
					else {
						console.log(err.message);
						if (response) {
							failedResponse(response, 500, err.message);
						}
					}
				});
			}
		};
		getCourseDBID(prereqSchoolIDs[i], schoolID, recurse);
	});
	


	/*
	var i = 0;
	var result = [];
	for(i=0; i < prereqSchoolIDs.length; i++){
		console.log("School: " + schoolID + " Prereq: " + prereqSchoolIDs[i]);
		var cPrereqID = getCourseDBID(prereqSchoolIDs[i], schoolID);
		console.log("hello kitty " + cPrereqID + prereqSchoolIDs[i]);
		result[i] = exports.addPrereq(courseID, cPrereqID);
		console.log("hello kitty " + result[i]);
	}
	//exports.getPrereqsForCourse(courseID);
	//error check
	return result;
	*/
}

//---------------ADDS A NEW PREREQ INTO A COURSE (BOTH COURSES MUST ALREAD EXIST)-----------------------------
/**
 * Adds a prereq course to an existing course 
 * @param {Number} courseID - The DB id of the postreq course
 * @param {Number} prereqID - The DB id of the prereq course 
 * @param {Object} response - The http response object null if none
 * @return {Number} - The numerical db insertion id id -1 on err
 */
exports.addPrereq = function(courseID, prereqID, response){
	response = response || null;
	var query = 'INSERT INTO tPrerequisites values (';
	query += courseID + ', ' + prereqID + ');';
	connection.query(query, function(err) {
		if (!err) {
			getLastInsertID(response);
			console.log('Prereq ' + prereqID + ' added to course' + courseID);
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, err.message);
			}
		}
	});	
}

//---------------ADDS AN EXISTING COURSE TO A MAJOR------------------------------------------------------------
/**
 * Adds an existing course to an existing major 
 * @param {Number} majorID - The DB id of the major
 * @param [String] schoolCourseIDs - The DB id of the course 
 * @param {Object} response - The http response object null if none
 * @return {Number} - The numerical db insertion id id -1 on err
 */
function addCoursesToMajor(majorID, schoolCourseIDs, response){
	response = response || null;
	var query = 'INSERT INTO tMajorCourses (majorID, courseID) VALUES ';
	for(i in schoolCourseIDs){
		query += '(' + majorID + ', (SELECT DISTINCT idtCourse FROM tCourse ';
        query += 'WHERE schoolID = (select schoolID FROM tMajors WHERE idtMajors = ' + majorID + ')';
        query += ' AND schoolCourseID = "' + schoolCourseIDs[i] + '"))';
		if(i == schoolCourseIDs.length-1){
			query+=';';
		} else {
			query += ',';
		}
		//console.log(query);
	}

	var result;
	connection.query(query, function(err) {
		if (!err) {
			//getLastInsertID(response);
			console.log('Added courses to major: ' + majorID + '.');
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse()
			}
		}
	});	
}


function printUnicode(str){
	var i;
	for(i = 0; i < str.length; i++){
		console.log(str.charCodeAt(i));
	}
}

//-----------------GETS DBCOURSEID WITH SCHOOLID AND SCHOOLCOURSEID-----------------------------------------
/**
 * Adds an existing course to an existing major 
 * @param {String} schoolCourseID - The abbreviation of the course i.e. CSE002
 * @param {Number} schoolID - The DB id of the school 
 * @param {Object} callback - callback function to be called on completion
 * @return {Number} - The numerical db insertion id id -1 on err through callback
 */
function getCourseDBID(schoolCourseID, schoolID, _callback) {
	//printUnicode(schoolCourseID);
	if(!schoolCourseID || !schoolID){
		console.log("Get course DBID not given sufficient arguments");
		id = -1;
		//_callback(id);
		return;
	}
	//console.log("School: " + schoolID + " Prereq: " + schoolCourseID);
	var id;
	var query = 'SELECT idtCourse FROM tCourse ';
	query += 'WHERE schoolID = ' + schoolID + ' AND schoolCourseID LIKE "' + schoolCourseID + '";';
	//console.log(query);
	connection.query(query, function (err, rows, fields) {
		//console.log("in dbid connection");
		if (!err) {
			//console.log("row " + row);
			if(rows && rows.length > 0){
				id = rows[0]['idtCourse'];
				//console.log("Course database ID: " + id);
				_callback(id);
			}else{
				console.log("No course found with abbreviation: "+ schoolCourseID);
				id = -1;
				_callback(id);
				return;
			}
			
		}
		else {
			console.log("Error: " + err.message);
			id = -1;
			_callback(id);
		}
	});
}


//-----------------GET LAST INSERT ID----------------------------------------------------------------------
/**
 * Gets the primary key id of the last database insertion 
 * @param {Object} response - The http response object to be sent the ID
 * @return {Number} - the numerical db id -1 on err
 */
function getLastInsertID(response) {
	response = response || null;
	var id;
	query = 'SELECT LAST_INSERT_ID();';
	connection.query(query, function (err, rows, fields) {
		if (!err) {
			id = (rows[0]['LAST_INSERT_ID()']);
			console.log(id);
			if(response){
				successResponse(response, id);
			}
		}
		else {
			console.log(err.message);
			if(response){
				failedResponse(response, 500, err.message);
			}
			return -1;
		}
	});
	return id;
}

//---------------DON'T FUCK THIS UP OR OUR DB GETS FUCKED-----------------------------------------------------
exports.closeCon = function() {
	connection.end();
	console.log('Connection Closed');
}

/**
 * sends a successful response to the client with data or a success message
 * @param {Object} res - The http response object
 * @param {Object} data - The data to be sent back to the http client
 * @param {String} message - Message to be sent indicating success if no data
 */
function successResponse(res, data, message){
    message = message || 'Default server success message.';
    //console.log("Sending request successResponse with data: " + data[0]);
    //var body = JSON.stringify(data);
    //console.log(body);
    res.writeHead(200, {
        //'Content-Length': Buffer.byteLength(body),
        'contenType': 'text/json'});
    if(data){
		res.write(data);
	}
	if(!data){
        res.end(message);
    }else{
        res.end()
    }
    console.log(message);

}

/**
 * sends a server error to the client with an error message.
 * @param {Object} res - The http response object
 * @param {Number} code - The error code to be sent to the client
 * @param {String} message - Error message to be sent to the client
 */
function failedResponse(res, code, message){
    message = message || "Request failed";
    res.writeHead(code);
    res.end(message)
}

/* FUCKING WITH THE database
tMajors:
INSERT INTO `ezFlowDB`.`tMajors` (`idtMajors`, `name`, `schoolID`, `notes`) VALUES (NULL, NULL, NULL, NULL);

INSERT INTO `ezFlowDB`.`tCourse` (`idtCourse`, `schoolCourseID`, `name`, `description`, `credits`, `courseLink`, `schoolID`) VALUES (NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `ezFlowDB`.`tAdmin` (`idtAdmin`, `fName`, `lName`, `email`, `schoolID`, `tokenID`) VALUES (NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `ezFlowDB`.`tMajorCourses` (`majorID`, `courseID`) VALUES (NULL, NULL);

INSERT INTO `ezFlowDB`.`tPrerequisites` (`parentID`, `prereqID`) VALUES (NULL, NULL);

INSERT INTO `ezFlowDB`.`tSchool` (`idtSchool`, `name`) VALUES (NULL, NULL);
*/