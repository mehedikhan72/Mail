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
  document.querySelector('#details').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);

    // adding the email to the sent view
    
    for(let i = 0; i < emails.length; i++){
      const element = document.createElement('div');

      if(emails[i].read === false){
        element.innerHTML = `<strong><div style='gap: 6px; display: flex; justify-content: space-between; '> 
                              <span>${emails[i].sender}</span>
                              <span style='width: 65%;'>${emails[i].subject} </span>
                              <span style="width: fit-content">${emails[i].timestamp}</span>
                            </div></strong>`;
      }
      else{
        element.innerHTML = `<div style='gap: 6px; display: flex; justify-content: space-between;'> 
                            <span>${emails[i].sender}</span>
                            <span style='width: 65%'>${emails[i].subject} </span>
                            <span style="width: fit-content">${emails[i].timestamp}</span>
                          </div>`;
      }

      // document.querySelector('#details').append(elem);

      let current_id = emails[i].id;

      element.addEventListener('click', () => show_details(mailbox, current_id));

      console.log("clicked!");

      element.style.cssText = "border: 2px solid black; padding: 5px; margin: 4px";
      document.querySelector('#emails-view').append(element);
    }
    console.log(emails.length)
  });
}

// Composing and sending emails
document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#compose-form').onsubmit = () => {
      let recipients = document.querySelector('#compose-recipients').value;
      let subject = document.querySelector('#compose-subject').value;
      let body = document.querySelector('#compose-body').value;

      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body,
        })
      })
      .then(response => response.json())
      .then(result =>{
        console.log(result);
        load_mailbox('sent');
      });

      return false;
    }
});

function reply(id){
  document.querySelector('#compose-body').value = '';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    console.log(email);
    // viewing the composition if the user clicked on reply
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#details').style.display = 'none'; 
    document.querySelector('#compose-view').style.display = 'block';

    // Pre-defining some of the data
    document.querySelector('#compose-recipients').value = email.sender;
    existing_subject = email.subject;

    document.querySelector('#compose-subject').value = `Replying to ${email.sender}'s email sent on ${email.timestamp}`;
    document.querySelector('#compose-body').value = '';

    // Sending the email
    document.querySelector('#compose-form').onsubmit = () => {
      let recipients = document.querySelector('#compose-recipients').value;
      let subject = document.querySelector('#compose-subject').value;
      let body = document.querySelector('#compose-body').value;

      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body,
        })
      })
      .then(response => response.json())
      .then(result =>{
        console.log(result);
        load_mailbox('sent');
      });
      return false;
    }
  })
}

// div for showing details of a particular email.
const elem = document.createElement('div');

function show_details(mailbox, id){

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#details').style.display = 'block';
      
    if(mailbox === 'inbox'){
      elem.innerHTML = "";
      elem.innerHTML = `<div style="padding: 0px; margin: 0px; font-size: 1.2rem;"><p><strong>From: </strong>${email.sender}</p>
        <p><strong>To: </strong>${email.recipients}</p><p><strong>Subject: </strong>${email.subject}</p>
        <p><strong>Timestamp: </strong>${email.timestamp}</p><button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
        <hr style="border-top: 2px solid black"><p>${email.body}</p><hr style="border-top: 2px solid black">
        <button class="btn btn-sm btn-outline-primary" id="archive">Archive</button></div>`;
    }

    else if(mailbox === 'archive'){
      elem.innerHTML = "";
      elem.innerHTML = `<div style="padding: 0px; margin: 0px; font-size: 1.2rem;"><p><strong>From: </strong>${email.sender}</p>
        <p><strong>To: </strong>${email.recipients}</p><p><strong>Subject: </strong>${email.subject}</p>
        <p><strong>Timestamp: </strong>${email.timestamp}</p><button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
        <hr style="border-top: 2px solid black"><p>${email.body}</p><hr style="border-top: 2px solid black">
        <button class="btn btn-sm btn-outline-primary" id="unarchive">Unarchive</button></div>`;
    }

    else{
      elem.innerHTML = "";
      elem.innerHTML = `<div style="padding: 0px; margin: 0px; font-size: 1.2rem;"><p><strong>From: </strong>${email.sender}</p>
        <p><strong>To: </strong>${email.recipients}</p><p><strong>Subject: </strong>${email.subject}</p>
        <p><strong>Timestamp: </strong>${email.timestamp}</p><button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
        <hr style="border-top: 2px solid black"><p>${email.body}</p></div>`;
    }
    document.querySelector('#details').append(elem);
    document.querySelector('#reply').addEventListener('click', () => reply(id));

    if(mailbox === 'inbox'){
      document.querySelector('#archive').addEventListener('click', function(){
        fetch(`emails/${id}`,{
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })
        // .then(load_mailbox('archive'));
        .then(function() {
          load_mailbox('archive');
        })
      })
    }

    else if(mailbox === 'archive'){
      document.querySelector('#unarchive').addEventListener('click', function(){
        fetch(`emails/${id}`,{
          method: 'PUT',/*  */
          body: JSON.stringify({
            archived: false
          })
        })
        .then( function() {
          load_mailbox('inbox');
        })
      })
    }
  })

  fetch(`emails/${id}`,{
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

