// server.js

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); 

const app = express();
const port = process.env.PORT || 3000; 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'your_email@gmail.com', 
    pass: 'your_email_password' 
  }
});

app.post('/process_subscription', (req, res) => {
  const { name, email, phone, service } = req.body;

  // Basic validation (add more as needed)
  if (!name || !email || !phone || !service) {
    return res.status(400).send('Please fill in all required fields.');
  }

  const mailOptionsUser = {
    from: 'your_email@gmail.com', 
    to: email,
    subject: 'Thank You for Subscribing!',
    text: `Dear ${name},\n\nThank you for subscribing to our ${service} services!\n\nSincerely,\nThe Securewave Team`
  };

  const mailOptionsAdmin = {
    from: 'your_email@gmail.com', 
    to: 'your_email@gmail.com', 
    subject: 'New Subscription Request',
    text: `New subscription request:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}`
  };

  transporter.sendMail(mailOptionsUser, (error, info) => {
    if (error) {
      console.error('Error sending email to user:', error);
    } else {
      console.log('Email sent to user:', info.response);
    }
  });

  transporter.sendMail(mailOptionsAdmin, (error, info) => {
    if (error) {
      console.error('Error sending email to admin:', error);
      return res.status(500).send('Error processing subscription.');
    } else {
      console.log('Email sent to admin:', info.response);
      res.redirect('/thank_you.html'); 
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});