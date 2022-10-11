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

var details_added = false;

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    if (mailbox === 'sent'){
      fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
        console.log(emails);

        // adding the email to the sent view

        for(let i = 0; i < emails.length; i++){
          const element = document.createElement('div');
          element.style.cssText = "border: 2px solid black; padding: 5px; margin: 4px";
          element.innerHTML = emails[i].recipients + " " + emails[i].subject + " " + emails[i].timestamp;
          document.querySelector('#emails-view').append(element);
          
        }
        console.log(emails.length)
      });
    }

    else if (mailbox === 'inbox'){
      fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
        console.log(emails);

        // adding the email to the sent view

        for(let i = 0; i < emails.length; i++){

          const element = document.createElement('div');
          element.innerHTML = emails[i].sender + " " + emails[i].subject + " " + emails[i].timestamp;

          element.addEventListener('click', function() {

            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#details').style.display = 'block';

            if(details_added === false){
              const elem = document.createElement('div');
              elem.innerHTML = emails[i].subject;
              document.querySelector('#details').append(elem);
              details_added = true;
            }
            console.log("clicked!");
          });

          element.style.cssText = "border: 2px solid black; padding: 5px; margin: 4px";
          document.querySelector('#emails-view').append(element);
        }
        console.log(emails.length)
      });
    }
}

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

      // TODO: need to fix the issue of emails getting doubled.
    }
});