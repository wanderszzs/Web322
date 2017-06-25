/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: ____Zheshuang Zhang____ Student ID: __011-823-101__ Date: ____June-13-2017____
*
* Online (Heroku) Link: ____http://secret-taiga-49989.herokuapp.com__
*
********************************************************************************/

var service = require('./data-service.js');
var express = require("express");
var app = express();
var path = require("path");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

var HTTP_PORT = process.env.PORT || 8111;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

///add for assigment 4
app.engine(".hbs", exphbs({   extname: ".hbs",   defaultLayout: 'layout', 
  helpers: { 
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3) 
        throw new Error("Handlebars Helper equal needs 2 parameters");
      
      if (lvalue != rvalue) { 
        return options.inverse(this); 
      } else { 
        return options.fn(this); 
      } 
    } 
  } })); 
app.set("view engine", ".hbs");
///

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
   res.render("home");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
   res.render("about");
});

// setup http server to listen on HTTP_PORT
app.get("/employees", (req, res) => {


  if (req.query.status) {
    service.getEmployeesByStatus(req.query.status).then((data) => {
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err) => {
      res.render("employeeList", { data: {}, title: "Employees" });
    });

  } else if (req.query.department) {
    service.getEmployeesByDepartment(req.query.department).then((data) => {
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err) => {
      res.render("employeeList", { data: {}, title: "Employees" });
    });

 
  } else if (req.query.manager) {
    service.getEmployeesByManager(req.query.manager).then((data) => {
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err) => {
      res.render("employeeList", { data: {}, title: "Employees" });
    });

  } else {
    service.getAllEmployees().then((data) => {
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err) => {
      res.render("employeeList", { data: {}, title: "Employees" });
    });
  }


});

app.get("/employee/:empNum", (req, res) => {

    service.getEmployeeByNum(req.params.empNum).then((data) => {
      res.render("employee", { data: data });
    }).catch((err) => {     //from employee.hbs
      res.status(404).send("Employee Not Found!!!!");      
    });

});

app.get("/managers", function(req,res){
      service.getManagers().then(function(data){
        res.render("employeeList", { data: data, title: "Employees (Managers)" });   
      }).catch(function(err){
        res.render("employeeList", { data: {}, title: "Employees (Managers)" });    
      });
});

app.get("/departments", function(req,res){
      service.getDepartments().then(function(data){
         res.render("departmentList", { data: data, title: "Departments" });
      }).catch(function(err){
         res.render("departmentList", { data: {}, title: "Departments" });
      });
});

//addEmployee.hbs
app.get("/employees/add", (req, res) => {
    res.render("addEmployee");
});


app.post("/employees/add", (req, res) => {
    service.addEmployee(req.body).then(() => {
        console.log(req.body);
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    })
});

//Post route for the /employees/add
app.post("/employee/update", (req, res) => { 
    
    service.updateEmployee(req.body).then( (data) => {
      console.log(req.body); 
      res.redirect("/employees"); 
    }).catch(function(err){
      console.log(err);
  });
});


app.use(function(req, res) {
  res.status(404).send("Status:404 and Page Not Found!");
});

// setup http server to listen on HTTP_PORT
service.initialize().then(() =>{
  app.listen(HTTP_PORT, onHttpStart);
}).catch((err)=>{
  console.log("unable to start dataService: " + err);
});


