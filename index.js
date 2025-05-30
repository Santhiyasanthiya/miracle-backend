import express from "express";
import dotenv from "dotenv";
dotenv.config(); // ✅ Add this line
import cors from "cors";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer"; // You also forgot to import this

const app = express();
const PORT = process.env.PORT;
const URL = process.env.DB;

const client = new MongoClient(URL);
await client.connect();
console.log("Connected to MongoDB");



app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));



//------------------------Nodemailer transporter setup--------------------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // Your email
      pass: process.env.EMAILPASSWORD, // Your email password or app password
    },
  });
  

  app.post('/', (req, res) => {
    console.log('Form data received:', req.body); // optional: log the data
    res.status(200).json({ message: 'Form submitted successfully!' });
  });


app.post("/api/contact", async (req, res) => {
  const { name, email,  message, phone } = req.body; // Added phone to the request body

  try {
    const newContact = await client
      .db("MedicleAlpha")
      .collection("contact")
      .insertOne({ name, email,  message, phone }); // Store phone number in the database

    // Send email to admin
    const adminMailOptions = {
      from: process.env.EMAIL,
      to: "alphaingen2080@gmail.com",
      subject: "New Contact Form Submission (FOR CLIENT)",
      html: `
        <div style="max-width: 600px; margin: 0 auto; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h2 style="color: orange; margin: 0;">New Contact Form Submission</h2>
                  <img src="https://res.cloudinary.com/dmv2tjzo7/image/upload/v1724412389/t267ln5xi0a1mue0v9sn.gif" height="100px" width="110px" alt="Zuppa Logo">
          </div> 
  
          <ul style="list-style-type: none; padding: 0;">
                  <br/>
                  <li style="display: flex; align-items: center;"> 

                      <strong><a href="mailto:${email}">${email}</a></strong>
                    </p>
                  </li>
                  <br/>
              
                  <br/>
                  <li style="display: flex; align-items: center;"><p><strong>Name:</strong> ${name}</p></li>
                  <br/>
                <li style="display: flex; align-items: center;"> 
                <p> <strong>Phone Number:</strong> ${phone} </p>
                </li>
                  <br/>
                  <li style="display: flex; align-items: center;"> <p><strong>Message:</strong> ${message}</p></li>
                  <br/>
          </ul>
        </div>
        `,
    };

    await transporter.sendMail(adminMailOptions);

    // Send acknowledgment email to user from no-reply address
    const userMailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Thank You for Contacting Us",
      html: `
        <div style="max-width: 600px; margin: 0 auto; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h2 style="color: orange; margin: 0;">Thank You for Contacting Us</h2>
                  <img src="https://res.cloudinary.com/dmv2tjzo7/image/upload/v1745321802/owiybahfvrwrbhv08psi.png" height="100px" width="110px" alt="Zuppa Logo">
          </div>
          <h4>Dear ${name},</h4>
          <p>Thank you for reaching out to us.</p>
          <p>We have received your message and will get back to you shortly.</p>
          <ul style="list-style-type: none; padding: 0;">         
                  <br/>
          </ul>
          <p>Best regards,</p>
          <h3 style="color: darkorange;">Alphaingen</h3>
          <p><strong>Address:</strong></p>
          <p>#13-C, Mosque Street,</p>
          <p>100 Feet Road, M.G. Nagar,

</p>
          <p>Chennai, Tamil Nadu 600032

India.</p> 
        </div>
        `,
    };

    await transporter.sendMail(userMailOptions);

    res.status(201).send({
      message: "Form submitted and acknowledgment email sent successfully",
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});













//************************  */ STUDENT CONTACT FORM **********************




app.post("/api/student-contact", async (req, res) => {
  const { name, email, phone, course, batch, source, description } = req.body;

  try {
    // Save to MongoDB
   
    await client.db("MedicleAlpha").collection("student_contact").insertOne({
      name,
      email,
      phone,
      course,
      batch,
      source,
      description,
      submittedAt: new Date(),
    });

    // Admin Email
    const adminMailOptions = {
      from: process.env.EMAIL,
      to: "alphaingen2080@gmail.com",
      subject: "New Student Inquiry",
      html: `
        <div style="padding: 20px; border-radius: 10px; border: 1px solid #ccc;">
          <h2 style="color: darkgreen;">New Student Inquiry Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Course:</strong> ${course}</p>
          <p><strong>Batch:</strong> ${batch}</p>
          <p><strong>Source:</strong> ${source}</p>
          <p><strong>Description:</strong> ${description}</p>
        </div>
      `,
    };

    await transporter.sendMail(adminMailOptions);

    // Student Acknowledgement Email
    const studentMailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Thanks for contacting Alphaingen!",
      html: `
        <div style="padding: 20px; border-radius: 10px; border: 1px solid #ccc;">
          <h2 style="color: darkblue;">Dear ${name},</h2>
          <p>Thank you for showing interest in our course: <strong>${course}</strong>.</p>
          <p>We will reach out to you soon regarding the ${batch} batch.</p>
          <p>Best Regards,<br/>Team Alphaingen</p>
        </div>
      `,
    };

    await transporter.sendMail(studentMailOptions);

    res.status(201).send({
      message: "Student contact saved and emails sent successfully",
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});









app.listen(PORT, () => {
  console.log("Listening successfully on port", PORT);
});
