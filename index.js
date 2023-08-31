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
        const { username, password } = req.body;
        console.log(username,password)
        // Query the database to check if the username exists
        const query = 'SELECT * FROM users WHERE name = $1';
        const result = await pool.query(query, [username]);
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