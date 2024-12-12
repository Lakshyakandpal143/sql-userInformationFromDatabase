const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express=require("express");
const app=express();  
const path=require("path");
const methodOverride=require("method-override");
const { v4: uuidv4 } = require('uuid');

let port =8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'delta_app',
    password:'lakshya123'
});

let getRandomUser = ()=> {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
}

app.listen(port,()=>{
    console.log("app is listening");
});


//home route
app.get("/",(req,res)=>{
    let q=`select count(*) from user;`;
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let count=result[0]["count(*)"];
        res.render("home.ejs",{count});
    });
    }catch(err){
    console.log(err);
    res.send("some error in the Database");
    }
});

//show route
app.get("/user",(req,res)=>{
    let q=`select * from user`;
    try{
    connection.query(q,(err,users)=>{
        if(err) throw err;
        res.render("show.ejs",{users});
    });
    }catch(err){
        console.log(err);
    }
});

//Edit Route
app.get("/user/:id/edit",(req,res)=>{
    let {id}=req.params;
    let q=`select * from user where id="${id}"`;
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        console.log(result);
        let user=result[0];
        res.render("edit.ejs",{user});
    });
    }catch(err){
        console.log(err);
    }
});

//UPDATE route

app.patch("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password:formpass,username:newUsername}=req.body;
    let q=`select * from user where id="${id}"`; 
    try{
        connection.query(q,(err,result)=>{
            if (err) throw err;
            console.log(result[0]);
            let user=result[0];
            if(formpass!=user.password){
                res.send("Wrong password");
            }else{
                let q2=`update user set username='${newUsername}' where id='${id}'`;
                connection.query(q2,(err,result)=>{
                    if(err) throw err;
                    res.redirect("/user");
                });
            }
        });
    }catch(err){
        console.log(err);
        res.send("some error in database");
    }
});

//Add new user form

app.get("/user/newUser",(req,res)=>{
    res.render("new.ejs");
});

//Add new user to database

app.post("/user",(req,res)=>{
    let id= uuidv4();
    let{email,username,password}=req.body;
    let q=`INSERT INTO user (id,email,username,password) VALUES('${id}','${email}','${username}','${password}')`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");
        });
    }catch(err){
        console.log("error in the database");
    }
});

//conformation of deletion 

app.delete("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password}=req.body;
    let q=`select * from user where id="${id}"`; 
    try{
        connection.query(q,(err,result)=>{
            if (err) throw err;
            console.log(result[0]);
            let user=result[0];
            if(password!=user.password){
                res.send("Wrong password");
            }else{
                let q2=`DELETE FROM user WHERE id='${id}'`;
                connection.query(q2,(err,result)=>{
                    if(err) throw err;
                    res.redirect("/user");
                });
            }
        });
    }catch(err){
        console.log(err);
        res.send("some error in database");
    }
});

//Delete page

app.get("/user/:id/del",(req,res)=>{
    let {id}=req.params;
    let q=`select * from user where id="${id}"`;
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        console.log(result);
        let user=result[0];
        res.render("del.ejs",{user});
    });
    }catch(err){
        console.log(err);
    }
    
});
