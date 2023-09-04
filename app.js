const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files (CSS, JavaScript, etc.) from a public directory
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <form action="/login" method="POST">
      <input type="text" name="username" placeholder="Enter your username" />
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { username } = req.body;

  // Store username in a cookie (for simplicity)
  res.cookie('username', username);

  // Redirect to the chat page
  res.redirect('/chat');
});

app.get('/chat', (req, res) => {
  const username = req.cookies.username;

  if (!username) {
    res.redirect('/');
    return;
  }

  // Display the chat form and previously sent messages
  let chatForm = `
    <h1> ${username}!</h1>
    <form action="/send" method="POST">
      <input type="text" name="message" placeholder="Enter your message" />
      <button type="submit">Send</button>
    </form>
  `;

  // Read and display previously sent messages
  fs.readFile('messages.txt', 'utf8', (err, data) => {
    if (!err) {
      const messages = JSON.parse(data);

      messages.forEach((message) => {
        chatForm += `<p>${message.username}: ${message.message}</p>`;
      });
    }

    res.send(chatForm);
  });
});

app.post('/send', (req, res) => {
  const { message } = req.body;
  const username = req.cookies.username;

  if (!username) {
    res.redirect('/');
    return;
  }

  // Read existing messages
  fs.readFile('messages.txt', 'utf8', (err, data) => {
    let messages = [];

    if (!err) {
      messages = JSON.parse(data);
    }

    // Add the new message
    messages.push({ username, message });

    // Write the updated messages back to the file
    fs.writeFile('messages.txt', JSON.stringify(messages), (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
      }
    });

    // Redirect back to the chat page
    res.redirect('/chat');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
