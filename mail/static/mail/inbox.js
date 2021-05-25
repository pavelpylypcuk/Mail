document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('compose'));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(status) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';

  // store recipient and body input fields in variables
  recipient = document.getElementById('compose-recipients');
  body = document.getElementById('compose-body');
  // if user clicks on compose button, all fields in the form are cleared
  if (status === 'compose') {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = "";
    document.querySelector('#compose-subject').value = "";
    document.querySelector('#compose-body').value = "";
    recipient.focus();
  // if user clicks on reply button, body field is autofocused to the first empty line in text area
  } else if (status === 'reply') {
      body.focus();
      body.scrollTo(0, 0)
      body.setSelectionRange(0,0);
  }
  
  // delete previous error message when clicking on compose or reply button
  if (document.querySelector("#recipient_box").contains(document.getElementById('error_msg'))) {
      document.getElementById("error_msg").remove()
    }
    // create a div within email composition form and display error if there is one
    const error_message = document.createElement('div');
    error_message.id = "error_msg"
    error_message.style.display = "inline";
    error_message.style.color = "red"
    error_message.innerHTML = ""

    

  // Make POST request to '/emails/' via the callback function
  callback(error_message);

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Make GET request to 'emails/mailbox'
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Loop over each existing email in selected mailbox
    emails.forEach(function(email) {
      console.log(email)
      // create multiple elements in order to display existing emails and change style properties of these elements
      const element = document.createElement('div');
      const archived = document.createElement('button');
      const email_box = document.createElement('div');
      const button_box = document.createElement('div');
      button_box.id = "button_box"
      button_box.style.margin = "15px"
      email_box.id = "email_box"
      email_box.style.display = 'flex'
      archived.id = "archive_button"
      archived.innerHTML = "Archive"
      archived.className = "btn btn-sm btn-outline-primary";
      element.innerHTML = `<div><strong>${email.sender}</strong></div> <div>${email.subject}</div> <div>${email.timestamp}</div>`;
      element.style.display = 'flex';
      element.style.justifyContent = 'space-between';
      element.style.width = "80%";
      element.style.border = "solid 0.2px";
      element.style.marginBottom = "10px";
      element.style.marginTop = "10px";
      element.style.padding = "10px";
      element.onmouseover = element.style.cursor = "pointer";
      // if emails is read, change its color to gray
      if (email.read) {
        element.style.background = "LightGray"
      }
      // display content of an email when its clicked
      element.addEventListener('click', function() {
        return view_email(email.id);
      })
      // Display archive button and call archive function upon clicking the button when in inbox
      if (document.querySelector('h3').innerHTML == 'Inbox') {
        archived.addEventListener('click', function() {
          archive_fetch("inbox", email.id)
        })
      // If document already archived, display unarchive button and call archive function upon clicking the button when in archive mailbox
      } else if (document.querySelector('h3').innerHTML == 'Archive') {
        archived.innerHTML = "Unarchive";
        archived.addEventListener('click', function() {
          archive_fetch("archive", email.id)
        })
      // Do not display archive/unarchive button in sent mailbox
      } else {
        archived.style.display = "none"
      }
      // appened elements to the emails-view div
      button_box.append(archived);
      email_box.append(element);
      email_box.append(button_box)
      document.querySelector('#emails-view').append(email_box);
      });

  });

}

function view_email(email_id) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'block';
  document.querySelector('#read-view').innerHTML = "";
  
  // request selected email via GET function
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(function(email) {
    console.log(email);
    // create new div and insert required email data
    const item = document.createElement('div');
    item.innerHTML = `<p><strong>From: </strong>${email.sender}</p> <p><strong>To: </strong>${email.recipients}</p> <p><strong>Subject: </strong>${email.subject}</p> 
      <p><strong>Timestamp: </strong>${email.timestamp}</p> <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button> <br><hr> <div id="body_box">${email.body}</div>`;
    
    // append the new div to the read-view div
    document.querySelector('#read-view').append(item);

    // upon clicking reply, pre-fill email composition form with current email data and call compose_email function
    document.querySelector("#reply").addEventListener('click', function() {
      document.querySelector('#compose-recipients').value = email.sender;
      if (JSON.stringify(email.subject).includes('Re:')) {
        document.querySelector('#compose-subject').value = `${email.subject}`;
      }
      else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }
      document.querySelector('#compose-body').value = `\n${"_".repeat(80)}\nOn ${email.timestamp} ${email.sender} wrote:\n\n${email.body}`;
      return compose_email('reply');
    });
  })

  // when viewing current email, mark it as read via the PUT request
  fetch(`emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function archive_fetch(mailbox, email_id) {

  // if function called via inbox, mark email as archived
  if (mailbox == "inbox") {
    fetch(`emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .then(response => response)
    .then(data => {
      console.log(data);
      return load_mailbox("inbox")
    })
    .catch(error => {
      console.log('Error:', error);
  });
  // if function called via archive mailbox, mark email as unarchived
  } else {
    fetch(`emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    .then(response => response)
    .then(function() {
      return load_mailbox("inbox")
    })
    .catch(error => {
      console.log('Error:', error);
  });
  }
}

function callback(error_message) {
  // send a post request upon submitting the form
  document.querySelector('#compose-form').addEventListener('submit', function (event) {
    console.log(error_message)
    event.preventDefault();
    stat = 0;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(function(response) {
    stat = response.status;
    return response.json()
  })
  .then(data => {
      // Print result
      console.log(data);
      // If email sent successfully, redirect to 'sent' emails folder
      if (stat === 201) {
        return load_mailbox('sent')
      // print an error message into HTML
      } else {
        if (error_message.innerHTML == "" || JSON.stringify(data) != message) {
          message = JSON.stringify(data)
          msg = message.replace("{", "")
          msg = msg.replace("}", "")
          msg = msg.replace(/("|')/g, "")
          msg = msg.replace(":", ": ")
          error_message.innerHTML = msg
          document.querySelector("#recipient_box").append(error_message)
        }
        // recursively call its own function if there was an error with sending email
        return callback(error_message);
      }
  })
  }, {
    once:true
  }); 
}