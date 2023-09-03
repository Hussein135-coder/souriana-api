const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const app = express()


const pool = new Pool({
    user: 'default',
    host: 'ep-polished-sun-60538222-pooler.ap-southeast-1.postgres.vercel-storage.com',
    database: 'verceldb',
    password: 'Q21GkCKhrelE',
    port: 5432, 
    ssl: {
        rejectUnauthorized: false,
      },
  });

//   pool.query(`INSERT INTO users (id,name,email,password,namear) VALUES (3,'saleh','saleh@souriana.sy','5555','صالح')`, (err, res) => {
//     if (err) {
//       console.error('Error executing query:', err);
//     } else {
//       console.log('Database connection test successful');
//     }
//   });

app.use(
	cors(),
    express.json()
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(
	`Server started on port ${PORT}`));

app.get('/',async (req,res)=>{
        res.send('ok')
})


app.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;
        console.log(name,password)
        // Query the database to check if the name exists
        const query = 'SELECT * FROM users WHERE name = $1';
        const result = await pool.query(query, [name]);
        const user = result.rows[0];
    
        if (!user) {
          return res.status(401).json({  
            'success' : 0,
            'status':422,
            'message' : 'خطأ في اسم المستخدم أو كلمة المرور',
            });
        }
    
        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = password == user.password;
    
        if (!passwordMatch) {
          return res.status(401).json(res.status(401).json({  
            'success' : 0,
            'status':422,
            'message' : 'خطأ في اسم المستخدم أو كلمة المرور',
            }));
        }
    
        // Generate a token
        const token = jwt.sign({ userId: user.id }, 'xx11xx');
    
        // Save the token in the database
        const updateQuery = 'UPDATE users SET token = $1 WHERE id = $2';
        await pool.query(updateQuery, [token, user.id]);
    
        res.json({
            'success' : 1,
            'message' : 'You have successfully logged in.',
            'token' : token
        })
    } catch (error) {
        console.log("error")
    }
  
  });

