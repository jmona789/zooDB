var mysql = require("mysql");
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'zoo_db'
});
connection.connect(function(err){
  if (err){
    console.error("err connection" + err.stack);
    return;
  }
});
var prompt = require("prompt");
prompt.start();
prompt.message = "";

var zoo ={
  welcome: function(){
    console.log("Welcome to the Zoo And Friends App~!");
  },
  menu: function(){
    console.log("Enter (A): ------> to Add a new animal to the Zoo!\n");
    console.log("Enter (U): ------> to Update info on an animal in the Zoo!\n");
    console.log("Enter (V): ------> to Visit the animals in the Zoo!\n");
    console.log("Enter (D): ------> to Adopt an animal from the Zoo!\n");
    console.log("Enter (Q): ------> to Quit and exit the Zoo!\n");
  },
  add: function(input_scope){
    var currentScope = input_scope;
    console.log("To add an animal to the zoo please fill out the following form for us!(When entering name and type please put quotation marks around them)");
    prompt.get(["caretaker_id", "name", "type", "age"], function(err, result){
      var newEntryName = result.name;
      var query = "INSERT INTO animals(caretaker_id, name, type, age) VALUES ("+ result.caretaker_id + ", "+ result.name +", "+ result.type+ " ,"+ result.age+");";
      connection.query(query, function(err, result){
        if (err) throw err;
        console.log(newEntryName + " successfully added to database.");
        currentScope.menu()
        currentScope.promptUser()
      });
    });
  },
  visit: function(){
    console.log("Please choose an option from the following menu \n");
    console.log("Enter (I): ------> do you know the animal by it’s id? We will visit that animal!\n");
    console.log("Enter (N): ------> do you know the animal by it’s name? We will visit that animal!\n");
    console.log("Enter (A): ------> here’s the count for all animals in all locations! \n");
    console.log("Enter (C): ------> here’s the count for all animals in this one city! \n");
    console.log("Enter (O): ------> here’s the count for all the animals in all locations by the type you specified!\n");
    console.log("Enter (Q): ------> Quits to the main menu! \n");
    this.view(this);
  },
  view: function(input_scope){
    var currentScope = input_scope;
    prompt.get(["input"], function(err, result){
      if (result.input === "Q"){
        currentScope.menu();
        currentScope.promptUser();
      }else if(result.input ==="O"){
        currentScope.type(input_scope);
      }else if(result.input ==="I"){
        currentScope.animId(input_scope);
      }else if(result.input ==="N"){
        currentScope.name(input_scope);
      }else if(result.input ==="A"){
        currentScope.all(input_scope);
      }else if(result.input ==="C"){
        currentScope.care(input_scope);
      }else{
        console.log("Sorry didn't get that, come again?");
        currentScope.visit();
        currentScope.view(currentScope);
      }
    });
  },
  type: function(input_scope){
    var currentScope = input_scope;
    console.log("Enter animal type to find how many animals we have of those type.");
    prompt.get(["->", "animal_type"], function(err, result){
      connection.query("SELECT COUNT(type) AS AnimalsOfType FROM animals WHERE type="+result.type+";");
      currentScope.visit();
    });
  },
  care: function(input_scope){
    var currentScope = input_scope;
    console.log("Enter city name NY/SF");
    prompt.get(["city_name"], function(err, result){
      if (result.city_name === "NY"){
        connection.query("SELECT COUNT(caretaker_id) AS countByCity FROM animals WHERE caretaker_id=1", function(err, result){
          console.log("The total number of animals in that city is: " + result[0].countByCity);
          currentScope.visit();
        });
      }else if(result.city_name === "SF"){
        connection.query("SELECT COUNT(caretaker_id) AS countByCity FROM animals WHERE caretaker_id > 1 AND caretaker_id < 100", function(err, result){
          console.log("The total number of animals in that city is: " + result[0].countByCity);
          currentScope.visit();
        })
      }
    })
  },
  animId: function(input_scope){
    var currentScope = input_scope;
    console.log("Enter ID of the animal you want to visit.");
    prompt.get(["animal_id"], function(err, result){
      connection.query("SELECT * FROM animals WHERE id =" +result.animal_id + ";", function(err, result){
        if (err) throw err;
        //console.log("Animal Name: "+ result[0].name)
        console.log("Animal Name: " + result[0].name + "\nAge: " + result[0].age);
        currentScope.visit()
      });
    })
  },
  name: function(input_scope){
    var currentScope = input_scope;
    console.log("Enter name of the animal you want to visit.(Please surround name with qoutes)");
    prompt.get(["animal_name"], function(err, result){
      var query = "SELECT * FROM animals WHERE name =" +result.animal_name + ";"
      connection.query(query, function(err, result){
        if (err) throw err;
        console.log("Animal id: " + result[0].id + "\nAge: " + result[0].age);
        currentScope.visit();
      });
    });
  },
  all: function(input_scope){
    var currentScope = input_scope;
    connection.query("SELECT COUNT(*) FROM animals;", function(err, result){
      if (err) throw err;
      console.log("There are " + result[0]["COUNT(*)"] + " animals in all locations.");
      currentScope.visit();
    });
  },
  update: function(input_scope){
    var currentScope = input_scope;
    console.log("Fill of the following form to update an animals info by ID( When entering new name and new type please put quotation marks around them)")
    prompt.get(["id", "new_name", "new_age", "new_type", "new_caretaker_id"],function(err, result){
      var query = "UPDATE animals SET name=" + result.new_name + ", age =" + result.new_age + ", type=" + result.new_type + ", caretaker_id=" + result.new_caretaker_id + " WHERE id=" + result.id + ";";
      connection.query(query, function(err, result){
        if (err) throw err;
        console.log("Animal info successfully updated");
        currentScope.menu();
        currentScope.promptUser();
      });
    });
  },
  adopt: function(input_scope){
    var currentScope = input_scope;
    prompt.get(["animal_id"], function(err, result){
      connection.query("DELETE FROM animals WHERE id="+ result.animal_id +";");
    });
    currentScope.visit();
    currentScope.view(currentScope);
  },
  promptUser: function(){
    var self = this;
    debugger
    prompt.get("input", function(err, result){
      if (result.input === "Q"){
        self.exit();
      }else if(result.input === "A"){
        self.add(self);
      }else if(result.input === "V"){
        self.visit();
      }else if(result.input === "D"){
        self.adopt(self);
      }else if(result.input === "U"){
        self.update(self);
      }else{
        console.log("Sorry didn't get that, come again?")
      }
    });
  },
  exit: function(){
    console.log("Thank you for visiting us, good bye~!");
    process.exit();
  },
  open: function(){
    this.welcome();
    this.menu();
    this.promptUser();
  }
}

zoo.open();