const router = require("express").Router();
const User = require("./model_user");
const Exercise = require("./model_exercise");


router.post("/new-user", async (req, res) => {
  try{
    const {username} = req.body;

    //find old user
    const foundUser = await User.findOne({username});
    if (foundUser) 
      return res.json("Username already taken")
    
    //add new 
    const newUser = await User.create({username});
    if(newUser)
      return res.json({username: newUser.username, _id:newUser._id});
    
    //if nth works
    throw Error("Internal Server Error 😅");
  }
  catch(err) {
    return res.json({'error': err.message});
  }
})



router.post("/add", async (req, res) => {
  try{    
    //find user first
    const {userId} = req.body;
    let foundUser = await User.findById(userId);
    
    if(foundUser) {
      req.body.date = req.body.date || new Date();
      const newExercise = await Exercise.create(req.body);
      if(newExercise) {        
        let resObj = {
          _id: foundUser._id,
          username: foundUser.username,
          date: newExercise.date.toDateString(),
          duration: newExercise.duration,
          description: newExercise.description
        };
        // console.log("add Response: ", resObj);
        return res.json(resObj)
      }  
      throw Error("Cannot create new Exercise 😥");
    }
    throw Error("Invalid User 😪");
    
  }
  catch(err) {
    return res.json({'error': err.message});
  }
})



router.get("/users", async (req, res) => {
  try {
    var allUsers = await User.find();
    
    return res.json(allUsers);
  }
  catch(err) {
    return res.json({'error': err.message});
  }
})


router.get("/log", async (req, res) => {
  try {
    const {userId, from, to, limit} = req.query;
    const user = await User.findById(userId);
    
    if(user) {
      var resObj = {
        _id: user._id,
        username: user.username
      };
      var log = await Exercise.find({userId})
                              .select('-_id description duration date')
                              .exec();
      
      //Filter...
      if(from) {
        let fromDate = new Date(from);
        log = log.filter(each => each.date.getTime() >= fromDate.getTime())
        resObj.from = fromDate.toDateString();
      }
      
      if(to) {
        let toDate = new Date(to);
        log = log.filter(each => each.date.getTime() <= toDate.getTime());
        resObj.to = toDate.toDateString();
      }
      
      if(limit) {
        log = log.slice(0, limit)
      }
      
      //Clean log data
      log = log.map(eachObj => {
        return {
          description: eachObj.description,
          duration: eachObj.duration,
          date: eachObj.date.toDateString()
        }
      })
      
      resObj.count = log.length;
      resObj.log = log;
      console.log("\n\n", resObj);
      
      return res.json(resObj);
    }
    throw Error("Unknown UserId!")
  }
  catch(err) {
    console.log("error...", err.message)
    return res.json({'error': err.message});
  }
})

module.exports = router;