const mysql = require("mysql");
const express= require("express");
const session = require("express-session");
const path = require('path');
const bodyParser= require("body-parser");
const encoder = bodyParser.urlencoded();
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require("fs");
const ExcelJS = require('exceljs');
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');



const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: 'SWD\PRINTENUM\{FF5B6080-21A2-4F6B-8554-85889C3BFCF3}',
});

const isConnected = printer.isPrinterConnected();

if(isConnected){
  console.log('The printer is connected.');
try{
printer.setTextDoubleHeight();
printer.alignCenter();
printer.println("Hello, Thermal Printer!");
//printer.cut();
printer.execute();
console.log('Printed successfully.');
}catch (error) {
  console.error('Error printing:', error);
}
} else {
console.log('The printer is not connected.');
}


const app = express();

app.use("/assets",express.static("assets"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
      secret: "12345qwertasdfzxcv", 
      resave: false,
      saveUninitialized: true,
    })
  );

  // ======================================= NODE MAILER SETUP =================================================

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'muthubalasudhan7@gmail.com',
        pass: 'ukfv zmop ruru hiwk',
    },
});


const connection = mysql.createConnection({
    host: "localhost",
    user:"root",
    password: "1234",
    port:"3306",
    database:"sample1"
    
});

// ================================ INVOICE CREATION FUNCTION ================================================================
function createInvoice(invoice, path) {
  console.log("invoice data",invoice);
	let doc = new PDFDocument({ size: "A4", margin: 50 });

	generateHeader(doc);   
	
  const contentStartY = 220;
  doc.fontSize(12);

  const availableSpace = doc.page.height - doc.y;
  const requiredSpace = 7 * 12; // Assuming 5 lines of text
  if (availableSpace < requiredSpace) {
    doc.addPage();
  }

  doc.text(`Invoice Number: ${invoice.invoice_nr}`);
  doc.moveDown();

  doc.text(`Billing Information:`);
  doc.text(`Name: ${invoice.shipping.name}`);
  doc.text(`Address: ${invoice.shipping.address}`);
  doc.text(`City: ${invoice.shipping.city}`);
  doc.moveDown();

  doc.text(`Payment Details:`);
  doc.text(`Description: ${invoice.items[0].description}`);
  doc.text(`Amount: ${invoice.items[0].amount}`);
  doc.moveDown();
  
  doc.text(`Total Amount: ${invoice.subtotal}`);

  generateFooter(doc); 
	doc.end();
	doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc) {
	doc.image('logo.png', 50, 45, { width: 50 })
		.fillColor('#444444')
		.fontSize(20)
		.text('ACME Inc.', 110, 57)
		.fontSize(10)
		.text('123 Main Street', 200, 65, { align: 'right' })
		.text('New York, NY, 10025', 200, 80, { align: 'right' })
		.moveDown();
}

function generateFooter(doc) {
	doc.fontSize(
		10,
	).text(
		'Payment is due within 15 days. Thank you for your business.',
		50,
		780,
		{ align: 'center', width: 500 },
	);
}


// ================================= FUNCTION TO CHECK WHETHER FUNCTION IS ASSIGNED TO WRITER OR NOT =================================================
function checkFunctionAssignment(user_id, callback) {
  connection.query(
      "SELECT u.user_id,u.user_type, fd.function_id, wd.writer_id, u.name " +
      "FROM users u " +
      "JOIN writer_details wd ON u.user_id = wd.user_id " +
      "JOIN function_writer fw ON wd.writer_id = fw.writer_id " +
      "JOIN function_details fd ON fd.function_id = fw.function_id " +
      "WHERE function_date = CURRENT_DATE() AND u.user_id = ?",
      [user_id],
      function (error, results) {
          if (error) {
              console.error("Error:", error);
              callback(null,error); 
          } else {
              // Check if there are results indicating the user is assigned
              //const isAssigned = results.length > 0;
              callback(results,null);
          }
      }
  );
}

// ================================ ROUTE TO HANDLE USER LOGIN =============================================================

app.post("/login",encoder,function(req,res){
    var phone_no = req.body.username;
    var password = req.body.password;

    connection.query("select * from sample1.users where phone_no = ? and password = ?",[phone_no,password] ,function(error,results,fields){
        if (error) {
            console.error("Error:", error);
            return res.json({ success: false, message: "An error occurred during login." });
        }
        if (results.length > 0) {
                if (results[0].user_type === 1){
                    req.session.adminUser = results[0];
                    const name = results[0].name;
                    const user_id = results[0].user_id;
                    req.session.user_id = user_id;
                    req.session.name = name;
                    //console.log(req.session.adminUser);                    
                  return res.json({
                    success:true,
                    redirect:"/home",
                    name: name,
                    user_id : user_id, 
                    });
                } else if (results[0].user_type === 2){
                  const user_id = results[0].user_id;
                  checkFunctionAssignment(user_id, (results, error) => {
                    if (error) {
                      return res.json({ success: false, message: "An error occurred while checking function assignment." });
                  }
                    if (results && results.length > 0) {
                      console.log(results);
                      const user_id = results[0].user_id;
                      const loggedInUserType = results[0].user_type;
                      const function_id = results[0].function_id;
                      const writer_id = results[0].writer_id;
                      const name = results[0].name;
                      req.session.writerUser = results[0];
                      req.session.user_id = user_id;
                      req.session.loggedInUserType = loggedInUserType;
                      req.session.name = name;
                      req.session.function_id = function_id;
                      req.session.writer_id = writer_id;

                      return res.json({
                        success:true,
                        redirect:"/writer_home",
                        user_id : user_id,
                        loggedInUserType : loggedInUserType,
                        function_id: function_id,
                        writer_id: writer_id,
                        name : name
                      });
                    } else{
                      return res.json({ success: false, message: "Please contact admin for access." });
                    }     
                  });  
                }
                else if (results[0].user_type === 3){
                  console.log("user type 3 is called");
                  const user_id = results[0].user_id;

                  connection.query(
                    "SELECT u.user_id, u.user_type, fd1.function_id, cd.customer_id, ca.end_date, u.name " +
                    "FROM users u " +
                    "JOIN customer_access ca ON u.user_id = ca.user_id " +
                    "JOIN function_details fd1 ON fd1.function_id = ca.function_id " +
                    "JOIN customer_details cd ON u.user_id = cd.user_id " +
                    "WHERE CURRENT_DATE() < ca.end_date AND u.user_id = ? AND fd1.is_delete = 0",
                    [user_id],
                    function (error, results) {
                      if (error) {
                        console.error("Error:", error);
                        return res.json({ success: false, message: "An error occurred while checking function assignment." });
                      }
                      if (results && results.length > 0) {
                        const user_id = results[0].user_id;
                        const loggedInUserType = results[0].user_type;
                        const function_id = results[0].function_id;
                      const customer_id = results[0].customer_id;
                      const name = results[0].name;
                      req.session.customerUser = results[0];
                      req.session.user_id = user_id;
                      req.session.loggedInUserType = loggedInUserType;
                      req.session.name = name;
                      req.session.function_id = function_id;
                      req.session.customer_id = customer_id;

                      return res.json({
                        success:true,
                        redirect:"/customer_home",
                        user_id : user_id,
                        loggedInUserType : loggedInUserType,
                        function_id: function_id,
                        customer_id: customer_id,
                        name : name
                      });
                      } else {
                        return res.json({ success: false, message: "Please contact admin for access." });
                      }
                    }
                  );

                }
                    
            } else { 
                return res.json({ success: false, message: "Username or password does not exist." });
            }
            
        });        
});

