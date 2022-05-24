 const express = require("express");
 const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

 const app = express();

 app.set("view engine", "ejs");
 app.use(bodyParser.urlencoded({
     extended: true
 }));
 app.use(express.static("public"));

  

mongoose.connect("mongodb://localhost:27017/todolistDB");

 const itemSchema = {
     name: String
 };
 const listSchema = {
     name: String,
     items: [itemSchema]
 };

 const Item = mongoose.model("Item", itemSchema);
 const List = mongoose.model("List", listSchema);

 app.get("/", function (req, res) {

     Item.find({}, function (err, foundItems) {

         res.render("list", {
             listTitle: "Today",
             newListItems: foundItems
         });


     });

 });


app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
        
    });
});


         app.post("/", function (req, res) {
             const itemName = req.body.newItem;
             const listName = req.body.list;
             const item = new Item({
                 name: itemName
             });

             if (listName === "Today")
             {
                 item.save();
             res.redirect("/");
             }
             else {
                 List.findOne({ name: listName }, function (err, foundList) {
                     foundList.items.push(item);
                     foundList.save();
                     res.redirect("/" + listName);
                 });
             }
             

         });

         app.post("/delete", function (req, res) {
             const checkedItemId = req.body.checkbox;
             const listName = req.body.listName;

             if (listName === "Today")
             {
                     Item.findByIdAndRemove(checkedItemId, function (err) {
                 if (!err) {
                     console.log("Successfully Deleted");
                     res.redirect("/");
                 } else {
                     console.log(err);
                 }
             });
             }
             else {
                 List.findOneAndUpdate(
                     { name: listName },
                     { $pull: { items: { _id: checkedItemId } } },
                     function (err, foundList) {
                         if (!err) {
                             res.redirect("/" + listName);
                         }
                        
                     }
                 );
             }

         
         });


     app.listen(3000, function () {
         console.log("Server started at port 3000")
     });