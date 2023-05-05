import kafka from 'kafka-node';
import nodemailer from 'nodemailer';

const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: '44.214.218.139:9092' });
const consumer = new Consumer(
  client,
  [{ topic: 'abolimer.customer.evt', partition: 0 }],
  { autoCommit: false }
);

consumer.on('message', (message) => {
  console.log('Received message from Kafka:', message);
  
  const data = JSON.parse(message.value);
  
  // Send email to customer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'anudeep.sekhar@gmail.com',
      pass: 'uuetkiatqbaakxdy'
    }
  });
  console.log("Received message!")
  console.log(data)
  const customerEmail = data.data.userId;
  console.log(customerEmail)
  const mailOptions = {
    from: 'bookstore@abolimer.com',
    to: customerEmail,
    subject: 'Activate your book store account',
    text: `Dear ${data.data.name}, \n Welcome to the Book store created by abolimer. \nExceptionally this time we won’t ask you to click a link to activate your account.`
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Failed to send email:', error);
    } else {
      console.log('Email sent to customer:', info.response);
    }
  });
});

consumer.on('error', (err) => {
  console.error('Error in Kafka consumer:', err);
});
