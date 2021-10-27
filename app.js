//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://chanakya:chinnasandy123@cluster0.elwih.mongodb.net/myFirstDatabase?retryWrites=true&w=majority").then(() => {
    console.log("connection success ... .. .");
}).catch((err) => {
    console.log("no connection ...!");
});

const itemSchema = ({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "wake - up"
});
const item2 = new Item({
    name: "eat"
});
const item3 = new Item({
    name: "work"
});

const itemArray = [item1, item2, item3];

const listSchema = ({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

    Item.find({}, function(err, founditem) {
        if (founditem.length === 0) {
            Item.insertMany(itemArray, function(err) {
                if (!err) {
                    console.log("successfully inserted .... ... .. .");
                }
            });
            res.redirect('/');
        } else {
            res.render("list", { listTitle: "Home", newListItems: founditem });
        }
    });
});

app.post("/", function(req, res) {

    const enteredItem = req.body.newItem;
    const titilName = req.body.titlelist;

    const item = new Item({
        name: enteredItem
    })
    if (titilName === "Home") {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: titilName }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
        })
        res.redirect("/" + titilName);
    };
});

app.post("/delete", function(req, res) {
    const deleteId = req.body.checkbox;
    const headItem = req.body.headItem;

    if (headItem === "Home") {
        Item.findByIdAndRemove(deleteId, function(err) {
            if (!err) {

                res.redirect("/");
            }
        })
    } else {
        List.findOneAndUpdate({ name: headItem }, { $pull: { items: { _id: deleteId } } }, function(err, foundList) {

            res.redirect("/" + headItem);

        })
    }
});

app.get("/:postName", (req, res) => {

    const userDefined = _.capitalize(req.params.postName);

    List.findOne({ name: userDefined }, function(err, founItem) {

        if (!err) {
            if (!founItem) {
                const list = new List({
                    name: userDefined,
                    items: itemArray
                });
                list.save();
                res.redirect("/" + userDefined);
            } else {
                res.render("list", { listTitle: userDefined, newListItems: founItem.items });
            }
        }
    })
});

app.get("/work", function(req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000 .... ... .. .");
});