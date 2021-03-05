const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const multer = require("multer");
const path = require("path")
const jwt = require("jsonwebtoken")
const bodyParser = require('body-parser');
const { setTimeout } = require("timers");
const { json } = require("body-parser");
const nodemailer = require("nodemailer");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toDateString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'  
        ) 
    {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

//midleware
app.use(cors());
app.use(express.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('upload'))
app.use("/images", express.static(path.join(__dirname, 'images')))


//ROUTES//
//-----------------------------------------------------------------------------------------------------------------------

// KIRIM EMAIL
app.post("/email", async(req, res) => {
    const {email} = req.body
    console.log(email);
    let transporter = nodemailer.createTransport({
        host: "mail.metaglobal.biz.id",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'noreply@metaglobal.biz.id', // generated ethereal user
          pass: 'metaglobal', // generated ethereal password
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
      });
    
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Technisian 👻" <noreply@metaglobal.biz.id>', // sender address
        to: "rizkimuntohary@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "9.36", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      main().catch(console.error);

})
//LOGIN
app.post("/logon", async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        const getAllData = await pool.query("SELECT * FROM m_employee WHERE employee_name = $1 AND password = $2", [data.name, data.password]);
        if (!getAllData.rowCount){
            res.json("data tidak ada");
        } else {
            const user = getAllData.employee_id
            const token = jwt.sign({user}, 'my-secret', {expiresIn: 1800000} )
            res.json({
                token: token,
                data: getAllData.rows
            });
        }
    } catch (error) {
        console.log(err.message);
    }
});

//KARYAWAN
//CREATE A EMPLOYEE
app.post("/karyawan", async (req, res) => {
    try {
        const angkaRandom = "10" + Math.floor(Math.random()*9999999);
        const data = req.body;
        const newData = await pool.query("INSERT INTO m_employee (employee_id, employee_name, employee_phone, employee_address, employee_email, created_at) VALUES($1,$2,$3,$4,$5,NOW()) RETURNING *", [angkaRandom, data.name, data.phone, data.address, data.email]);
        res.json(newData.rows);
        console.log("Data berhasil masuk");
    } catch (err) {
        console.log(err.message);
    }       
});    

//GET TECHNICIAN
app.get("/teknisi", async (req, res) => {
    try {
        const getAllData = await pool.query("SELECT * FROM m_employee WHERE role = 1");
        res.json(getAllData.rows);
    } catch (error) {
        console.log(err.message);
    }
});
//GET ALL EMPLOYEE
app.get("/karyawan", async (req, res) => {
    try {
        const getAllData = await pool.query("SELECT * FROM m_employee");
        res.json(getAllData.rows);
    } catch (error) {
        console.log(err.message);
    }
});
//GET A EMPLOYEE
app.get("/karyawan/:id", async (req,res) => {
    try {
        const {id} = req.params;
        const getOneData = await pool.query("SELECT * FROM m_employee WHERE employee_id = $1",[id]);
        res.json(getOneData.rows);         
    } catch (error) {
        console.log(err.message);
    }
});

//UPDATE SOLVE EMPLOYEE
app.put("/solve/solved/:id", async (req,res) => {
    try {
        const {id} = req.params;
        const getCount = await pool.query("SELECT COUNT(issue_id) FROM m_solve_issue WHERE employee_id = $1", [id])
        const hasil = await getCount.rows[0].count
        const updateData = await pool.query("UPDATE m_employee SET solved = $1 WHERE employee_id = $2", [hasil, id]);
        res.json("data sukses di update");        
    } catch (error) {
        console.log(err.message);
    }
});
//UPDATE A EMPLOYEE
app.put("/karyawan/:id", async (req,res) => {
    try {
        const {id} = req.params;
        console.log(id);
        const data = req.body;
        console.log(data.name);
        const updateData = await pool.query("UPDATE m_employee SET employee_name = $1, employee_phone = $2, employee_address = $3, employee_email = $4, updated_at = NOW() WHERE employee_id = $5", [data.name, data.phone, data.address, data.email, id]);
        res.json("Data was succesfully updated");        
    } catch (error) {
        console.log(err.message);
    }
});
//DELETE A EMPLOYEE
app.delete("/karyawan/:id", async (req,res) => {
    try {
        const {id} = req.params;
        const deleteData = await pool.query("DELETE FROM m_employee WHERE employee_id = $1", [id]);
        res.json("Data was deleted");        
    } catch (error) {
        console.log(err.message);
    }
});
//----------------------------------------------------------------------------------------------------------------------------

