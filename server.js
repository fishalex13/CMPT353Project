'use strict'
const express = require('express');
const bodyParser = require("body-parser");
const mysql = require("mysql");

// use port 8080 and localhost
const PORT = 8080;
const HOST = "0.0.0.0";
const app = express();

// use bodyParser
app.use(bodyParser.urlencoded({ extended: true }));

// serve html pages from the pages directory, store our html files in this directory
// specify the html file partA_main.html as the index file to be used, ie if the user
// navigates to the root path, they are served partA_main.html
app.use('/', express.static("pages",{"index":"partA_main.html"}));


// connect to the project database
var con = mysql.createConnection({
    host: 'mysql',
    user: 'root',
    database: 'project',
    password: 'admin'
  });

// connect to the database here initially so we only have to connect once
con.connect((err)=>{
    if (err){
        console.log("error while connecting to database");
        console.error(err);
    }
    else{
        console.log("connected to database");
    }
  });

app.post("/", (req,res)=>{
    // if the client makes a post request to the root path, we assume they are adding 
    // a student or staff member, get the input name and phone number for the person
    let inputName = req.body.name;
    let inputPhoneNumber = req.body.phoneNumber;
    // get the type of person the client wants to enter data for, either staff or 
    // student
    let personType = req.body.personType;
    console.log(`writing values: name: ${inputName}, phone number: ${inputPhoneNumber} to the database as ${personType}`);
    // be careful about inserting data directly into a table specified by the user, error prone
    let query = `INSERT INTO ${personType} (name, phoneNumber) VALUES ('${inputName}', '${inputPhoneNumber}')`;
    con.query(query, (err,result)=>{
        if(err){
            console.log("error occured while writing data to database");
            console.error(err);
        }
        else{
            console.log("data saved successfully");
        }
    });
});

app.get("/getPersonData", (req,res)=>{
    // read all staff from our database
    let staffQuery = "SELECT * FROM staff";
    con.query(staffQuery, (staffErr,staffResult)=>{
        if(staffErr){
            console.log("error occured while reading staff from the database");
            console.error(staffErr);
            res.send("error occured while looking up staff members");
        }
        else{
            // read all students from our database, we want to give the client both
            let studentsQuery = "SELECT * FROM students";
            con.query(studentsQuery, (studentsErr,studentsResult)=>{
                if(studentsErr){
                    console.log("error occured while reading students from the database");
                    console.error(studentsErr);
                    res.send("error occured while looking up students");
                }
                else{
                    // both database reads were successful, send a list of results back to the client
                    res.send({staffResult,studentsResult});
                }
            });
        }
    });
});

app.get("/getStudent/:studentName", (req,res)=>{
    let studentName = req.params.studentName;
    console.log(`client requested data for student ${studentName}`);
    // TODO: query the database and give data back to client etc
});

app.listen(PORT,HOST);

console.log("server up and running");