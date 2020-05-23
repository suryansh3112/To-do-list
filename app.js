// 'use strict';
// var rootCas = require('ssl-root-cas').create();
 
// // default for all https requests
// // (whether using https directly, request, or another module)
// ///latest
// require('https').globalAgent.options.ca = rootCas;






const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

//console.log(date);
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
mongoose
.connect("mongodb+srv://admin-Suryansh:Test-123@cluster0-9nb7p.mongodb.net/to-do-listDB",{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false}  )
.then(res=>{
    console.log("DB Connected!")
}).catch(err => {
console.log(Error, err.message);
});


const app = express();

app.use(bodyParser.urlencoded({extended : true}));

app.use(express.static("public"));
app.set('view engine', 'ejs');

const itemSchema = new mongoose.Schema({
    name : String
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
    name : "Welcome to your to do list."
});

const item2 = new Item({
    name : "Hit + to add items."
});

const item3 = new Item({
    name : "<-- Press here to delete items."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name : String,
    items : [itemSchema]
}

const List = new mongoose.model("List", listSchema); 


app.get("/",function(req,res){

   
    let day = date.getDay();

    Item.find({},function(err,items){
        if(items.length===0)
        {
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successully executed!");
                }
            });
            res.redirect("/");
        }
        else{
        res.render("list", {listTitle : day, listItems : items});
        }
    
    });

    

});

app.post("/",function(req,res){
    
    const newItem = req.body.newItem;
    const listName = req.body.list;

    const addItem = new Item({
        name : newItem
    })

    if(listName === date.getDay() ){
        addItem.save();
   
         res.redirect("/");
    }else{
        List.findOne({name : listName},function(err,foundList){
            foundList.items.push(addItem);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }
    
    

});

app.post("/delete", function(req,res){
    const id = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === date.getDay()){
        Item.findByIdAndRemove(id,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Removed Successully.");
            }
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name : listName},{$pull : {items : {_id : id}}},function(err,foundList){

            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name : customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                //create new list
                const list1 = new List ({
                    name : customListName,
                    items : defaultItems
                });
                list1.save();
                res.redirect("/"+customListName);
            }
            else{
                //show existing list
                res.render("list",{listTitle : customListName, listItems : foundList.items})
            }
        }
    });

    

});


app.listen(3000,function(){
    console.log("To-do-list running on port 3000.");
});