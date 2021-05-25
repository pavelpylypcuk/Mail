document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Make POST request to '/emails/'
  document.querySelector('#compose-form').addEventListener('submit', function(event) {
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
      }
  })
  .catch(error => {
    console.log('Error:', error);
})
});

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
    // Print emails
    emails.forEach(function(email) {
      console.log(email)
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
      if (email.read) {
        element.style.background = "LightGray"
      }
      element.addEventListener('click', function() {
        return view_email(email.id);
      })

      if (document.querySelector('h3').innerHTML == 'Inbox') {
        archived.addEventListener('click', function() {
          fetch(`emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })
          return load_mailbox('inbox');
        })
      } else if (document.querySelector('h3').innerHTML == 'Archive') {
        archived.innerHTML = "Unarchive";
        archived.addEventListener('click', function() {
          fetch(`emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })
          return load_mailbox('inbox');
        })
      } else {
        archived.style.display = "none"
      }
      
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
  
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(function(email) {
    console.log(email);
    const item = document.createElement('div');
    item.innerHTML = `<p><strong>From: </strong>${email.sender}</p> <p><strong>To: </strong>${email.recipients}</p> <p><strong>Subject: </strong>${email.subject}</p> 
      <p><strong>Timestamp: </strong>${email.timestamp}</p> <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button> <br><hr> <div>${email.body}</div>`;
    
    document.querySelector('#read-view').append(item);

    document.querySelector("#reply").addEventListener('click', function() {
      item.style.background = "white";
    });
  })

  fetch(`emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function archive_fetch(mailbox) {
  if (mailbox == "inbox") {
    fetch(`emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  } else {
    fetch(`emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }
}