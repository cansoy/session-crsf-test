const express=require("express")
const dotenv=require("dotenv").config()
const session =require("express-session")
const MongoDBStore=require("connect-mongodb-session")(session)
const server=express()

server.set("etag",false)
server.set("view engine","ejs")
server.set("views","./views")

server.use(express.json())
server.use(express.urlencoded({extended:true}))

const store=new MongoDBStore({
    uri:process.env.DB_URI,
    collection:"sessions"
})

server.use(session({
    name:"loginsession",
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    store:store,
    cookie:{
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:10*1000,
    }
}))

server.get("/login",(req,res)=>{
    console.log(req.sessionID)
    res.render("login")
})

server.post("/login",(req,res)=>{
    const {name,surname}=req.body
    if (name=="muhammed" && surname=="cansoy") {
        req.session.loggedUser={name:"muhammed",data:"muhammed-cansoy-logged",role:"all"}
       return res.redirect("/")
    }
    else{
        return res.redirect("/login")
    }
})

server.get("/logout",(req,res)=>{
    res.clearCookie("loginsession")
    res.redirect("/login")
})

server.get("/",(req,res)=>{
    const loggedUser =req.session.loggedUser
    if (!loggedUser) {
       return res.redirect("/login")
    }

    res.render("home")
})

server.get("/users",(req,res)=>{
    const loggedUser =req.session.loggedUser
    if (!loggedUser) {
       return res.redirect("/login")
    }

    res.render("users")
})

server.get("/todos",(req,res)=>{
    const loggedUser =req.session.loggedUser
    if (!loggedUser) {
        return res.redirect("/login")
    }
    else{
        if (loggedUser.role==="master") {
           return res.render("todos")
        }
        return res.redirect("/")
    }
})

server.delete("/delete-simple",(req,res)=>{
    // without-session-control open CRSF attacks
    console.log("deleted-simple")
    res.send("deleted")
})

server.delete("/delete-session",(req,res)=>{
    const loggedUser =req.session.loggedUser
    if (loggedUser) {
        return res.send("deleted")
    }
    else{
        res.send("what-are-you-trying!")
    }
    
})

server.listen(3000,()=>console.log("***************************"))