async function fetchUser(id){
      try {
          const fetchUserById = "SELECT name,nameAr,email FROM users WHERE id=$1";
          const result = await pool.query(fetchUserById, [id]);
          if (result.rowCount > 0) {
              return result.rows[0]
          }else{         
              return false;
          }
      } catch (e) {
          return null;
      }
  }

   async function fetchMoney()
  {
    try {
        const fetchUsersMoney = "SELECT * FROM money";
        const result = await pool.query(fetchUsersMoney);
        if (result.rowCount > 0) {
            return result.rows
        }else{         
            return false;
        }
    } catch (e) {
        return null;
    }
  }


  app.get("/getUser",async (req,res)=>{
        const token2 = req.headers.authorization;
        if (!token2) {
            return res.json({ error: 'Unauthorized' });
            }
            
            const token  = token2.slice(7)
            console.log(token)
            try {
            const decoded = jwt.verify(token, 'xx11xx');
            const userData  = await fetchUser(decoded.userId)
            const userMoney  = await fetchMoney()
            if(userData != null && userMoney != null){

                res.json({
                    
                    "success" : 1,
                    "user" : userData,
                    "money" : userMoney
                    
                })
            }else{
                res.json({  
                    'success' : 0,
                    'status':422,
                    'message' : 'error',
                    });
            }

            } catch (error) {
            return res.json({  
                'success' : 0,
                'status':422,
                'message' : 'error',
                });
            }
      
  })

  app.post("/add" , async (req,res)=>{
    const { name, money ,company,date,status,user} = req.body;

    try {
       const query = 'INSERT INTO money (الاسم,المبلغ,الشركة,التاريخ , الحالة , المستلم) VALUES ($1, $2,$3,$4,$5,$6)';
       const values = [name, money ,company,date,status,user];
       
       pool.query(query, values, (err, result) => {
         if (err) {
           console.error(err);
           res.json({  
            'success' : 0,
            'status':422,
            'message' : 'error',
            });
         } else {
          
            res.json({
                    
                "success" : 1,
                "status" : 201,
                "message" : "تم ادخال البيانات بنجاح"
                
            })
         }
       });
    
    
    } catch (error) {
        console.error(err);
        res.json({  
         'success' : 0,
         'status':422,
         'message' : 'error',
         });
    }
  })



  app.post("/edit" , async (req,res)=>{
    const {id, name, money ,company,date,status,user} = req.body;

    try {
       const query = `UPDATE money SET الاسم = $1 , المبلغ = $2 , الشركة = $3 , التاريخ = $4 , الحالة = $5 , المستلم = $6 WHERE id = $7`;
       const values = [name, money ,company,date,status,user,id];
       
       pool.query(query, values, (err, result) => {
         if (err) {
           console.error(err);
           res.json({  
            'success' : 0,
            'status':422,
            'message' : 'error',
            });
         } else {
          console.log('doone')
            res.json({
                    
                "success" : 1,
                "status" : 201,
                "message" : "تم تعديل البيانات بنجاح"
                
            })
         }
       });
    
    
    } catch (error) {
        console.error(err);
        res.json({  
         'success' : 0,
         'status':422,
         'message' : 'error',
         });
    }
  })


  app.post("/del" , async (req,res)=>{
    const {id} = req.body;

    try {
       const query = `DELETE FROM money WHERE id = $1`;
       const values = [id];
       
       pool.query(query, values, (err, result) => {
         if (err) {
           console.error(err);
           res.json({  
            'success' : 0,
            'status':422,
            'message' : 'error',
            });
         } else {
          console.log('doone')
            res.json({
                    
                "success" : 1,
                "status" : 201,
                "message" : "تم حذف البيانات بنجاح"
                
            })
         }
       });
    
    
    } catch (error) {
        console.error(err);
        res.json({  
         'success' : 0,
         'status':422,
         'message' : 'error',
         });
    }
  })

  app.post("/delAll" , async (req,res)=>{
    const {user} = req.body;

    try {
       const query = `DELETE FROM money WHERE المستلم = $1`;
       const values = [user];
       
       pool.query(query, values, (err, result) => {
         if (err) {
           console.error(err);
           res.json({  
            'success' : 0,
            'status':422,
            'message' : 'error',
            });
         } else {
          console.log('doone')
            res.json({
                    
                "success" : 1,
                "status" : 201,
                "message" : "تم حذف البيانات بنجاح"
                
            })
         }
       });
    
    
    } catch (error) {
        console.error(err);
        res.json({  
         'success' : 0,
         'status':422,
         'message' : 'error',
         });
    }
  })


  app.post("/add-analytics" , async (req,res)=>{
    let name = '';
    const { page, likes ,members,date} = req.body;

    if (page == 'syredu') {
        name = 'سوريانا التعليمية';
    }

    if (page == 'bac') {
        name = 'بكالوريا سوريا';
    }

    if (page == 'syr') {
        name = 'سوريا التعليمية';
    }

    // try {
    //    const query = 'INSERT INTO money (الاسم,المبلغ,الشركة,التاريخ , الحالة , المستلم) VALUES ($1, $2,$3,$4,$5,$6)';
    //    const values = [name, money ,company,date,status,user];
       
    //    pool.query(query, values, (err, result) => {
    //      if (err) {
    //        console.error(err);
    //        res.json({  
    //         'success' : 0,
    //         'status':422,
    //         'message' : 'error',
    //         });
    //      } else {
          
    //         res.json({
                    
    //             "success" : 1,
    //             "status" : 201,
    //             "message" : "تم ادخال البيانات بنجاح"
                
    //         })
    //      }
    //    });
    
    
    // } catch (error) {
    //     console.error(err);
    //     res.json({  
    //      'success' : 0,
    //      'status':422,
    //      'message' : 'error',
    //      });
    // }
  })