//KATEGORI
//CREATE A KATEGORI
app.post("/kategori", async (req, res) => {
    try {
        const data = req.body;
        const angkaRandom = "5" + Math.floor(Math.random()*99);
        const newData = await pool.query("INSERT INTO m_category_issue (category_issue_name, category_issue_desc, created_at, category_issue_code) VALUES ($1,$2,NOW(),$3) RETURNING *", [data.name, data.desc, angkaRandom]);
        res.json(newData.rows);
    } catch (error) {
        console.log(err.message);
    }
});
// GET ALL KATEGORI
app.get("/kategori", async (req, res) => {
    try {
        const getAllData = await pool.query("SELECT * FROM m_category_issue");
        res.json(getAllData.rows);
    } catch (error) {
        console.log(err.message);
    }
});
// GET A KATEGORI
app.get("/kategori/:id", async (req, res) => {
    try {
        const {id} = req.params
        const getData = await pool.query("SELECT * FROM m_category_issue WHERE category_issue_id = $1", [id]);
        res.json(getData.rows);     
    } catch (error) {
        console.log(err.message);
    }
});
// UPDATE A KATEGORI
app.put("/kategori/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const data = req.body;
        const updateData = await pool.query("UPDATE m_category_issue SET category_issue_name = $1, category_issue_desc = $2, updated_at = NOW() WHERE category_issue_id = $3", [data.name, data.desc, id]);
        res.json("Data was updated")
    } catch (error) {
        console.log(error.message);
    }
});
// DELETE A KATEGORI
app.delete("/kategori/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const deletData = await pool.query("DELETE FROM m_category_issue WHERE category_issue_id = $1", [id]);
        res.json("Data was deleted");
    } catch (error) {
        console.log(error.message);
    }
});
//------------------------------------------------------------------------------------------------------------------------------


// ISSUE
// CREATE A ISSUE
app.post("/masalah", async (req, res) => {
    try {
        const data = req.body;
        const upload = req.file.path;
        const angka = 3;
        const angkaRandom = Math.floor(Math.random()*99);
        const domran = `${angka}${angkaRandom}`;
        const issue = await pool.query("INSERT INTO m_issue (issue_name, category_issue_id, issue_desc, issue_upload, created_at, issue_code, employee_id) VALUES ($1,$2,$3,$4,NOW(),$5,$6) RETURNING *", [data.name, data.category_id, data.desc, upload, domran, data.employee_id]);
        res.json(issue.rows);
    } catch (error) {
        console.log(error.message);
    }
});
// GET REQUEST BY
app.get("/masalah/req", async (req, res) => {
    try {
        const getAllData = await pool.query("select m_issue.issue_id, m_issue.category_issue_id, m_issue.issue_name, m_issue.issue_desc, m_issue.issue_upload, m_issue.created_at, m_issue.updated_at, m_employee.employee_name from  m_issue inner join m_employee on m_issue.employee_id = m_employee.employee_id");
        res.json(getAllData.rows);
    } catch (error) {
        console.log(error.message);
    }
})
// GET ALL ISSUE
app.get("/masalah", async (req, res) => {
    try {
        const getAllData = await pool.query("SELECT * FROM m_issue order by issue_id asc");
        res.json(getAllData.rows);
    } catch (error) {
        console.log(err.message);
    }
});
//GET ALL ISUE WHERE UPDATED_AT
app.get("/masalah/updated", async (req, res) => {
    try {
        const getAllData = await pool.query("SELECT * FROM m_issue WHERE updated_at IS NULL")
        res.json(getAllData.rows)
    } catch (error) {
        console.log(error.message);
    }
    
})
// GET A ISSUE
app.get("/masalah/:id", async (req, res) => {
    try {
        const {id} = req.params
        const getData = await pool.query("SELECT * FROM m_issue WHERE issue_id = $1", [id]);
        res.json(getData.rows);     
    } catch (error) {
        console.log(err.message);
    }
});
// UPDATE ISSUE
app.put("/masalah/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const data = req.body;
        const updateData = await pool.query("UPDATE m_issue SET issue_name = $1, issue_desc = $2, issue_upload = $3, updated_at = NOW() WHERE issue_id = $4", [data.name, data.desc, data.upload, id]);
        res.json("Data was updated")
    } catch (error) {
        console.log(error.message);
    }
});
// DELETE ISSUE
app.delete("/masalah/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const deletData = await pool.query("DELETE FROM m_issue WHERE issue_id = $1", [id]);
        res.json("Data was deleted");
    } catch (error) {
        console.log(error.message);
    }
});
//-------------------------------------------------------------------------------------------------------------------------------------------------


