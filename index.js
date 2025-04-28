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
                  <li style="display: flex; align-items: center;"> <p><strong>Subject:</strong> ${subject}</p></li>
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

app.listen(PORT, () => {
  console.log("Listening successfully on port", PORT);
});