// =============================== ROUTE TO CHECK AND UPDATE THE PASSWORD ======================================================

app.post('/checkUpdatePassword', (req, res) => {
  let phone = req.body.phone;
  let currentPassword = req.body.currentPassword;
  let newPassword = req.body.newPassword;

  console.log(phone,currentPassword,newPassword);

  // Check if the current password exists in the database
  const sql = 'SELECT * FROM users WHERE phone_no = ? and  password = ?';
  connection.query(sql, [phone, currentPassword], function (error, results) {
    if (error){
      console.log("error called");
      return res.status(500).send('Internal Server Error');
    }
       
    if (results.length > 0) {
      let email=results[0].email;
  console.log("email:",email);
      // Password exists, allow the user to update it
      const updateSql = 'UPDATE users SET password = ? WHERE phone_no = ?';
      connection.query(updateSql, [newPassword, phone], (err, results) => {
        if (err){
          return res.status(500).send('Internal Server Error');
        }
//=================================Mail Sending Configuration============================================================
       // console.log(email);
       // console.log("Send an email to the recipient");
        const recipientEmail = email; 
        const mailOptions = {
            from: 'muthubalasudhan7@gmail.com', // Sender email address
            to: recipientEmail, 
            subject: 'Password Updated Successfully',
            text: `Your password has been successfully updated. Your new password is ${newPassword}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
              console.error('Error sending email: ' + err);
          } else {
              console.log('Email sent: ' + info.response);
          }
      });
//===============================Password updated=========================================================================
        res.json({success: true,message:"Password updated successfully and Mail sent to your MailID"});
      });
    } 
    else {
      res.status(401).json({message:'Current password does not match'});
    }
  
  });
});


// =========================================== ROUTE TO HANDLE THE WRITER REGISTRATION FORM ===================================================

app.post('/writersubmit', (req, res) => {
    console.log(req.body);
      const {name,phone_no,email,gender,dateofbirth,writer_address,writer_city,altphonenumber} = req.body; // Assuming the field name is "customer_address"
  
          const user_type = 2 ;
          const yearofbirth = new Date(dateofbirth).getFullYear();
          const password = `${name}@${yearofbirth}`;
               
       // Start a database transaction
      connection.beginTransaction(function (err) {
        if (err) {
            console.error('Error starting database transaction:', err);
            res.status(500).json({ success: false, message: 'Failed to start database transaction' });
            return;
        }
  
        // Insert data into the 'users' table, including the generated password
    const userSql = 'INSERT INTO users (name, phone_no, password, user_type, email, gender) VALUES (?, ?, ?, ?, ?, ?)';
    const userValues = [name, phone_no, password, user_type, email, gender ];
    connection.query(userSql, userValues, function (err, userResult) {
      if (err) {
        connection.rollback(function () {
          console.error('Error inserting user data:', err);
          res.status(500).json({ success: false, message: 'Failed to insert user data' });
        });
      } else{
      const user_id = userResult.insertId;    

      // Insert data into the 'writer_details' table, linking it to the corresponding user
      const writerSql = 'INSERT INTO writer_details (writer_dob, writer_address, writer_city, writer_alternate_phone_no, user_id) VALUES (?, ?, ?, ?, ?)';
      const writerValues = [dateofbirth, writer_address, writer_city, altphonenumber, user_id];
      connection.query(writerSql, writerValues, function (err, writerResult) {
        if (err) {
          connection.rollback(function () {
            console.error('Error inserting writer data:', err);
            res.status(500).json({ success: false, message: 'Failed to insert writer data' });
          });          
        }else {
            connection.commit(function (err) {
              if (err) {
                connection.rollback(function () {
                  console.error('Error committing transaction:', err);
                  res.status(500).json({ success: false, message: 'Failed to commit transaction' });
                });
              } else {
                console.log('Both tables updated successfully.');
                const mailOptions = {
                  from: 'muthukumar143412@gmail.com', // Sender email address
                  to: email, // Recipient email address from the request
                  subject: 'Account Created Successfully',
                  text: `Your account has been successfully created. Welcome to our platform!\nUsername: ${phone_no}\nPassword: ${password}`,
                };

                transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                    console.error('Error sending email: ' + err);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
                res.json({ success: true, message: 'Writer and user data inserted successfully' });
              }
            });
        }              
            });
        }
        });
    });
  });

 
// ========================================= ROUTE TO UPDATE WRITER DATA FROM EDIT WRITER FORM ===================================================================
  
app.post('/update-writer-data', (req, res) => {
    //console.log(req.body);
      const {writer_id,name,phone_no,email,gender,dateofbirth,writer_address,writer_city,altphonenumber,user_id} = req.body; // Assuming the field name is "customer_address"

      console.log("user_id",user_id);
      console.log("writer_id",writer_id);
      const updateWriterFields = {
        writer_dob : dateofbirth,
        writer_address: writer_address,
        writer_city : writer_city,
        writer_alternate_phone_no : altphonenumber,      
      };
  
      const updateUserFields ={
        name : name,
        phone_no : phone_no,
        email : email,
        gender : gender,
      }
  
       // Start a database transaction
      connection.beginTransaction(function (err) {
        if (err) {
            console.error('Error starting database transaction:', err);
            res.status(500).json({ success: false, message: 'Failed to start database transaction' });
            return;
        }
  
        // Update the writer_details table
        const writerSql = 'UPDATE writer_details SET ? WHERE writer_id = ?';
        connection.query(writerSql, [updateWriterFields, writer_id], function (err, result) {
            if (err) {
                connection.rollback(function () {
                    console.error('Error updating writer data:', err);
                    res.status(500).json({ success: false, message: 'Failed to update writer data' });
                });
            }
  
            // Update the users table
            const userSql = 'UPDATE users SET ? WHERE user_id = ?';
            connection.query(userSql, [updateUserFields, user_id], function (err, result) {
                if (err) {
                    connection.rollback(function () {
                        console.error('Error updating user data:', err);
                        res.status(500).json({ success: false, message: 'Failed to update user data' });
                    });
                }
  
                // Commit the transaction if both updates are successful
                connection.commit(function (err) {
                    if (err) {
                        connection.rollback(function () {
                            console.error('Error committing transaction:', err);
                            res.status(500).json({ success: false, message: 'Failed to commit transaction' });
                        });
                    } else {
                        console.log('Both tables updated successfully1.');
                        res.json({ success: true, message: 'Writer and user data updated successfully' });
                    }
                });
            });
        });
    });
});
// =======================================================================================================================================================

//=========================================== ROUTE TO UPDATE THE WRITER'S STATUS FOR ENABLING AND DISABLING (1 0) =======================================
app.post("/update_writer_status", (req, res) => {
  const { user_id, status } = req.body;

  console.log(user_id);
  console.log(status);

  // Update the user's status in the users table
  const sql = "UPDATE users SET status = ? WHERE user_id = ?";
  connection.query(sql, [status, user_id], (err, result) => {
      if (err) {
          console.error("Error updating status:", err);
          res.status(500).json({ message: "Error updating status." });
      } else {
          console.log("Status updated successfully");
          res.json({ message: "Status updated." });
      }
  });
});


// =================================== ROUTE TO DELETE A PARTICULAR WRITER BY THEIR PHONE NUMNER ==========================================

app.delete('/delete-writer/:phone_no', (req, res) => {
    // Extract the customerId parameter from the URL
    const phone_no = req.params.phone_no;    
  
  // For example, if you are using a SQL database, you can use a SQL UPDATE statement:
  connection.query('UPDATE users SET is_delete = 1 WHERE phone_no = ?', [phone_no], (error, result) => {
          if (error) {
              console.error("Error marking writer as deleted:", error);
              res.status(500).json({ success: false, message: "Failed to mark writer as deleted" });
          } else {
              res.json({ success: true, message: "Writer marked as deleted successfully" });
          }
      });
  });


// =================================== ROUTE TO UPDATE THE EXISTING CUSTOMER DETAILS ===================================================

app.post('/update-customer-data', (req, res) => {
  //console.log(req.body);
    const {customer_id,name,phone_no,email,gender,dateofbirth,customer_address,customer_city,altphonenumber,user_id} = req.body;

    const updateCustomerFields = {
      customer_dob : dateofbirth,
      customer_address: customer_address,
      customer_city : customer_city,
      customer_alternate_phone_no : altphonenumber,      
    };

    const updateUserFields ={
      name : name,
      phone_no : phone_no,
      email : email,
      gender : gender,
    }

     // Start a database transaction
    connection.beginTransaction(function (err) {
      if (err) {
          console.error('Error starting database transaction:', err);
          res.status(500).json({ success: false, message: 'Failed to start database transaction' });
          return;
      }

      // Update the customer_details table
      const customerSql = 'UPDATE customer_details SET ? WHERE customer_id = ?';
      connection.query(customerSql, [updateCustomerFields, customer_id], function (err, result) {
          if (err) {
              connection.rollback(function () {
                  console.error('Error updating customer data:', err);
                  res.status(500).json({ success: false, message: 'Failed to update customer data' });
              });
          }

         const userSql = 'UPDATE users SET ? WHERE user_id = ?';
          connection.query(userSql, [updateUserFields, user_id], function (err, result) {
              if (err) {
                  connection.rollback(function () {
                      console.error('Error updating user data:', err);
                      res.status(500).json({ success: false, message: 'Failed to update user data' });
                  });
              }

              connection.commit(function (err) {
                  if (err) {
                      connection.rollback(function () {
                          console.error('Error committing transaction:', err);
                          res.status(500).json({ success: false, message: 'Failed to commit transaction' });
                      });
                  } else {
                      console.log('Both tables updated successfully.');
                      res.json({ success: true, message: 'Customer and user data updated successfully' });
                  }
              });
          });
      });
  });
});


  //=============================== ROUTE TO DELETE THE PARTICULAR CUSTOMER BASED ON THEIR PHONE NUMBER ===========================================
  app.delete('/delete-customer/:phone_no', (req, res) => {
    const phone_no = req.params.phone_no;    
  
  // For example, if you are using a SQL database, you can use a SQL UPDATE statement:
  connection.query('UPDATE users SET is_delete = 1 WHERE phone_no = ?', [phone_no], (error, result) => {
          if (error) {
              console.error("Error marking Customer as deleted:", error);
              res.status(500).json({ success: false, message: "Failed to mark Customer as deleted" });
          } else {
              res.json({ success: true, message: "Customer marked as deleted successfully" });
          }
      });
  });
  

// ====================== ROUTE TO HANDLE THE CUSTOMER REGISTRATION FORM ==================================================

  app.post('/customersubmit', (req, res) => {
    console.log(req.body);
      const {name,phone_no,email,gender,dateofbirth,customer_address,customer_city,altphonenumber} = req.body; 
  
          const user_type = 3 ;
          const yearofbirth = new Date(dateofbirth).getFullYear();
          const password = `${name}@${yearofbirth}`;
               
       // Start a database transaction
      connection.beginTransaction(function (err) {
        if (err) {
            console.error('Error starting database transaction:', err);
            res.status(500).json({ success: false, message: 'Failed to start database transaction' });
            return;
        }
  
        // Insert data into the 'users' table, including the generated password
    const userSql = 'INSERT INTO users (name, phone_no, password, user_type, email, gender) VALUES (?, ?, ?, ?, ?, ?)';
    const userValues = [name, phone_no, password, user_type, email, gender ];
    connection.query(userSql, userValues, function (err, userResult) {
      if (err) {
        connection.rollback(function () {
          console.error('Error inserting user data:', err);
          res.status(500).json({ success: false, message: 'Failed to insert user data' });
        });
      } else{
      const user_id = userResult.insertId;    

      // Insert data into the 'customer_details' table, linking it to the corresponding user
      const customerSql = 'INSERT INTO customer_details (customer_dob, customer_address, customer_city, customer_alternate_phone_no, user_id) VALUES (?, ?, ?, ?, ?)';
      const customerValues = [dateofbirth, customer_address, customer_city, altphonenumber, user_id];
      connection.query(customerSql, customerValues, function (err, customerResult) {
        if (err) {
          connection.rollback(function () {
            console.error('Error inserting customer data:', err);
            res.status(500).json({ success: false, message: 'Failed to insert customer data' });
          });          
        }else {
            connection.commit(function (err) {
              if (err) {
                connection.rollback(function () {
                  console.error('Error committing transaction:', err);
                  res.status(500).json({ success: false, message: 'Failed to commit transaction' });
                });
              } else {
                console.log('Both tables updated successfully.');
                const mailOptions = {
                  from: 'muthukumar143412@gmail.com', // Sender email address
                  to: email, // Recipient email address from the request
                  subject: 'Account Created Successfully',
                  text: `Hi ${name} \nYour account has been successfully created. Welcome to our platform! Your login credentials are : \nUsername: ${phone_no}\nPassword: ${password}`,
                };

                transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                    console.error('Error sending email: ' + err);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
                res.json({ success: true, message: 'Customer and user data inserted successfully' });
              }
            });
        }              
            });
        }
        });
    });
  });

// route to handle the customer registration form and sending mail to the inserted customer ends here ------------------------------------------- 


// ================================================ ROUTE TO HANDLE THE ADD FUNCTION FORM & ASSIGNING WRITERS ============================================

app.post('/insert-function-data', (req, res) => {
  console.log(req.body);
    const {function_name,function_date,function_address,customer_id,function_city,user_id,writer_ids} = req.body; 
        
     // Start a database transaction
    connection.beginTransaction(function (err) {
      if (err) {
          console.error('Error starting database transaction:', err);
          res.status(500).json({ success: false, message: 'Failed to start database transaction' });
          return;
      }

      // Insert data into the 'function_details' table
  const functionSql = 'INSERT INTO function_details (function_name,function_date,function_address,customer_id,function_city) VALUES (?, ?, ?, ?, ?)';
  const functionValues = [function_name,function_date,function_address,customer_id,function_city];
  connection.query(functionSql, functionValues, function (err, functionResult) {
    if (err) {
      connection.rollback(function () {
        console.error('Error inserting function data:', err);
        res.status(500).json({ success: false, message: 'Failed to insert function data' });
      });
    } else {
    const function_id = functionResult.insertId;    

    // Insert data into the 'function_writer' table, for each of the writer_id...
    const functionWriterSql = 'INSERT INTO function_writer (function_id,writer_id) VALUES ?';
    
    // Construct an array of arrays for multiple value sets
    const functionWriterValues = writer_ids.map(writer_id => [function_id, writer_id]);

    const placeholders = functionWriterValues.map(() => '(?, ?)').join(', ');

    const sqlStatement = functionWriterSql.replace('?', placeholders);

    connection.query(sqlStatement, functionWriterValues.flat(), function (err, functionWriterResult) {
      if (err) {
        connection.rollback(function () {
          console.error('Error inserting funtion writer data:', err);
          res.status(500).json({ success: false, message: 'Failed to insert funtion writer data' });
        });          
      }else {
            const customerAccessSql = 'INSERT INTO customer_access (user_id, start_date, end_date, function_id) VALUES (?, ?, ?, ?)';
            const start_date = function_date;
            const end_date = new Date(function_date); 
            end_date.setDate(end_date.getDate() + 7);
            console.log(start_date);
            console.log(end_date);
            const customerAccessValues = [user_id, start_date, end_date, function_id];

            connection.query(customerAccessSql, customerAccessValues, function (err, customerAccessResult) {
              if (err) {
                connection.rollback(function () {
                  console.error('Error inserting customer_access data:', err);
                  res.status(500).json({ success: false, message: 'Failed to insert customer_access data' });
                });
              } else {
                  connection.commit(function (err) {
                    if (err) {
                      connection.rollback(function () {
                        console.error('Error committing transaction:', err);
                        res.status(500).json({ success: false, message: 'Failed to commit transaction' });
                      });
                    } else {
                      console.log('Three tables inserted successfully.');
                      res.json({ success: true, message: 'Function, Function Writer and customer access data inserted successfully' });
                    }
                  });
                }              
              });
            }
          });
        }
      });
    });
  });


//================================ Update the function details and writer assignments ========================================
app.post('/update-function-data', (req, res) => {
  console.log(req.body);
  const { function_id, function_name, function_date, function_address, function_city, user_id, writer_ids } = req.body;

  // Start a database transaction
  connection.beginTransaction(function (err) {
      if (err) {
          console.error('Error starting database transaction:', err);
          res.status(500).json({ success: false, message: 'Failed to start database transaction' });
          return;
      }

      // Update data in the 'function_details' table
      const functionSql = 'UPDATE function_details SET function_name=?, function_date=?, function_address=?, function_city=? WHERE function_id=?';
      const functionValues = [function_name, function_date, function_address, function_city, function_id];

      connection.query(functionSql, functionValues, function (err, functionResult) {
          if (err) {
              connection.rollback(function () {
                  console.error('Error updating function data:', err);
                  res.status(500).json({ success: false, message: 'Failed to update function data' });
              });
          } else {
              // Remove existing writer assignments for this function
              const deleteFunctionWriterSql = 'DELETE FROM function_writer WHERE function_id = ?';
              connection.query(deleteFunctionWriterSql, [function_id], function (err, deleteResult) {
                  if (err) {
                      connection.rollback(function () {
                          console.error('Error deleting function writer data:', err);
                          res.status(500).json({ success: false, message: 'Failed to delete function writer data' });
                      });
                  } else {
                      // Insert new writer assignments into the 'function_writer' table
                      const functionWriterSql = 'INSERT INTO function_writer (function_id, writer_id) VALUES ?';
                      const functionWriterValues = writer_ids.map(writer_id => [function_id, writer_id]);
                      connection.query(functionWriterSql, [functionWriterValues], function (err, functionWriterResult) {
                          if (err) {
                              connection.rollback(function () {
                                  console.error('Error inserting function writer data:', err);
                                  res.status(500).json({ success: false, message: 'Failed to insert function writer data' });
                              });
                          } else {
                            const customerAccessSql = 'UPDATE customer_access SET start_date = ?, end_date = ? WHERE function_id = ? and user_id = ?';
                            const start_date = function_date;
                            const end_date = new Date(function_date); 
                            end_date.setDate(end_date.getDate() + 7);
                            console.log(start_date);
                            console.log(end_date);
                            const customerAccessValues = [start_date, end_date, function_id, user_id,];

                            connection.query(customerAccessSql, customerAccessValues, function (err, customerAccessResult) {
                              if (err) {
                                connection.rollback(function () {
                                  console.error('Error inserting customer_access data:', err);
                                  res.status(500).json({ success: false, message: 'Failed to insert customer_access data' });
                                });
                              }else{
                              connection.commit(function (err) {
                                  if (err) {
                                      connection.rollback(function () {
                                          console.error('Error committing transaction:', err);
                                          res.status(500).json({ success: false, message: 'Failed to commit transaction' });
                                      });
                                  } else {
                                      console.log('Function data and writer assignments updated successfully.');
                                      res.json({ success: true, message: 'Function data and writer assignments updated successfully' });
                                  }                                
                              });
                            }
                          });
                      };
                  });
                }
              });
            }
      });
  });
});

// ============================= ROUTE TO DELETE PARTICULAR FUNCTION BASED ON THE FUNCTION ID AND USER-ID ==================================
app.delete('/delete-function/:function_id/:user_id', (req, res) => {
  const {function_id , user_id}= req.params;

  console.log("function id",function_id);
  console.log("user id",user_id);

  // First, set the is_delete field to 1 in the function_details table
  const updateFunctionQuery = `UPDATE function_details SET is_delete = 1 WHERE function_id = ?`;

  connection.query(updateFunctionQuery, [function_id], (updateError, updateResults) => {
    if (updateError) {
      console.error('Error updating function_details:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to update function details' });
    }

    if (updateResults.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Function not found' });
    }

    // Next, delete records in the function_writer table for the given function_id
    const deleteFunctionWritersQuery = `DELETE FROM function_writer WHERE function_id = ?`;

    connection.query(deleteFunctionWritersQuery, [function_id], (deleteError, deleteResults) => {
      if (deleteError) {
        console.error('Error deleting function_writer records:', deleteError);
        return res.status(500).json({ success: false, message: 'Failed to delete function writers' });
      }

      // Check if any records were deleted from function_writer
      if (deleteResults.affectedRows === 0) {
        console.log('No function_writer records to delete');
      }

      const deleteCustomerAccessQuery = `DELETE FROM customer_access WHERE user_id = ? AND function_id = ?`;

      connection.query(deleteCustomerAccessQuery, [user_id, function_id,], (deleteAccessError, deleteAccessResults) => {
        if (deleteAccessError) {
          console.error('Error deleting customer_access records:', deleteAccessError);
          return res.status(500).json({ success: false, message: 'Failed to delete customer access records' });
        }

        // Check if any records were deleted from customer_access
        if (deleteAccessResults.affectedRows === 0) {
          console.log('No customer_access records to delete');
        }

      // If both update and delete operations were successful, send a success response
      return res.json({ success: true, message: 'Function and related records deleted successfully' });
      });
    });
  });
});

// ============================== FUNCTION TO IMPLEMENT CREATING INVOICE FOR EACH VISITOR ======================================================================

function generateInvoice(paymentData) {
  console.log("payment data",paymentData);
  const invoice = {
    invoice_nr: paymentData.visitor_id, // You can use a unique identifier for each payment as the invoice number
    shipping: {
      name: paymentData.visitor_name,
      address: paymentData.visitor_address,
      city: paymentData.visitor_city,
      state: '', // Add state if available
      country: '', // Add country if available
    },
    subtotal: paymentData.visitor_payment,
    paid: 0, // Set to 0 since it's a new invoice
    items: [
      {
        item: 'Payment',
        description: `Payment for visitor ${paymentData.visitor_id}`,
        amount: paymentData.visitor_payment,
        quantity: 1,
      },
    ],
  };

  const pdfPath = `invoice_${paymentData.visitor_id}.pdf`; // You can customize the file naming as needed
  createInvoice(invoice, pdfPath);
}


//=============================== POST METHOD TO SUBMIT THE VISITOR DETAILS INTO VISITOR_DETAILS & VISITOR_PAYMENT TABLE ==========================================

app.post('/submit-visitor-form', (req, res) => {
  const {name,initial,phone_no,profession,husband_wifename,address,city,ismaternaluncle,paymentamount,user_id,function_id} = req.body;
 
  //console.log(req.body);

  const checkVisitorSql = 'SELECT visitor_id FROM visitor_details WHERE visitor_phone_no = ?';
  const checkVisitorValues = [phone_no];
  
  connection.query(checkVisitorSql, checkVisitorValues, (err, result) => {
    if (err) {
      console.error('Error checking visitor existence:', err);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    } else if (result.length > 0) {
      // Visitor already exists, insert only into the visitor_payments table
      const visitor_id = result[0].visitor_id;

      const paymentsSql = 'INSERT INTO visitor_payments (function_id,visitor_id, user_id,visitor_payment) VALUES (?, ?, ?, ?)';
      const paymentsValues = [function_id,visitor_id,user_id, paymentamount];

      connection.query(paymentsSql, paymentsValues, (err, paymentResult) => {
        if (err) {
          console.error('Error inserting data into visitor_payments:', err);
          res.status(500).json({ error: 'An error occurred while processing your request' });
        } else {
          console.log('Data inserted into visitor_payments table');
          res.status(200).json({ message: 'Data inserted successfully' });
        }
      });
    } else{
  const detailsSql  = 'INSERT INTO visitor_details (visitor_name, visitor_initial, visitor_phone_no, visitor_profession, visitor_husband_or_wifename, visitor_address, visitor_city, visitor_isMaternalUncle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const detailsValues  = [    
    name,
    initial,
    phone_no,
    profession,
    husband_wifename,
    address,
    city, 
    ismaternaluncle,     
  ];

  connection.query(detailsSql, detailsValues, (err, result) => {
    if (err) {
      console.error('Error inserting data into visitor_details:', err);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    } else {
      const visitor_id = result.insertId;

      const paymentsSql = 'INSERT INTO visitor_payments (function_id,visitor_id, user_id,visitor_payment) VALUES (?, ?, ?, ?)';
      const paymentsValues = [function_id,visitor_id,user_id, paymentamount];

      connection.query(paymentsSql, paymentsValues, (err, paymentResult) => {
        if (err) {
          console.error('Error inserting data into visitor_payments:', err);
          res.status(500).json({ error: 'An error occurred while processing your request' });
        } else {
      console.log('Data inserted into both tables');
     
      generateInvoice({
        visitor_id,
        visitor_name: name,
        visitor_address: address,
        visitor_city: city,
        visitor_payment: paymentamount,
      });

      res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  });
  }
});
    }
  });
});

// ============================================================================================================================================

// ========================================= ROUTE TO UPDATE VISITOR DATA FROM EDIT VISITOR FORM ===============================================
app.post('/update-visitor-data', (req, res) => {
  console.log(req.body);
    const {user_id,function_id,visitor_id,name,initial,phone_no,husband_wifename,profession,ismaternaluncle,visitor_address,visitor_city,visitor_payment} = req.body; 

    // console.log("user_id",user_id);
    // console.log("writer_id",writer_id);
    const updateVisitorFields = {
      visitor_name : name,
      visitor_initial : initial,
      visitor_phone_no : phone_no,
      visitor_husband_or_wifename : husband_wifename,
      visitor_profession : profession,
      visitor_isMaternalUncle : ismaternaluncle,
      visitor_address: visitor_address,
      visitor_city : visitor_city,           
    };

    const updatePaymentFields ={      
      visitor_payment : visitor_payment,
    }

     // Start a database transaction
    connection.beginTransaction(function (err) {
      if (err) {
          console.error('Error starting database transaction:', err);
          res.status(500).json({ success: false, message: 'Failed to start database transaction' });
          return;
      }

      // Update the visitor_details table
      const visitorSql = 'UPDATE visitor_details SET ? WHERE visitor_id = ?';
      connection.query(visitorSql, [updateVisitorFields, visitor_id], function (err, result) {
          if (err) {
              connection.rollback(function () {
                  console.error('Error updating visitor data:', err);
                  res.status(500).json({ success: false, message: 'Failed to update visitor data' });
              });
          }

          // Update the users table
          const paymentSql = 'UPDATE visitor_payments SET ? WHERE function_id = ? AND user_id = ? AND visitor_id = ?';
          connection.query(paymentSql, [updatePaymentFields, function_id,user_id,visitor_id], function (err, result) {
              if (err) {
                  connection.rollback(function () {
                      console.error('Error updating user data:', err);
                      res.status(500).json({ success: false, message: 'Failed to update visitor payment data' });
                  });
              }

              // Commit the transaction if both updates are successful
              connection.commit(function (err) {
                  if (err) {
                      connection.rollback(function () {
                          console.error('Error committing transaction:', err);
                          res.status(500).json({ success: false, message: 'Failed to commit transaction' });
                      });
                  } else {
                      console.log('Both tables updated successfully.');
                      res.json({ success: true, message: 'visitor and payment data updated successfully' });
                  }
              });
          });
      });
  });
});
// =======================================================================================================================================================

// ========================================== ROUTE TO DELETE THE PARTICULAR VISITOR =====================================================================

// Define a route to handle DELETE requests for deleting a VISITOR by visitor_id,writer_id, function_id, visitor_payment...
app.delete('/delete-visitor', (req, res) => {
  console.log(req.body);
  const {visitor_id,function_id,user_id,visitor_payment} = req.body;

  connection.query('UPDATE visitor_payments SET is_delete = 1 WHERE visitor_id = ? and function_id = ? and user_id = ? and visitor_payment = ?', [visitor_id,function_id,user_id,visitor_payment], (error, result) => {
        if (error) {
            console.error("Error marking Visitor as deleted:", error);
            res.status(500).json({ success: false, message: "Failed to mark Visitor as deleted" });
        } else {
            res.json({ success: true, message: "Visitor marked as deleted successfully" });
        }
    });
});



// =================================== ROUTE TO GET VISITOR DETAILS BASED ON THE PHONE_NO (AUTOFILL) =====================================================

app.get('/fetchVisitorData', (req, res) => {
  const visitor_phone_no = req.query.phonenumber;
  console.log("phone number",visitor_phone_no);
  // Query your database to fetch customer data based on the phone number
  connection.query('select * from visitor_details where visitor_phone_no = ?', [visitor_phone_no], (error, results) => {
    if (error) {
      console.error('Error fetching visitor data:', error);
      res.json({ success: false, error: 'Error fetching visitor data.' });
    } else {
      if (results.length > 0) {
        const visitorData = results[0];
        console.log(visitorData);
        //console.log(customerData.customer_dob);
        res.json({ success: true, visitor: visitorData });
      } else {
        // Send a response indicating that the customer is not found
        res.json({ success: false, error: 'Visitor not found.' });
      }
    }
  });
});

// ===================================================================================================================================

app.get("/",function(req,res){
    res.sendFile(__dirname + "/login.html");
});

//logout handler
app.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/"); // Redirect to the login page or any other desired page
    });
  });


function requireAdminAuth(req, res, next) {
  //console.log("admin check",req.session.adminUser);

    if (req.session.adminUser) {
      // User is authenticated, allow access to the route
       return next();
    }
    // User is not authenticated, redirect to the login page
    res.redirect("/");
}


function requireWriterAuth(req, res, next) {
  //console.log("writer check",req.session.writerUser);

    if (req.session.writerUser) {
      // User is authenticated, allow access to the route
       return next();
    }
    res.redirect("/");
}

function requireCustomerAuth(req, res, next) {
  console.log("Customer check",req.session.customerUser);

    if (req.session.customerUser) {
      // User is authenticated, allow access to the route
       return next();
    }
    res.redirect("/");
}


app.get("/admin", requireAdminAuth, function (req, res) {
  const adminName = req.query.adminName;
    //console.log(adminName);
    res.sendFile(__dirname + "/adminpage.html");
  });

app.get("/home", requireAdminAuth, function(req,res){
  res.sendFile(__dirname + "/home.html");
});

app.get("/customer", requireAdminAuth, function(req,res){
    res.sendFile(__dirname + "/customerpage.html");
});

app.get("/writer", requireAdminAuth, function(req,res){
  res.sendFile(__dirname + "/writerpage.html");
});

app.get("/changepassword", requireAdminAuth, function(req,res){
  res.sendFile(__dirname + "/change_password.html");
});

app.get("/writerchangepassword", requireWriterAuth, function(req,res){
  res.sendFile(__dirname + "/writer_change_password.html");
});

app.get("/customer-change-password", requireCustomerAuth, function(req,res){
  res.sendFile(__dirname + "/customer_change_password.html");
});

// ============================ GET METHOD TO GET THE CUSTOMER DETAILS TO DISPLAY ===================================================

app.get("/get-customer-details",requireAdminAuth, function (req, res) {
    // Query the database to fetch existing customer details
    connection.query("SELECT * FROM users u join customer_details cd on u.user_id = cd.user_id where u.is_delete = 0 ORDER BY CASE WHEN cd.updated_at > u.updated_at THEN cd.updated_at ELSE u.updated_at END DESC", function (error, results, fields) {
        if (error) {
            console.error("Error fetching customer details:", error);
            res.status(500).send("Internal server error");
        } else {
            // Send the customer details as JSON response
            res.json(results);
        }
    });
  });

//============================= for getting the all customer_details based on the phone_no of the customer ==========================

app.get('/api/get-customer-details-by-phone',requireAdminAuth, function (req, res) {
  const phone = req.query.phone; 

  console.log("phone",phone);

  connection.query(
      'SELECT * FROM users u join customer_details cd on u.user_id = cd.user_id WHERE u.phone_no = ?',
      [phone],
      (err, results) => {
          if (err) {
              console.error('Error querying database:', err);
              return res.status(500).json({ error: 'Internal server error' });
          }

          if (results.length === 0) {
              return res.status(404).json({ error: 'Customer not found' });
          }

          const customer = results[0]; 

          console.log(customer);
          res.json(customer);
      }
  );
});

// =========================== FOR GETTING THE TOTAL NUMBER OF CUSTOMERS ========================================================

app.get("/get-customers-count", requireAdminAuth, function (req, res) {
  // Query the database to fetch existing customer details
  connection.query(
    "SELECT COUNT(*) as totalCustomers from users where user_type = 3 and is_delete = 0",
    function (error, results, fields) {
      if (error) {
        console.error("Error fetching customer count:", error);
        res.status(500).send("Internal server error");
      } else {
        // Send the total customer count as JSON response
        res.json({ totalCustomers: results[0].totalCustomers });
      }
    }
  );
});

// ============================== FOR GETTING THE WRITER DETAILS THOSE WHO ARE AVAILBLE ON THE SELECTED DATE ==========================================

app.get("/getWriterIds",requireAdminAuth, function (req, res) {
  // Query the database to fetch available writer Ids
  //const function_date = parseInt(req.query.function_date);
  const function_date = req.query.functionDate;
  console.log(function_date);
  connection.query
  ("select wd.writer_id,u.name,u.phone_no from writer_details wd join users u on wd.user_id = u.user_id where wd.writer_id not in (select wd1.writer_id from writer_details wd1 join function_writer fw on wd1.writer_id = fw.writer_id join function_details fd on fw.function_id = fd.function_id where fd.function_date = ?) and u.is_delete = 0 and u.status = 1",[function_date], 
  function (error, results, fields) {
      if (error) {
        console.log("error happened here");
          console.error("Error fetching customer details:", error);
          res.status(500).send("Internal server error");
      } else {
          // Send the writer Ids as JSON response
          const writerDetails = results.map(row =>({
            writer_id :  row.writer_id,
            name: row.name,
            phone_no: row.phone_no
          })
          );          
          //console.log(writerIds);
          res.json(writerDetails);                   
      }
  });
});


// ===================== route to check the user's status by user_id ======================================================
app.get("/get-user-status",requireAdminAuth, (req, res) => {
  const userId = req.query.user_id; // Get the user_id from the query parameter

  // Query the users table to get the user's status
  connection.query("SELECT status FROM users WHERE user_id = ?", [userId], (err, results) => {
      if (err) {
          console.error("Error querying the database:", err);
          res.status(500).json({ message: "Internal server error" });
      } else if (results.length === 0) {
          res.status(404).json({ message: "User not found" });
      } else {
          const userStatus = results[0].status;
          res.json({ status: userStatus });
      }
  });
});


app.get("/get-single-customer-details",requireAdminAuth, function (req, res) {
  //console.log("get single customer details function called ");
  const customer_id = parseInt(req.query.id); // Parse the customer ID from the query parameter
  //console.log(customer_id);
  connection.query("SELECT * FROM users u join customer_details cd on u.user_id = cd.user_id where customer_id = ?",[customer_id], function (error, results, fields) {
      if (error) {
          console.error("Error fetching customer details:", error);
          res.status(500).send("Internal server error");
      } else {
          // Send the customer details as JSON response
          res.json(results[0]);
          console.log(results[0]);
      }
  });
});


app.get("/get-single-writer-details",requireAdminAuth, function (req, res) {
  const writer_id = parseInt(req.query.id); // Parse the customer ID from the query parameter
  console.log(writer_id);
  connection.query("SELECT * FROM users u join writer_details wd on u.user_id = wd.user_id where writer_id = ?",[writer_id], function (error, results, fields) {
      if (error) {
          console.error("Error fetching customer details:", error);
          res.status(500).send("Internal server error");
      } else {
          // Send the customer details as JSON response
          res.json(results[0]);
          console.log(results[0]);
      }
  });
});


// ================== FOR GETTING THE VISITOR DATA FOR THE PARTICULAR FUNCTION ===================================================
app.get('/export-to-excel', (req, res) => {
  const function_id = parseInt(req.query.id); 

  //console.log(function_id);
  const functionExcelSql = `
  select vd.visitor_name,vd.visitor_initial,vd.visitor_husband_or_wifename,vd.visitor_profession,
  vd.visitor_phone_no,vd.visitor_address,vd.visitor_city,vp.visitor_payment 
  from visitor_details vd
  join visitor_payments vp
  on vd.visitor_id = vp.visitor_id 
  where vp.function_id = ? and vp.is_delete = 0;
  `;

  connection.query(functionExcelSql,[function_id], function (error, results, fields) {
      if (error) {
          console.error("Error fetching function excel details:", error);
          res.status(500).send("Internal server error");
      } else {
        if (results.length > 0) {
          //console.log(results);
          res.json(results);
        }else {
          res.status(404).send("Function not found");
        }          
      }
  });
});

// ========================== FOR GETTING THE ALL FUNCTION DETAILS FOR THAT PARTICULAR CUSTOMER ID ==================================
app.get("/get-function-details",requireAdminAuth, function (req, res) {
  //console.log("get single customer details function called ");
  const customer_id = parseInt(req.query.id); // Parse the customer ID from the query parameter
  console.log(customer_id);
  connection.query("SELECT * FROM function_details where customer_id = ? and is_delete = 0 ORDER BY CASE when updated_at > created_at then updated_at else created_at end desc;  ",[customer_id], function (error, results, fields) {
      if (error) {
          console.error("Error fetching function details:", error);
          res.status(500).send("Internal server error");
      } else {
        if (results.length === 0) {
            res.status(404).json({ message: "Customer doesn't have any functions yet." });
        } else {
        const functionDetailsWithWriters = [];
        //const function_id = results[0].function_id;
        //console.log(function_id);

        for (let i = 0; i < results.length; i++) {
          const function_id = results[i].function_id;

        // Fetch writer_ids associated with the function_id from the function_writer table
        connection.query("SELECT fw.writer_id,u.name,u.phone_no FROM function_writer fw join writer_details wd on fw.writer_id=wd.writer_id join users u on u.user_id = wd.user_id where function_id = ?", 
        [function_id], function (error, writerResults, fields) {
          if (error) {
              console.error("Error fetching writer IDs:", error);
              res.status(500).send("Internal server error");
          } else {
              // Extract writer_ids from writerResults and send them as JSON response
              const writerDetails = writerResults.map(writer => ({
                writer_id:writer.writer_id,
                name: writer.name,
                phone_no: writer.phone_no
              }));

              functionDetailsWithWriters.push({
                functionDetails: results[i],
                writerDetails: writerDetails
              });

              if (functionDetailsWithWriters.length === results.length) {
                // Send the array as a JSON response when all queries are complete
                res.json(functionDetailsWithWriters);  
                }         
          }
        });
      }
      }
    }
  });
});


app.get("/get-functions-count", requireAdminAuth, function (req, res) {
  // Query the database to fetch existing function details
  connection.query(
    "SELECT COUNT(*) as totalFunctions from function_details where is_delete = 0",
    function (error, results, fields) {
      if (error) {
        console.error("Error fetching function count:", error);
        res.status(500).send("Internal server error");
      } else {
        // Send the total function count as JSON response
        res.json({ totalFunctions: results[0].totalFunctions });
      }
    }
  );
});


app.get("/get-single-function-customer-details",requireWriterAuth, function (req, res) {
  //console.log("get single customer details function called ");
  const function_id = parseInt(req.query.id); // Parse the function ID from the query parameter
  console.log(function_id);

  const functionCustomerSql = `
    SELECT fd.function_name, fd.function_date, fd.function_address, fd.function_city,
           cd.customer_alternate_phone_no, u.name, u.phone_no, u.email
    FROM function_details fd
    JOIN customer_details cd ON fd.customer_id = cd.customer_id
    JOIN users u ON cd.user_id = u.user_id
    WHERE fd.function_id = ?;
  `;

  connection.query(functionCustomerSql,[function_id], function (error, results, fields) {
      if (error) {
          console.error("Error fetching function & customer details:", error);
          res.status(500).send("Internal server error");
      } else {
        if (results.length > 0) {
          res.json(results[0]);
        }else {
          res.status(404).send("Function not found");
        }          
      }
  });
});


app.get("/get-writer-details",requireAdminAuth, function (req, res) {
  // Query the database to fetch existing writer details
  connection.query("SELECT * FROM users u join writer_details wd on u.user_id = wd.user_id where u.is_delete = 0 ORDER BY CASE WHEN wd.updated_at > u.updated_at THEN wd.updated_at ELSE u.updated_at END DESC", function (error, results, fields) {
      if (error) {
          console.error("Error fetching writer details:", error);
          res.status(500).send("Internal server error");
      } else {
          // Send the writer details as JSON response
          res.json(results);
          //console.log(results);
      }
  });
});


app.get("/get-writers-count", requireAdminAuth, function (req, res) {
  // Query the database to fetch existing writer details
  connection.query(
    "SELECT COUNT(*) as totalWriters from users where user_type = 2 and is_delete = 0",
    function (error, results, fields) {
      if (error) {
        console.error("Error fetching writer count:", error);
        res.status(500).send("Internal server error");
      } else {
        // Send the total customer count as JSON response
        res.json({ totalWriters: results[0].totalWriters });
      }
    }
  );
});


//============================= for getting the all writer_details based on the phone_no of the writer ==========================

 app.get('/api/get-writer-details-by-phone', (req, res) => {
  const phone = req.query.phone; 

  connection.query(
      'SELECT * FROM users u join writer_details wd on u.user_id = wd.user_id WHERE u.phone_no = ?',
      [phone],
      (err, results) => {
          if (err) {
              console.error('Error querying database:', err);
              return res.status(500).json({ error: 'Internal server error' });
          }

          if (results.length === 0) {
              return res.status(404).json({ error: 'Writer not found' });
          }

          const writer = results[0]; 

          console.log(writer);
          res.json(writer);
      }
  );
});

// ======================================= ROUTE TO GET VISITOR DETAILS BASED ON FUNCTION_ID ==========================================

app.get('/get-visitor-details', function (req, res) {
  //const function_id = req.params.function_id;
  const function_id = parseInt(req.query.id);
  //console.log(function_id);

  // Query the database to fetch visitor details based on the function_id
  connection.query(
      'select * from visitor_payments vp join visitor_details vd on vp.visitor_id = vd.visitor_id where vp.function_id = ? AND vp.is_delete = 0 ORDER BY CASE WHEN vp.updated_at > vp.created_at THEN vp.updated_at ELSE vp.created_at END DESC',
      [function_id],
      function (error, results, fields) {
          if (error) {
              console.error('Error fetching visitor details:', error);
              res.status(500).send('Internal server error');
          } else {
              // Send the visitor details as JSON response
              res.json(results);
              //console.log(results);
          }
      }
  );
});


//============================= for getting the all visitor_details based on the phone_no of the visitor ==========================

app.get('/api/get-visitor-details-by-phone', (req, res) => {
  const phone = req.query.phone; 

  connection.query(
      'select * from visitor_details vd join visitor_payments vp on vd.visitor_id = vp.visitor_id join users u on vp.user_id = u.user_id where vd.visitor_phone_no = ?',
      [phone],
      (err, results) => {
          if (err) {
              console.error('Error querying database:', err);
              return res.status(500).json({ error: 'Internal server error' });
          }

          if (results.length === 0) {
              return res.status(404).json({ error: 'Visitor not found' });
          }

          const visitor = results[0]; 

          //console.log(visitor);
          res.json(visitor);
      }
  );
});

// =========================================================================================================================

app.get("/get-visitor-count-total-payment", requireCustomerAuth, function (req, res) {
  // Query the database to fetch existing customer details
  const function_id = parseInt(req.query.id); 
  connection.query(
    "select count(*) totalVisitors, sum(visitor_payment) totalPayments from visitor_payments where function_id = ? and is_delete = 0;",[function_id],
    function (error, results, fields) {
      if (error) {
        console.error("Error fetching visitor count & total payment:", error);
        res.status(500).send("Internal server error");
      } else {
        // Send the total customer count as JSON response
        res.json({ totalVisitors: results[0].totalVisitors ,
          totalPayments: results[0].totalPayments});
      }
    }
  );
});

app.get("/customer_details.html", requireAdminAuth, function (req, res) {
    res.sendFile(__dirname + "/customer_details.html");
});


app.get("/writer_details.html", requireAdminAuth, function (req, res) {
  res.sendFile(__dirname + "/writer_details.html");
});

app.get("/customerregister", requireAdminAuth, function (req, res) {
  res.sendFile(__dirname + "/customer_register.html");
});

app.get("/writerhome", requireWriterAuth, function (req, res) {
  //console.log("writer home is called");
  res.sendFile(__dirname + "/writerhome.html");
});

app.get("/writer_home", requireWriterAuth, function (req, res) {
  //console.log("writer home is called");
  res.sendFile(__dirname + "/writer_home.html");
});

app.get("/customer_home", requireCustomerAuth, function (req, res) {
  console.log("customer home is called");
  res.sendFile(__dirname + "/customer_home.html");
});

app.get("/visitorentry", requireWriterAuth, function (req, res) {
  res.sendFile(__dirname + "/writer_entry_page.html");
});

app.get("/customer-visitor-entry", requireCustomerAuth, function (req, res) {
  res.sendFile(__dirname + "/customer_visitor_entry_page.html");
});

app.get("/admin-visitor-entry", requireAdminAuth, function (req, res) {
  res.sendFile(__dirname + "/admin_visitor_entry_page.html");
});
// app.get("/writerregister", requireAdminAuth, function (req, res) {
//   // Render the dashboard for authenticated users
//   res.sendFile(__dirname + "/writer_register.html");
// });

//port setup
  app.listen(1500);