// SOLVE
// CREATE A SOLVE
app.post("/solve", async (req, res) => {
    try {
        const data = req.body;
        const angkaRandom = "4" + Math.floor(Math.random()*99);
        const solve = await pool.query("INSERT INTO m_solve_issue (issue_id, employee_id, solve_issue_desc, solve_issue_time, created_at, solve_code) VALUES ($1,$2,$3,NOW(),NOW(),$4) RETURNING *", [data.issue_id, data.employee_id, data.desc, angkaRandom]);
        res.json(solve.rows);
    } catch (error) {
        console.log(error.message);
    }
});
// GET ALL SOLVE
app.get("/solve", async (req, res) => {
    try {
        const getAllData = await pool.query("SELECT * FROM m_solve_issue");
        res.json(getAllData.rows);
    } catch (error) {
        console.log(err.message);
    }
});


//GET A SOLVE BY ISSUE ID
app.get("/solve/issue/:id", async (req, res) => {
    try {
        const {id} = req.params
        const getData = await pool.query("SELECT * FROM m_solve_issue WHERE issue_id = $1", [id]);
        res.json(getData.rows);     
    } catch (error) {
        console.log(err.message);
    }
});
// GET A SOLVE
app.get("/solve/:id", async (req, res) => {
    try {
        const {id} = req.params
        const getData = await pool.query("SELECT * FROM m_solve_issue WHERE solve_issue_id = $1", [id]);
        res.json(getData.rows);     
    } catch (error) {
        console.log(err.message);
    }
});
// UPDATE SOLVE
app.put("/solve/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const data = req.body;
        const updateData = await pool.query("UPDATE m_solve_issue SET issue_id = $1, employee_id = $2, solve_issue_desc = $3, solve_issue_time = NOW(), updated_at = NOW() WHERE solve_issue_id = $4", [data.issue_id, data.employee_id, data.desc, id]);
        res.json("Data was updated")
    } catch (error) {
        console.log(error.message);
    }
});
// DELETE SOLVE
app.delete("/solve/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const deletData = await pool.query("DELETE FROM m_solve_issue WHERE solve_issue_id = $1", [id]);
        res.json("Data was deleted");
    } catch (error) {
        console.log(error.message);
    }
});

//CARI ISSUE
app.get("/cari/:str", async (req, res) => {
    try {
        const {str} = req.params
        const cr = `${str}%`
        const getData = await pool.query("select * from m_issue where issue_name ilike $1", [`%${str}%`])
        res.json(getData.rows)        
    } catch (error) {
        console.log(error.message);
    }
})
//----------------------------------------------------------------------------------------------------------------------------------------

app.listen(5000, () => {
    console.log("Server has started on port 5000");
});